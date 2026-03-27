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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

function SessionListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} size="sm" className="rounded-2xl border-border/50">
          <CardContent className="flex flex-col gap-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
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

function SessionListItem({
  session,
  isActive,
  disabled,
  onSelect,
}: {
  session: SessionRecord;
  isActive: boolean;
  disabled: boolean;
  onSelect: (session: SessionRecord) => void;
}) {
  const metaId = `session-meta-${session.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(session)}
        disabled={disabled}
        aria-current={isActive ? "page" : undefined}
        aria-describedby={metaId}
        className={[
          "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left touch-manipulation transition-colors",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-60",
          isActive
            ? "border-primary/50 bg-primary/[0.08] text-foreground"
            : "border-border/60 bg-background hover:border-border hover:bg-muted/45",
        ].join(" ")}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 line-clamp-2 text-sm font-medium leading-6 text-pretty">
              {session.title}
            </p>
            <Badge variant="outline" className="shrink-0 text-[11px]">
              {getAgentLabel(session.lastActiveAgent)}
            </Badge>
          </div>

          <div
            id={metaId}
            className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"
          >
            <span className="truncate">
              {isActive ? "当前会话" : "最近更新"}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatTimestamp(session.updatedAt)}
            </span>
          </div>
        </div>
      </button>
    </li>
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
    <aside
      className="flex h-full min-h-0 flex-col"
      aria-labelledby="chat-session-sidebar-title"
    >
      <Card className="flex h-full min-h-0 flex-col rounded-3xl border-border/60 shadow-sm">
        <CardHeader className="gap-4 border-b border-border/60 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle
                  id="chat-session-sidebar-title"
                  className="text-base font-semibold"
                >
                  会话列表
                </CardTitle>
                <Badge variant="outline" className="tabular-nums">
                  {totalSessions}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 min-w-0 text-sm text-pretty">
                {activeSessionTitle ?? "选择一段历史对话，或从这里开始新的会话。"}
              </CardDescription>
            </div>
            <div
              aria-live="polite"
              className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {isLoadingSession ? "加载中…" : "Ready"}
            </div>
          </div>

          <Button onClick={onStartNewChat} disabled={isLoadingSession} size="sm">
            新建对话
          </Button>
        </CardHeader>

        <CardContent
          aria-busy={isLoadingSession}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4"
        >
          {sessions.length === 0 ? (
            <Empty className="rounded-2xl border-border/60 bg-muted/20">
              <EmptyHeader>
                <EmptyTitle>还没有会话</EmptyTitle>
                <EmptyDescription>
                  发送第一条消息后，这里会出现最近记录。新对话会自动创建并进入流式模式。
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={onStartNewChat}
                  disabled={isLoadingSession}
                  size="sm"
                >
                  立即开始
                </Button>
              </EmptyContent>
            </Empty>
          ) : isLoadingSession ? (
            <SessionListSkeleton />
          ) : (
            <nav aria-label="历史会话">
              <ul className="flex flex-col gap-3">
                {sessions.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    disabled={isLoadingSession}
                    onSelect={onSelectSession}
                  />
                ))}
              </ul>
            </nav>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
