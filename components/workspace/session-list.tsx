import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

interface SessionListProps {
  sessions: SessionRecord[];
  totalSessions: number;
  isCreating: boolean;
  onCreateSession: () => void;
}

export function SessionList({
  sessions,
  totalSessions,
  isCreating,
  onCreateSession,
}: SessionListProps) {
  const [featuredSession, ...remainingSessions] = sessions;

  return (
    <Card className="overflow-hidden border-border/70 bg-background">
      <CardHeader className="gap-4 border-b bg-muted/20 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg sm:text-xl">继续最近工作区</CardTitle>
              {totalSessions > 0 ? (
                <Badge
                  variant="outline"
                  className="text-[11px] uppercase tracking-[0.18em]"
                >
                  最近 {sessions.length} / 共 {totalSessions}
                </Badge>
              ) : null}
            </div>
            <CardDescription className="text-sm leading-7 sm:text-base">
              {totalSessions === 0
                ? "创建第一个工作区后，这里会保留最近的消息、资料和报表状态。"
                : "默认优先展示最近更新的工作区，回来就能继续当前上下文。"}
            </CardDescription>
          </div>
          {sessions.length > 0 ? (
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              最近恢复入口
            </p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 lg:space-y-5 lg:p-5">
        {sessions.length === 0 ? (
          <Card className="flex min-h-80 flex-col items-center justify-center gap-4 border-dashed bg-muted/10 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-medium sm:text-xl">还没有最近工作区</h3>
              <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                先创建一个会话，再开始对话、上传文件和生成报表；之后首页会自动保留最近上下文。
              </p>
            </div>
            <Button onClick={onCreateSession} disabled={isCreating} size="lg" className="text-sm sm:text-base">
              {isCreating ? "正在创建…" : "创建第一个工作区"}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.72fr)]">
            {featuredSession ? (
              <Link
                href={`/sessions/${featuredSession.id}`}
                className="group block h-full"
              >
                <Card className="relative h-full overflow-hidden border-border/70 bg-muted/20 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-muted/35 group-hover:ring-foreground/20">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_42%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <CardHeader className="gap-5 border-b border-border/70 pb-5 sm:pb-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <CardDescription className="text-[11px] uppercase tracking-[0.22em]">
                          Resume Launcher
                        </CardDescription>
                        <CardTitle className="text-3xl leading-tight tracking-tight transition-transform duration-200 group-hover:translate-x-0.5 sm:text-4xl lg:text-[2.75rem]">
                          {featuredSession.title}
                        </CardTitle>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                        继续工作区
                      </span>
                    </div>
                    <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                      直接恢复最近消息、上传资料与报表上下文，回到上一次分析停下来的位置。
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] uppercase tracking-[0.18em]"
                      >
                        {getAgentLabel(featuredSession.lastActiveAgent)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[11px] uppercase tracking-[0.18em]"
                      >
                        {featuredSession.latestReportId ? "已有报表" : "待生成报表"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 py-5 sm:space-y-6 sm:py-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3 transition-colors duration-200 group-hover:bg-background">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          更新时间
                        </p>
                        <p className="text-base font-medium leading-7 sm:text-lg">
                          {formatTimestamp(featuredSession.updatedAt)}
                        </p>
                      </div>
                      <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3 transition-colors duration-200 group-hover:bg-background">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          当前 Agent
                        </p>
                        <p className="text-base font-medium leading-7 sm:text-lg">
                          {getAgentLabel(featuredSession.lastActiveAgent)}
                        </p>
                      </div>
                      <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3 transition-colors duration-200 group-hover:bg-background">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          报表状态
                        </p>
                        <p className="text-base font-medium leading-7 sm:text-lg">
                          {featuredSession.latestReportId ? "已有报表" : "待生成报表"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border border-border/70 bg-background/90 px-4 py-4 transition-all duration-200 group-hover:border-foreground/20 group-hover:bg-background sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          快速进入
                        </p>
                        <p className="text-base font-medium leading-7 sm:text-lg">
                          打开这个工作区，继续当前上下文。
                        </p>
                      </div>
                      <div className="inline-flex h-10 items-center justify-center border border-border px-4 text-sm font-medium uppercase tracking-[0.2em] text-foreground transition-all duration-200 group-hover:border-foreground/20 group-hover:bg-muted sm:text-[13px]">
                        Open Workspace
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {remainingSessions.length > 0 ? "其他最近会话" : "当前仅有一个工作区"}
                </p>
                {remainingSessions.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    仍按最近更新时间排序。
                  </p>
                ) : null}
              </div>

              {remainingSessions.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {remainingSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="group block h-full"
                    >
                      <Card
                        size="sm"
                        className="h-full border-border/70 bg-background transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-muted/30 group-hover:ring-foreground/20"
                      >
                        <CardContent className="space-y-3 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <p className="text-base font-medium leading-7 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:underline">
                                {session.title}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                更新于 {formatTimestamp(session.updatedAt)}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                              继续
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="text-[11px] uppercase tracking-[0.18em]"
                            >
                              {getAgentLabel(session.lastActiveAgent)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[11px] uppercase tracking-[0.18em]"
                            >
                              {session.latestReportId ? "已有报表" : "待生成报表"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed bg-muted/10">
                  <CardContent className="py-5 text-sm leading-7 text-muted-foreground sm:text-base">
                    继续在这个工作区里对话、补充资料或生成报表，新的上下文会持续累积在同一个入口里。
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
