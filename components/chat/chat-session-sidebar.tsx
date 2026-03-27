"use client";

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
    <aside className="flex min-h-0 flex-col lg:h-full">
      <Card className="border-border/60 shadow-sm lg:min-h-0 lg:flex-1">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">会话列表</CardTitle>
            <CardDescription>
              {activeSessionTitle ?? "新对话"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {totalSessions === 0 ? "0" : totalSessions}
            </Badge>
            <Button
              onClick={onStartNewChat}
              disabled={isLoadingSession}
              size="sm"
            >
              新建对话
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
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
