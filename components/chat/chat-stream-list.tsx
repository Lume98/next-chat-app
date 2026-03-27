"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { extractTextFromUIMessage } from "@/lib/chat/ui-messages";

function getMessageLabel(message: UIMessage) {
  if (message.role === "user") {
    return "你";
  }

  return "对话 Agent";
}

export function ChatStreamList({
  messages,
  isStreaming,
}: {
  messages: UIMessage[];
  isStreaming: boolean;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    const node = scrollContainerRef.current;

    if (!node || !shouldStickToBottomRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      node.scrollTop = node.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, isStreaming]);

  function handleScroll() {
    const node = scrollContainerRef.current;

    if (!node) {
      return;
    }

    const distanceToBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom < 120;
  }

  if (messages.length === 0) {
    return (
      <Card className="h-full min-h-0 rounded-[inherit] border-0 border-dashed shadow-none">
        <CardContent className="flex h-full min-h-[24rem] items-center justify-center">
          <Empty className="border-none p-0">
            <EmptyHeader>
              <Badge
                variant="outline"
                className="text-xs uppercase tracking-[0.28em]"
              >
                Streaming Chat
              </Badge>
              <EmptyTitle className="text-2xl font-semibold tracking-tight">
                在这里直接开始一轮流式对话
              </EmptyTitle>
              <EmptyDescription className="text-base leading-8">
                输入问题后会直接通过 AI SDK 流式接口返回回复。历史会话可以在左侧切换并继续。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-full min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex min-h-full flex-col justify-end gap-4">
        {messages.map((message) => {
          const text = extractTextFromUIMessage(message);
          const isAssistant = message.role !== "user";
          const isStreamingPlaceholder = isAssistant && !text.trim();

          return (
            <article
              key={message.id}
              className={cn(
                "flex w-full flex-col gap-2",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div className="flex max-w-3xl items-center gap-2 px-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <span>{getMessageLabel(message)}</span>
              </div>
              <Card
                className={cn(
                  "max-w-3xl",
                  message.role === "user"
                    ? "border-primary/25 bg-primary/[0.06] text-foreground"
                    : "text-foreground",
                )}
              >
                <CardContent>
                  {isStreamingPlaceholder ? (
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-56" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-base leading-8">
                      {text}
                    </div>
                  )}
                </CardContent>
              </Card>
            </article>
          );
        })}

        {isStreaming ? (
          <article className="flex w-full flex-col items-start gap-2">
            <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span>对话 Agent</span>
              <span>·</span>
              <span>处理中</span>
            </div>
            <Card className="max-w-3xl">
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </CardContent>
            </Card>
          </article>
        ) : null}
      </div>
    </div>
  );
}
