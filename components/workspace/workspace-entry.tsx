"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { HeroSection } from "@/components/workspace/hero-section";
import { SessionList } from "@/components/workspace/session-list";
import type { SessionRecord } from "@/lib/domain/types";

export function WorkspaceEntry({
  sessions,
  totalSessions,
}: {
  sessions: SessionRecord[];
  totalSessions: number;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateSession() {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as
        | { session?: SessionRecord; error?: string }
        | undefined;

      if (!response.ok || !payload?.session) {
        throw new Error(payload?.error || "创建会话失败");
      }

      router.push(`/sessions/${payload.session.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "创建会话失败",
      );
      setIsCreating(false);
    }
  }

  const sessionsWithReports = sessions.filter((session) => session.latestReportId)
    .length;
  const latestSessionUpdatedAt = sessions[0]?.updatedAt ?? null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.24fr)_400px] xl:items-start xl:gap-5">
        <HeroSection
          isCreating={isCreating}
          error={error}
          onCreateSession={handleCreateSession}
          totalSessions={totalSessions}
          sessionsWithReports={sessionsWithReports}
          latestSessionUpdatedAt={latestSessionUpdatedAt}
        />
        <SessionList
          sessions={sessions}
          totalSessions={totalSessions}
          isCreating={isCreating}
          onCreateSession={handleCreateSession}
        />
      </div>
    </main>
  );
}
