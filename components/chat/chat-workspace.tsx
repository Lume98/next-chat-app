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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              对话区域
            </p>
            <p className="truncate text-sm font-medium sm:text-base">
              {activeSession?.title ?? "新对话"}
            </p>
          </div>
          <div className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {statusLabel}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
            <Conversation className="h-full rounded-2xl border border-border bg-muted/20">
              <ConversationContent className="min-h-full justify-end px-4 py-4 sm:px-5 sm:py-5">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    className="min-h-[24rem]"
                    icon={
                      <MessageSquareIcon className="size-10 text-muted-foreground" />
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
                        <div className="px-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {message.role === "user" ? "你" : "对话 Agent"}
                        </div>
                        <MessageContent
                          className={
                            message.role === "user"
                              ? "max-w-3xl"
                              : "max-w-4xl"
                          }
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

        <div className="shrink-0 border-t border-border/60 bg-background/95 p-3 backdrop-blur sm:p-4">
          <PromptInput onSubmit={onSubmit} className="w-full">
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
