import type { Metadata } from "next";
import { connection } from "next/server";

import { ChatEntry } from "@/components/chat/chat-entry";
import { messageRecordsToUIMessages } from "@/lib/chat/ui-messages";
import { getSessionBundle, listSessions } from "@/lib/storage/repository";

export const metadata: Metadata = {
  title: "Chat",
  description: "在独立 Chat 页面内直接切换会话并消费流式回复。",
};

async function getChatPageData() {
  await connection();

  const sessions = await listSessions();
  const initialBundle = sessions[0]
    ? await getSessionBundle(sessions[0].id)
    : null;

  return {
    recentSessions: sessions.slice(0, 8),
    totalSessions: sessions.length,
    initialSession: initialBundle?.session ?? null,
    initialMessages: initialBundle
      ? messageRecordsToUIMessages(initialBundle.messages)
      : [],
  };
}

export default async function ChatPage() {
  const { recentSessions, totalSessions, initialSession, initialMessages } =
    await getChatPageData();

  return (
    <main className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.12),transparent_30%),linear-gradient(180deg,transparent,rgba(15,23,42,0.03))]">
      <div className="h-full min-h-0 w-full">
        <ChatEntry
          sessions={recentSessions}
          totalSessions={totalSessions}
          initialSession={initialSession}
          initialMessages={initialMessages}
        />
      </div>
    </main>
  );
}
