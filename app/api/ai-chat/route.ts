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
  const parsedRequest = await parseAiChatRequest(request);

  if (isResponse(parsedRequest)) {
    return parsedRequest;
  }

  const { messages, sessionId } = parsedRequest;
  const latestUserMessage = getLatestUserMessage(messages);

  if (!latestUserMessage) {
    return Response.json(
      { error: "最后一条消息必须是带文本内容的用户消息" },
      { status: 400 },
    );
  }

  const bundlePromise = getSessionBundle(sessionId);
  const bundle = await bundlePromise;

  if (!bundle) {
    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  await addMessage({
    sessionId,
    role: latestUserMessage.role,
    agent: "conversation",
    content: latestUserMessage.content,
  });

  await renameSessionIfUntitled(sessionId, latestUserMessage.content);

  let result;

  try {
    result = await createConversationStream({
      bundle,
      messages,
      abortSignal: request.signal,
    });
  } catch (error) {
    return serverError("对话模型初始化失败", error);
  }

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
    onFinish: ({ isAborted, responseMessage }) => {
      if (isAborted) {
        return;
      }

      after(async () => {
        await persistAssistantMessage(sessionId, responseMessage).catch(
          () => undefined,
        );
      });
    },
    onError: () => "对话生成失败",
  });
}
