import "server-only";

import type { UIMessage } from "ai";

import { extractTextFromUIMessage } from "@/lib/agents/ai-sdk-chat";
import { addMessage } from "@/lib/storage/repository";
import { badRequest } from "@/lib/utils/http";

type AiChatRequest = {
  sessionId?: unknown;
  messages?: unknown;
};

export type ParsedAiChatRequest = {
  messages: UIMessage[];
  sessionId: string;
};

export type PersistAssistantMessageResult = {
  contentLength: number;
  persisted: boolean;
};

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return Array.isArray(value);
}

export async function parseAiChatRequest(
  request: Request,
): Promise<ParsedAiChatRequest | Response> {
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

  return {
    messages: payload.messages,
    sessionId,
  };
}

export async function persistAssistantMessage(
  sessionId: string,
  responseMessage: UIMessage,
): Promise<PersistAssistantMessageResult> {
  const content = extractTextFromUIMessage(responseMessage);

  if (!content) {
    return {
      contentLength: 0,
      persisted: false,
    };
  }

  await addMessage({
    sessionId,
    role: "assistant",
    agent: "conversation",
    content,
  });

  return {
    contentLength: content.length,
    persisted: true,
  };
}
