import {
  consumeStream,
} from "ai";
import { after } from "next/server";

import {
  createConversationStream,
  getLatestUserMessage,
} from "@/lib/agents/ai-sdk-chat";
import {
  parseAiChatRequest,
  persistAssistantMessage,
} from "@/lib/chat/ai-chat-route";
import {
  addMessage,
  getSessionBundle,
  renameSessionIfUntitled,
} from "@/lib/storage/repository";
import { isResponse, serverError } from "@/lib/utils/http";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const requestStartedAt = Date.now();
  const parsedRequest = await parseAiChatRequest(request);

  if (isResponse(parsedRequest)) {
    console.warn("AI chat request validation failed");
    return parsedRequest;
  }

  const { messages, sessionId } = parsedRequest;
  const requestId = `ai-chat:${sessionId}:${requestStartedAt}`;
  const latestUserMessage = getLatestUserMessage(messages);

  console.info("AI chat request received", {
    requestId,
    sessionId,
    messageCount: messages.length,
    latestMessageRole: messages[messages.length - 1]?.role ?? null,
  });

  if (!latestUserMessage) {
    console.warn("AI chat request missing valid latest user message", {
      requestId,
      sessionId,
      messageCount: messages.length,
    });

    return Response.json(
      { error: "最后一条消息必须是带文本内容的用户消息" },
      { status: 400 },
    );
  }

  const bundlePromise = getSessionBundle(sessionId);
  const bundle = await bundlePromise;

  if (!bundle) {
    console.warn("AI chat session not found", {
      requestId,
      sessionId,
    });

    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  await addMessage({
    sessionId,
    role: latestUserMessage.role,
    agent: "conversation",
    content: latestUserMessage.content,
  });

  await renameSessionIfUntitled(sessionId, latestUserMessage.content);

  console.info("AI chat user message stored", {
    requestId,
    sessionId,
    content: latestUserMessage.content,
    historyMessageCount: bundle.messages.length,
    latestUserMessageLength: latestUserMessage.content.length,
  });

  let result;

  try {
    result = await createConversationStream({
      bundle,
      messages,
      abortSignal: request.signal,
    });

    console.info("AI chat stream initialized", {
      requestId,
      sessionId,
      elapsedMs: Date.now() - requestStartedAt,
    });
  } catch (error) {
    console.error("AI chat stream initialization failed", {
      requestId,
      sessionId,
      elapsedMs: Date.now() - requestStartedAt,
      error,
    });

    return serverError("对话模型初始化失败", error);
  }

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
    onFinish: ({ isAborted, responseMessage }) => {
      if (isAborted) {
        console.warn("AI chat stream aborted", {
          requestId,
          sessionId,
          elapsedMs: Date.now() - requestStartedAt,
        });

        return;
      }

      console.info("AI chat stream finished", {
        requestId,
        sessionId,
        responseMessageId: responseMessage.id,
        elapsedMs: Date.now() - requestStartedAt,
      });

      after(async () => {
        try {
          const persistResult = await persistAssistantMessage(sessionId, responseMessage);

          console.info("AI chat assistant message persisted", {
            requestId,
            sessionId,
            persisted: persistResult.persisted,
            contentLength: persistResult.contentLength,
          });
        } catch (error) {
          console.error("AI chat assistant message persist failed", {
            requestId,
            sessionId,
            error,
          });
        }
      });
    },
    onError: (error) => {
      console.error("AI chat stream failed", {
        requestId,
        error,
        sessionId,
        elapsedMs: Date.now() - requestStartedAt,
      });

      return "对话生成失败";
    },
  });
}
