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
    <Card className="overflow-hidden border-border/50 bg-gradient-to-b from-background to-muted/10 shadow-sm">
      <CardHeader className="gap-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl sm:text-2xl">继续最近工作区</CardTitle>
              {totalSessions > 0 ? (
                <Badge
                  variant="outline"
                  className="text-[11px] uppercase tracking-[0.18em]"
                >
                  最近 {sessions.length} / 共 {totalSessions}
                </Badge>
              ) : null}
            </div>
              <CardDescription className="max-w-2xl text-sm leading-7">
              {totalSessions === 0
                ? "创建第一个工作区后，这里会保留最近上下文。"
                : "默认优先展示最近更新的工作区，回来即可继续当前上下文。"}
            </CardDescription>
          </div>
          {sessions.length > 0 ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              主路径二
            </p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 lg:space-y-5 lg:p-5">
        {sessions.length === 0 ? (
          <Card className="flex min-h-72 flex-col items-center justify-center gap-4 border-dashed border-border/40 bg-gradient-to-br from-muted/15 to-background/50 text-center">
            <div className="space-y-2">
              <h3 className="text-xl font-medium sm:text-2xl">还没有最近工作区</h3>
              <p className="max-w-md text-sm leading-7 text-muted-foreground">
                先创建一个工作区，之后就能从这里直接继续最近上下文。
              </p>
            </div>
            <Button
              onClick={onCreateSession}
              disabled={isCreating}
              size="lg"
              className="text-sm sm:text-base"
            >
              {isCreating ? "正在创建…" : "创建第一个工作区"}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.72fr)]">
            {featuredSession ? (
              <Card className="group relative h-full overflow-hidden border-primary/30 bg-gradient-to-br from-primary/8 via-background to-accent/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb),0.08),transparent_50%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative gap-5 border-b border-border/40 pb-5 sm:pb-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        最近恢复入口
                      </CardDescription>
                      <CardTitle className="text-2xl leading-tight tracking-tight sm:text-3xl lg:text-[2.5rem]">
                        <Link
                          href={`/sessions/${featuredSession.id}`}
                          className="transition-colors duration-200 hover:text-foreground/80"
                        >
                          {featuredSession.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[11px] uppercase tracking-[0.18em]"
                    >
                      默认入口
                    </Badge>
                  </div>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    直接回到最近消息、资料和报表所在的上下文，继续上一次分析。
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-5 py-5 sm:space-y-6 sm:py-6">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
                    <div className="space-y-1 border border-border/40 bg-gradient-to-br from-background to-muted/30 px-3 py-3 transition-all hover:border-border/60">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        更新时间
                      </p>
                      <p className="text-base font-medium leading-7">
                        {formatTimestamp(featuredSession.updatedAt)}
                      </p>
                    </div>
                    <div className="space-y-1 border border-border/40 bg-gradient-to-br from-background to-muted/30 px-3 py-3 transition-all hover:border-border/60">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        当前状态
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge
                          variant="outline"
                          className="text-[11px] uppercase tracking-[0.16em]"
                        >
                          {getAgentLabel(featuredSession.lastActiveAgent)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[11px] uppercase tracking-[0.16em]"
                        >
                          {featuredSession.latestReportId ? "已有报表" : "待生成报表"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base leading-7 text-muted-foreground">
                      打开这个工作区，继续当前上下文。
                    </p>
                    <Button asChild size="lg" className="min-w-44 justify-center">
                      <Link href={`/sessions/${featuredSession.id}`}>继续最近工作区</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {remainingSessions.length > 0 ? "其他最近工作区" : "当前仅有一个工作区"}
                </p>
                {remainingSessions.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    按最近更新时间排序。
                  </p>
                ) : null}
              </div>

              {remainingSessions.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {remainingSessions.map((session) => (
                    <Card
                      key={session.id}
                      size="sm"
                      className="h-full border-border/40 bg-gradient-to-r from-background to-muted/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-border/60 hover:bg-gradient-to-r hover:from-primary/5 hover:to-background hover:shadow-md"
                    >
                      <CardContent className="space-y-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="text-lg font-medium leading-7">
                              <Link
                                href={`/sessions/${session.id}`}
                                className="transition-colors duration-200 hover:text-foreground/80 hover:underline"
                              >
                                {session.title}
                              </Link>
                            </p>
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              更新于 {formatTimestamp(session.updatedAt)}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/sessions/${session.id}`}>继续</Link>
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-[11px] uppercase tracking-[0.16em]"
                          >
                            {getAgentLabel(session.lastActiveAgent)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[11px] uppercase tracking-[0.16em]"
                          >
                            {session.latestReportId ? "已有报表" : "待生成报表"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-border/40 bg-gradient-to-br from-muted/10 to-background/30">
                  <CardContent className="py-5 text-base leading-8 text-muted-foreground">
                    继续在这个工作区里对话、补充资料或生成报表，相关上下文都会保留在这里。
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
