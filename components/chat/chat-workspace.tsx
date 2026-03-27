"use client";

import { MessageSquareIcon } from "lucide-react";
import type { ChatStatus, UIMessage } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionRecord } from "@/lib/domain/types";
import { extractTextFromUIMessage } from "@/lib/chat/ui-messages";
import { cn } from "@/lib/utils";

export function ChatWorkspace({
  activeSession,
  messages,
  draft,
  status,
  statusLabel,
  error,
  isLoadingSession,
  isSending,
  onDraftChange,
  onSubmit,
  onStop,
}: {
  activeSession: SessionRecord | null;
  messages: UIMessage[];
  draft: string;
  status: ChatStatus;
  statusLabel: string;
  error: string | null;
  isLoadingSession: boolean;
  isSending: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (message: PromptInputMessage) => void | Promise<void>;
  onStop: () => void;
}) {
  return (
    <section
      aria-labelledby="chat-workspace-title"
      className="flex min-h-0 min-w-0 flex-col lg:h-full"
    >
      <h2 id="chat-workspace-title" className="sr-only">
        聊天工作区
      </h2>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-background/98 via-background/96 to-muted/12 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.4)] lg:rounded-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-primary/8 via-transparent to-transparent" />

        <div className="relative flex shrink-0 items-end justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-background/94 via-background/96 to-primary/5 px-4 py-4 sm:px-6">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              对话区域
            </p>
            <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {activeSession?.title ?? "新对话"}
            </p>
            <p className="hidden text-sm leading-6 text-muted-foreground sm:block">
              {messages.length === 0
                ? "从输入框开始提问，回复会在这里实时展开。"
                : `当前共 ${messages.length} 条消息，可以继续追问并保持上下文。`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              状态
            </p>
            <p className="text-sm font-medium tracking-tight text-foreground">
              {statusLabel}
            </p>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {error ? (
            <div className="shrink-0 px-3 pt-3 sm:px-4">
              <Alert variant="destructive">
                <AlertTitle>请求失败</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {isLoadingSession ? (
            <div className="shrink-0 px-3 pt-3 sm:px-4">
              <Alert>
                <AlertTitle>正在切换会话</AlertTitle>
                <AlertDescription>
                  正在加载历史消息并同步当前上下文，完成后会自动替换右侧对话流。
                </AlertDescription>
              </Alert>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
            <Conversation className="h-full rounded-[1.75rem] border border-border/50 bg-gradient-to-b from-background/92 via-background/88 to-muted/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <ConversationContent className="min-h-full justify-end px-4 py-5 sm:px-6 sm:py-6">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    className="min-h-[24rem] gap-4"
                    icon={
                      <div className="flex size-16 items-center justify-center rounded-full border border-border/50 bg-background/90 shadow-sm">
                        <MessageSquareIcon className="size-8 text-muted-foreground" />
                      </div>
                    }
                    title="在这里直接开始一轮流式对话"
                    description="输入问题后会直接通过 AI SDK 流式接口返回回复。历史会话可以在左侧切换并继续。"
                  />
                ) : (
                  messages.map((message) => {
                    const text = extractTextFromUIMessage(message);
                    const isStreamingPlaceholder =
                      message.role !== "user" && !text.trim();

                    return (
                      <Message from={message.role} key={message.id}>
                        <div className="inline-flex w-fit items-center rounded-full border border-border/40 bg-background/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground shadow-sm">
                          {message.role === "user" ? "你" : "对话 Agent"}
                        </div>
                        <MessageContent
                          className={cn(
                            message.role === "user"
                              ? "max-w-3xl group-[.is-user]:rounded-[1.5rem] group-[.is-user]:border group-[.is-user]:border-primary/20 group-[.is-user]:bg-primary/10 group-[.is-user]:shadow-[0_18px_36px_-30px_rgba(79,70,229,0.55)]"
                              : "max-w-4xl rounded-[1.5rem] border border-border/45 bg-background/85 px-4 py-3 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.3)]",
                          )}
                        >
                          {isStreamingPlaceholder ? (
                            <div className="flex min-w-56 flex-col gap-2 py-1">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-3 w-52" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          ) : (
                            <MessageResponse className="text-base leading-8">
                              {text}
                            </MessageResponse>
                          )}
                        </MessageContent>
                      </Message>
                    );
                  })
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </div>

        <div className="relative shrink-0 border-t border-border/60 bg-gradient-to-r from-background/96 via-background to-muted/10 p-3 backdrop-blur sm:p-4">
          <PromptInput
            onSubmit={onSubmit}
            className="w-full [&>[data-slot=input-group]]:rounded-[1.5rem] [&>[data-slot=input-group]]:border-border/60 [&>[data-slot=input-group]]:bg-background/90 [&>[data-slot=input-group]]:shadow-[0_18px_36px_-32px_rgba(15,23,42,0.28)]"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={draft}
                onChange={(event) => onDraftChange(event.currentTarget.value)}
                placeholder="输入你的问题、分析目标或后续追问…"
                className="min-h-28 text-base leading-8"
                disabled={isLoadingSession}
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-border/60 pt-3">
              <p className="text-sm text-muted-foreground">
                {draft.trim()
                  ? `已输入 ${draft.trim().length} 个字符`
                  : "Enter 发送，Shift + Enter 换行"}
              </p>
              <PromptInputTools className="justify-end">
                <PromptInputSubmit
                  status={status}
                  onStop={onStop}
                  disabled={isLoadingSession || (!draft.trim() && !isSending)}
                />
              </PromptInputTools>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </section>
  );
}
