"use client";

import { useRouter } from "next/navigation";

import { HeroSection } from "@/components/workspace/hero-section";
import { HomeStatusRail } from "@/components/workspace/home-status-rail";
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

  async function handleCreateSession() {
    router.push("/chat");
  }

  const sessionsWithReports = sessions.filter((session) => session.latestReportId)
    .length;
  const latestSession = sessions[0] ?? null;
  const latestSessionUpdatedAt = latestSession?.updatedAt ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 px-4 py-6 text-foreground sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-5">
        <section className="space-y-5 lg:space-y-6">
          <HeroSection
            isCreating={false}
            error={null}
            onCreateSession={handleCreateSession}
            totalSessions={totalSessions}
            sessionsWithReports={sessionsWithReports}
            latestSessionUpdatedAt={latestSessionUpdatedAt}
          />
          <SessionList
            sessions={sessions}
            totalSessions={totalSessions}
            isCreating={false}
            onCreateSession={handleCreateSession}
          />
        </section>

        <HomeStatusRail latestSession={latestSession} />
      </div>
    </main>
  );
}
