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
    <main className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-background">
      {/* Layered atmospheric backgrounds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft warm glow top-left */}
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-[oklch(0.65_0.08_30)] blur-[120px] opacity-40 animate-pulse-slow" />

        {/* Cool accent glow bottom-right */}
        <div className="absolute -right-20 -bottom-20 h-[400px] w-[400px] rounded-full bg-[oklch(0.55_0.12_220)] blur-[100px] opacity-30 animate-float" />

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+')] opacity-50 mix-blend-multiply" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Dramatic edge fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background/80" />
      </div>

      {/* Main content with subtle glass effect */}
      <div className="relative h-full min-h-0 w-full backdrop-blur-[0.5px]">
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
