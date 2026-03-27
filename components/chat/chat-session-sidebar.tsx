"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionRecord } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils/session";

function SessionListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-transparent bg-muted/20 px-3 py-3"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
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
    <li className="group">
      <button
        type="button"
        onClick={() => onSelect(session)}
        disabled={disabled}
        aria-current={isActive ? "page" : undefined}
        aria-describedby={metaId}
        className={cn(
          "relative w-full rounded-xl border px-3 py-3 text-left touch-manipulation",
          "transition-all duration-200 ease-out",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-60",
          isActive
            ? "border-border bg-muted/35 shadow-sm"
            : "border-transparent bg-transparent hover:border-border/40 hover:bg-muted/15",
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
        )}

        <div className="flex min-w-0 items-start justify-between gap-3">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-sm leading-6",
              isActive ? "font-medium text-foreground" : "text-foreground/85 group-hover:text-foreground",
            )}
          >
            {session.title}
          </p>
          <time
            dateTime={session.updatedAt}
            className="shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground group-hover:text-muted-foreground/80"
          >
            {formatTimestamp(session.updatedAt)}
          </time>
        </div>

        <p id={metaId} className="mt-1 text-xs text-muted-foreground">
          {isActive ? "当前会话" : "点击继续这段对话"}
        </p>
      </button>
    </li>
  );
}

export function ChatSessionSidebar(props: {
  totalSessions: number;
  sessions: SessionRecord[];
  activeSessionId: string | null;
  isLoadingSession: boolean;
  onStartNewChat: () => void;
  onSelectSession: (session: SessionRecord) => void;
}) {
  const {
    totalSessions,
    sessions,
    activeSessionId,
    isLoadingSession,
    onStartNewChat,
    onSelectSession,
  } = props;
  const displayTotalSessions = Math.max(totalSessions, sessions.length);

  return (
    <aside
      className="flex h-full min-h-0 flex-col"
      aria-labelledby="chat-session-sidebar-title"
    >
      <Card className="flex h-full min-h-0 flex-col rounded-3xl border border-border/60 bg-background/60 backdrop-blur-sm shadow-sm ring-0 lg:rounded-none lg:border-r-0 lg:shadow-none">
        <CardHeader className="gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="chat-session-sidebar-title"
              className="font-heading text-sm font-medium text-foreground"
            >
              会话列表
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
              {displayTotalSessions} 条
            </span>
          </div>
          <Button
            onClick={onStartNewChat}
            disabled={isLoadingSession}
            className="w-full transition-all duration-200 hover:shadow-md"
          >
            新建对话
          </Button>
        </CardHeader>

        <CardContent
          aria-busy={isLoadingSession}
          className="flex min-h-0 flex-1 flex-col py-4"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
            {sessions.length === 0 ? (
              <Empty className="rounded-xl border border-border/60 bg-muted/[0.14] px-5 py-8">
                <EmptyHeader className="items-start text-left">
                  <EmptyTitle className="text-base">还没有会话</EmptyTitle>
                  <EmptyDescription className="text-sm leading-6">
                    发送第一条消息后，这里会显示历史会话。
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="items-start">
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
                <ul className="flex flex-col gap-2">
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
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
