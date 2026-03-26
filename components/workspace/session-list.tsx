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
    <Card className="overflow-hidden border-border/70 bg-background xl:min-h-[40rem]">
      <CardHeader className="gap-4 border-b bg-muted/20 pb-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>继续最近工作区</CardTitle>
            {totalSessions > 0 ? (
              <Badge
                variant="outline"
                className="text-[11px] uppercase tracking-[0.18em]"
              >
                最近 {sessions.length} / 共 {totalSessions}
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            {totalSessions === 0
              ? "创建第一个会话后，这里会保留最近的消息、资料和报表状态。"
              : "默认优先展示最近更新的工作区，回来就能继续当前上下文。"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {sessions.length === 0 ? (
          <Card className="flex min-h-72 flex-col items-center justify-center gap-4 border-dashed bg-muted/10 text-center">
            <div className="space-y-2">
              <h3 className="text-base font-medium">还没有最近工作区</h3>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                先创建一个会话，再开始对话、上传文件和生成报表；之后首页会自动保留最近上下文。
              </p>
            </div>
            <Button onClick={onCreateSession} disabled={isCreating}>
              {isCreating ? "正在创建…" : "创建第一个会话"}
            </Button>
          </Card>
        ) : (
          <>
            {featuredSession ? (
              <Link
                href={`/sessions/${featuredSession.id}`}
                className="group block"
              >
                <Card className="bg-muted/20 transition-colors group-hover:bg-muted/30">
                  <CardHeader className="gap-4 border-b border-border/70 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <CardDescription className="text-[11px] uppercase tracking-[0.22em]">
                          最近恢复入口
                        </CardDescription>
                        <CardTitle className="text-base leading-7 sm:text-lg">
                          {featuredSession.title}
                        </CardTitle>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        继续工作区
                      </span>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                      直接恢复最近消息、上传资料与报表上下文，减少重新定位问题的成本。
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          更新时间
                        </p>
                        <p className="text-sm font-medium leading-6">
                          {formatTimestamp(featuredSession.updatedAt)}
                        </p>
                      </div>
                      <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          当前 Agent
                        </p>
                        <p className="text-sm font-medium leading-6">
                          {getAgentLabel(featuredSession.lastActiveAgent)}
                        </p>
                      </div>
                      <div className="space-y-1 border border-border/70 bg-background/80 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          报表状态
                        </p>
                        <p className="text-sm font-medium leading-6">
                          {featuredSession.latestReportId ? "已有报表" : "待生成报表"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                  </CardContent>
                </Card>
              </Link>
            ) : null}

            {remainingSessions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    其他最近会话
                  </p>
                  <p className="text-xs text-muted-foreground">
                    仍按最近更新时间排序。
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {remainingSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="group block h-full"
                    >
                      <Card
                        size="sm"
                        className="h-full bg-background transition-colors group-hover:bg-muted/30"
                      >
                        <CardContent className="space-y-3 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-medium leading-6 group-hover:underline">
                                {session.title}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                更新于 {formatTimestamp(session.updatedAt)}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
