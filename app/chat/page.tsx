import type { Metadata } from "next";
import { connection } from "next/server";

import { ChatEntry } from "@/components/workspace/chat-entry";
import { listSessions } from "@/lib/storage/repository";

export const metadata: Metadata = {
  title: "Chat",
  description: "从独立 Chat 页面开始新会话，发送消息或上传资料后自动进入工作区。",
};

async function getChatPageData() {
  await connection();

  const sessions = await listSessions();

  return {
    recentSessions: sessions.slice(0, 8),
    totalSessions: sessions.length,
  };
}

export default async function ChatPage() {
  const { recentSessions, totalSessions } = await getChatPageData();

  return <ChatEntry sessions={recentSessions} totalSessions={totalSessions} />;
}
