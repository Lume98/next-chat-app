import {
  addMessage,
  getSessionBundle,
  renameSessionIfUntitled,
} from "@/lib/storage/repository";
import { generateConversationReply } from "@/lib/agents/anthropic";

export const runtime = "nodejs";

type ChatRequest = {
  sessionId?: unknown;
  content?: unknown;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: ChatRequest;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return badRequest("请求体必须是有效 JSON");
  }

  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.trim() : "";
  const content = typeof payload.content === "string" ? payload.content.trim() : "";

  if (!sessionId) {
    return badRequest("缺少 sessionId");
  }

  if (!content) {
    return badRequest("消息内容不能为空");
  }

  const bundle = await getSessionBundle(sessionId);

  if (!bundle) {
    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  const userMessage = await addMessage({
    sessionId,
    role: "user",
    agent: "conversation",
    content,
  });

  const renamedSession = await renameSessionIfUntitled(sessionId, content);
  const history = [...bundle.messages, userMessage];
  const reply = await generateConversationReply({
    session: renamedSession ?? bundle.session,
    history,
    uploads: bundle.uploads,
    reports: bundle.reports,
    latestUserMessage: content,
  });

  const assistantMessage = await addMessage({
    sessionId,
    role: "assistant",
    agent: "conversation",
    content: reply,
  });

  return Response.json({
    session: renamedSession ?? bundle.session,
    userMessage,
    assistantMessage,
  });
}
