"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { HeroSection } from "@/components/workspace/hero-section";
import { SessionList } from "@/components/workspace/session-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

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
  const latestSession = sessions[0] ?? null;
  const latestSessionUpdatedAt = latestSession?.updatedAt ?? null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-5">
        <section className="space-y-5 lg:space-y-6">
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
        </section>

        <aside className="space-y-4 xl:sticky xl:top-5">
          <Card className="relative overflow-hidden border-border/70 bg-background">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            <CardHeader className="gap-4 border-b bg-muted/20 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Status Rail
                  </p>
                  <CardTitle className="text-base leading-6 sm:text-lg">
                    首页现在更像工作区启动台。
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="text-[11px] uppercase tracking-[0.18em]"
                >
                  Status Panel
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-4 text-sm leading-6 text-muted-foreground">
              <p>首页只保留两条主路径：新建工作区，或继续最近一次活跃上下文。</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 border border-border/70 bg-muted/20 px-3 py-3 text-foreground">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      主路径一
                    </p>
                    <p className="text-sm font-medium leading-5">
                      新建工作区
                    </p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    立即进入
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border border-border/70 bg-background px-3 py-3 text-foreground">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      主路径二
                    </p>
                    <p className="text-sm font-medium leading-5">
                      继续最近工作区
                    </p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {latestSession ? "恢复上下文" : "创建后可用"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/70 bg-muted/20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%)]" />
            <CardHeader className="gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    最近状态
                  </p>
                  <CardTitle className="text-base leading-6 sm:text-lg">
                    {latestSession ? latestSession.title : "还没有最近工作区"}
                  </CardTitle>
                </div>
                {latestSession ? (
                  <Badge
                    variant="outline"
                    className="text-[11px] uppercase tracking-[0.18em]"
                  >
                    {getAgentLabel(latestSession.lastActiveAgent)}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
              <CardContent className="space-y-3 py-4 text-sm leading-6 text-muted-foreground">
              {latestSession ? (
                <>
                  <div className="border border-border/70 bg-background/90 px-3 py-3 text-foreground">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      最近恢复入口
                    </p>
                    <p className="mt-1 text-sm font-medium leading-6">
                      这是当前默认优先恢复的工作区。
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3 text-foreground">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        最近更新
                      </p>
                      <p className="text-base font-medium leading-7">
                        {formatTimestamp(latestSession.updatedAt)}
                      </p>
                    </div>
                    <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3 text-foreground">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        报表状态
                      </p>
                      <p className="text-base font-medium leading-7">
                        {latestSession.latestReportId ? "已有报表" : "待生成报表"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border border-dashed border-border/70 bg-background/70 px-3 py-4">
                  <p>创建第一个工作区后，这里会开始展示最近一次活跃状态。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
