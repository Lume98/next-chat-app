"use client";

import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MessageRecord } from "@/lib/domain/types";

function formatTimestamp(value: string) {
  return value.slice(11, 16);
}

function getMessageLabel(message: MessageRecord) {
  if (message.role === "user") {
    return "你";
  }

  return message.agent === "report" ? "报表 Agent" : "对话 Agent";
}

export function MessageList({
  messages,
  isSending,
}: {
  messages: MessageRecord[];
  isSending: boolean;
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
    }, [messages.length, isSending]);

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
            <Card className="flex h-full min-h-[26rem] flex-col items-center justify-center border-dashed">
                <div className="max-w-lg space-y-4">
                    <Badge variant="outline" className="text-xs uppercase tracking-[0.28em]">
                        Conversation Workspace
                    </Badge>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            从一条消息开始当前会话
                        </h2>
                        <p className="text-base leading-8 text-muted-foreground">
                            你可以先描述问题，再逐步上传文件。对话 Agent 会结合当前上下文继续追问、总结和分析。
                        </p>
                    </div>
                    <div className="grid gap-2 text-left text-sm text-muted-foreground sm:grid-cols-2">
                        <Card>
                            <CardContent>
                                <p className="font-medium text-foreground">1. 先发起对话</p>
                                <p className="mt-1 leading-6">输入你的目标、问题或分析方向。</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <p className="font-medium text-foreground">2. 再补充资料</p>
                                <p className="mt-1 leading-6">上传文件后继续追问，或生成报表结论。</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full min-h-0 overflow-y-auto pr-1"
        >
            <div className="flex min-h-full flex-col justify-end gap-4">
                {messages.map((message) => (
                    <article
                        key={message.id}
                        className={cn(
                            "flex w-full flex-col gap-2",
                            message.role === "user" ? "items-end" : "items-start",
                        )}
                    >
                        <div className="flex max-w-3xl items-center gap-2 px-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span>{getMessageLabel(message)}</span>
                            <span>·</span>
                            <span>{formatTimestamp(message.createdAt)}</span>
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
                                <div className="whitespace-pre-wrap text-base leading-8">
                                    {message.content}
                                </div>
                            </CardContent>
                        </Card>
                    </article>
                ))}

                {isSending ? (
                    <article className="flex w-full flex-col items-start gap-2">
                        <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span>对话 Agent</span>
                            <span>·</span>
                            <span>处理中</span>
                        </div>
                        <Card className="max-w-3xl">
                            <CardContent className="space-y-2">
                                <div className="h-3 w-28 animate-pulse bg-muted" />
                                <div className="h-3 w-56 animate-pulse bg-muted" />
                                <div className="h-3 w-40 animate-pulse bg-muted" />
                            </CardContent>
                        </Card>
                    </article>
                ) : null}
            </div>
        </div>
    );
}
