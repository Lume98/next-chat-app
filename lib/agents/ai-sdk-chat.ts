import "server-only";

import { convertToModelMessages, streamText, type UIMessage } from "ai";

import type {
  MessageRecord,
  ReportArtifact,
  SessionBundle,
  UploadRecord,
} from "@/lib/domain/types";

export const AI_GATEWAY_CONVERSATION_MODEL = "anthropic/claude-sonnet-4.6";

function summarizeWorkspace(uploads: UploadRecord[], reports: ReportArtifact[]) {
  const uploadSummary = uploads.length
    ? uploads
        .map((upload) => `- ${upload.fileName}: ${upload.summary}`)
        .join("\n")
    : "- 当前没有上传文件";

  const reportSummary = reports.length
    ? reports
        .slice(0, 3)
        .map((report) => `- ${report.title}: ${report.summary}`)
        .join("\n")
    : "- 当前没有报表";

  return [`上传文件:`, uploadSummary, "", `已有报表:`, reportSummary].join("\n");
}

function toStoredRole(role: UIMessage["role"]): MessageRecord["role"] {
  if (role === "assistant" || role === "system") {
    return role;
  }

  return "user";
}

export function extractTextFromUIMessage(message: UIMessage) {
  return message.parts
    .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function getLatestUserMessage(messages: UIMessage[]) {
  const latestMessage = messages[messages.length - 1];

  if (!latestMessage || latestMessage.role !== "user") {
    return null;
  }

  const content = extractTextFromUIMessage(latestMessage);

  if (!content) {
    return null;
  }

  return {
    content,
    role: toStoredRole(latestMessage.role),
  };
}

export async function createConversationStream(input: {
  bundle: SessionBundle;
  messages: UIMessage[];
  abortSignal: AbortSignal;
}) {
  const modelMessages = await convertToModelMessages(input.messages);

  return streamText({
    model: AI_GATEWAY_CONVERSATION_MODEL,
    abortSignal: input.abortSignal,
    system: [
      "你是一个 AI 多 Agent 应用中的对话 Agent。",
      "你的职责是回答用户问题、结合当前会话里的上传文件和报表上下文提供建议。",
      "回答要简洁、直接、适合产品内聊天场景。",
      "如果用户需要结构化结论或数据总结，可以建议其生成报表。",
      "当前工作空间摘要如下：",
      summarizeWorkspace(input.bundle.uploads, input.bundle.reports),
    ].join("\n\n"),
    messages: modelMessages,
  });
}
