import type { Metadata } from "next";
import { connection } from "next/server";

import { WorkspaceEntry } from "@/components/workspace/workspace-entry";
import { listSessions } from "@/lib/storage/repository";

const RECENT_SESSION_LIMIT = 8;

export const metadata: Metadata = {
  title: "工作台",
  description: "查看最近会话、报告状态，并从首页快速进入新的 AI 工作流。",
};

async function getHomePageData() {
  await connection();

  const sessions = await listSessions();

  return {
    recentSessions: sessions.slice(0, RECENT_SESSION_LIMIT),
    totalSessions: sessions.length,
  };
}

export default async function HomePage() {
  const { recentSessions, totalSessions } = await getHomePageData();

  return (
    <WorkspaceEntry
      sessions={recentSessions}
      totalSessions={totalSessions}
    />
  );
}
