import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ReportArtifact, SessionRecord, UploadRecord } from "@/lib/domain/types";

function formatTimestamp(value: string) {
  return value.slice(0, 16).replace("T", " ");
}

function getAgentLabel(agent: SessionRecord["lastActiveAgent"]) {
  if (agent === "report") {
    return "报表 Agent";
  }

  if (agent === "conversation") {
    return "对话 Agent";
  }

  return agent;
}

export function SessionSidebar({
  currentSession,
  sessions,
  uploads,
  reports,
}: {
  currentSession: SessionRecord;
  sessions: SessionRecord[];
  uploads: UploadRecord[];
  reports: ReportArtifact[];
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Workspace
          </Badge>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold tracking-tight">{currentSession.title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              当前会话会共享消息、上传文件与报表结果，刷新后继续保留。
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <Card size="sm" className="bg-sidebar-accent/40">
            <CardContent className="py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                最近活跃
              </p>
              <p className="mt-2 text-sm font-medium">{getAgentLabel(currentSession.lastActiveAgent)}</p>
            </CardContent>
          </Card>
          <Card size="sm" className="bg-sidebar-accent/40">
            <CardContent className="py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                上传文件
              </p>
              <p className="mt-2 text-sm font-medium">{uploads.length} 个</p>
            </CardContent>
          </Card>
          <Card size="sm" className="bg-sidebar-accent/40">
            <CardContent className="py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                报表状态
              </p>
              <p className="mt-2 text-sm font-medium">
                {currentSession.latestReportId ? "已有最新报表" : "尚未生成"}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="flex-1 justify-start bg-transparent">
            <Link href="/">返回首页</Link>
          </Button>
          <Card size="sm" className="min-w-0 flex-1">
            <CardContent className="py-2 text-xs text-muted-foreground">
              <p className="uppercase tracking-[0.2em]">最后更新</p>
              <p className="mt-1 truncate text-sidebar-foreground">
                {formatTimestamp(currentSession.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            最近会话
          </h2>
          <span className="text-xs text-muted-foreground">{sessions.length}</span>
        </div>
        <div className="space-y-2">
          {sessions.slice(0, 8).map((session) => (
            <Link
              key={session.id}
              href={`/sessions/${session.id}`}
              className={cn(
                "block",
                session.id === currentSession.id &&
                  "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Card
                size="sm"
                className={cn(
                  "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  session.id === currentSession.id &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                <CardContent className="py-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-medium">{session.title}</p>
                      {session.id === currentSession.id ? (
                        <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          当前
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatTimestamp(session.updatedAt)}</span>
                      <span>·</span>
                      <span>{getAgentLabel(session.lastActiveAgent)}</span>
                      {session.latestReportId ? (
                        <>
                          <span>·</span>
                          <span>有报表</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            当前状态
          </h2>
          <span className="text-xs text-muted-foreground">{reports.length} 份报表</span>
        </div>
        <div className="space-y-2 text-sm">
          <Card size="sm">
            <CardContent className="flex items-center justify-between gap-4 py-2">
              <span className="text-muted-foreground">最近活跃</span>
              <span>{getAgentLabel(currentSession.lastActiveAgent)}</span>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center justify-between gap-4 py-2">
              <span className="text-muted-foreground">上传文件</span>
              <span>{uploads.length}</span>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center justify-between gap-4 py-2">
              <span className="text-muted-foreground">已生成报表</span>
              <span>{reports.length}</span>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            最近上传
          </h2>
          <span className="text-xs text-muted-foreground">{uploads.length}</span>
        </div>
        <div className="space-y-2 text-sm">
          {uploads.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-4 text-sm text-muted-foreground">
                还没有上传文件。先补充资料，再让对话 Agent 或报表 Agent 继续处理。
              </CardContent>
            </Card>
          ) : (
            uploads
              .slice(-4)
              .reverse()
              .map((upload) => (
                <Card key={upload.id} size="sm">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium">{upload.fileName}</p>
                      <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
                        {upload.kind}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      {upload.summary}
                    </p>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </section>
    </aside>
  );
}
