"use client";

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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

function SessionListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} size="sm" className="border-border/50">
          <CardContent className="flex flex-col gap-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChatSessionSidebar({
  totalSessions,
  activeSessionTitle,
  sessions,
  activeSessionId,
  isLoadingSession,
  onStartNewChat,
  onSelectSession,
}: {
  totalSessions: number;
  activeSessionTitle: string | null;
  sessions: SessionRecord[];
  activeSessionId: string | null;
  isLoadingSession: boolean;
  onStartNewChat: () => void;
  onSelectSession: (session: SessionRecord) => void;
}) {
  return (
    <aside className="flex flex-col gap-5">
      <Card className="border-border/60 bg-sidebar text-sidebar-foreground shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-[0.24em]"
            >
              Chat
            </Badge>
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-[0.24em]"
            >
              Streaming
            </Badge>
            {isLoadingSession ? (
              <Badge
                variant="outline"
                className="text-xs uppercase tracking-[0.24em]"
              >
                Loading
              </Badge>
            ) : null}
          </div>
          <CardTitle className="text-base font-semibold">独立聊天页</CardTitle>
          <CardDescription>
            当前页面只负责流式对话。历史会话在这里直接切换，不再跳转到工作区页面。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Card size="sm" className="bg-sidebar-accent/60">
            <CardContent className="py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                总会话
              </p>
              <p className="mt-2 text-base font-medium">
                {totalSessions === 0 ? "暂无" : `${totalSessions} 条`}
              </p>
            </CardContent>
          </Card>
          <Card size="sm" className="bg-sidebar-accent/60">
            <CardContent className="py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                当前会话
              </p>
              <p className="mt-2 line-clamp-2 text-base font-medium">
                {activeSessionTitle ?? "新对话"}
              </p>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onStartNewChat} disabled={isLoadingSession}>
              新建对话
            </Button>
            <Button asChild variant="outline">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">最近会话</CardTitle>
            <CardDescription>选择一个会话并继续流式聊天。</CardDescription>
          </div>
          <Badge variant="outline">{sessions.length}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sessions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>还没有会话</EmptyTitle>
                <EmptyDescription>
                  发送第一条消息后，这里会出现最近记录。新对话会自动创建并进入流式模式。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : isLoadingSession ? (
            <SessionListSkeleton />
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelectSession(session)}
                className="block w-full text-left"
                disabled={isLoadingSession}
              >
                <Card
                  size="sm"
                  className={
                    session.id === activeSessionId
                      ? "border-primary/50 bg-primary/[0.06]"
                      : "border-border/50 transition-colors hover:bg-muted/40"
                  }
                >
                  <CardContent className="flex flex-col gap-2 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 font-medium">{session.title}</p>
                      <Badge variant="outline" className="shrink-0 text-[11px]">
                        {getAgentLabel(session.lastActiveAgent)}
                      </Badge>
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      更新于 {formatTimestamp(session.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
