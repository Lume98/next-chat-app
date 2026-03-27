import {
  consumeStream,
  type UIMessage,
} from "ai";

import {
  createConversationStream,
  extractTextFromUIMessage,
  getLatestUserMessage,
} from "@/lib/agents/ai-sdk-chat";
import {
  addMessage,
  getSessionBundle,
  renameSessionIfUntitled,
} from "@/lib/storage/repository";

export const runtime = "nodejs";
export const maxDuration = 30;

type AiChatRequest = {
  sessionId?: unknown;
  messages?: unknown;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return Array.isArray(value);
}

export async function POST(request: Request) {
  let payload: AiChatRequest;

  try {
    payload = (await request.json()) as AiChatRequest;
  } catch {
    return badRequest("请求体必须是有效 JSON");
  }

  const sessionId =
    typeof payload.sessionId === "string" ? payload.sessionId.trim() : "";

  if (!sessionId) {
    return badRequest("缺少 sessionId");
  }

  if (!isUIMessageArray(payload.messages) || payload.messages.length === 0) {
    return badRequest("messages 必须是非空数组");
  }

  const latestUserMessage = getLatestUserMessage(payload.messages);

  if (!latestUserMessage) {
    return badRequest("最后一条消息必须是带文本内容的用户消息");
  }

  const bundle = await getSessionBundle(sessionId);

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
      messages: payload.messages,
      abortSignal: request.signal,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "对话模型初始化失败",
      },
      { status: 500 },
    );
  }

  return result.toUIMessageStreamResponse({
    originalMessages: payload.messages,
    consumeSseStream: consumeStream,
    onFinish: async ({ isAborted, responseMessage }) => {
      if (isAborted) {
        return;
      }

      const content = extractTextFromUIMessage(responseMessage);

      if (!content) {
        return;
      }

      await addMessage({
        sessionId,
        role: "assistant",
        agent: "conversation",
        content,
      });
    },
  });
}
