"use client";

import { MessageSquareIcon } from "lucide-react";
import { useRef, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";

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
import { ChatSessionSidebar } from "@/components/chat/chat-session-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MessageRecord, SessionRecord } from "@/lib/domain/types";
import {
  extractTextFromUIMessage,
  messageRecordsToUIMessages,
} from "@/lib/chat/ui-messages";

type CreateSessionResponse = {
  session?: SessionRecord;
  error?: string;
};

type SessionDetailResponse = {
  session?: SessionRecord;
  messages?: MessageRecord[];
  error?: string;
};

function sortSessions(sessions: SessionRecord[]) {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ChatEntry({
  sessions,
  totalSessions,
  initialSession,
  initialMessages,
}: {
  sessions: SessionRecord[];
  totalSessions: number;
  initialSession: SessionRecord | null;
  initialMessages: UIMessage[];
}) {
  const createdSessionPromiseRef = useRef<Promise<SessionRecord> | null>(null);
  const transportRef = useRef(new DefaultChatTransport({ api: "/api/ai-chat" }));
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionList, setSessionList] = useState(sessions);
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(
    initialSession,
  );
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const { messages, sendMessage, setMessages, status, stop, clearError } =
    useChat({
      transport: transportRef.current,
      messages: initialMessages,
      onError(chatError) {
        setError(chatError.message);
      },
      onFinish() {
        if (!activeSession) {
          return;
        }

        touchSession(activeSession.id);
      },
    });

  const isSending = status === "submitted" || status === "streaming";
  const statusLabel = isLoadingSession ? "加载会话" : isSending ? "生成中" : "就绪";

  function syncSession(nextSession: SessionRecord) {
    setActiveSession(nextSession);
    setSessionList((previous) =>
      sortSessions([
        nextSession,
        ...previous.filter((item) => item.id !== nextSession.id),
      ]),
    );
  }

  function touchSession(sessionId: string) {
    const current = sessionList.find((item) => item.id === sessionId);

    if (!current) {
      return;
    }

    syncSession({
      ...current,
      updatedAt: new Date().toISOString(),
      lastActiveAgent: "conversation",
    });
  }

  async function ensureSession(title: string) {
    if (activeSession) {
      return activeSession;
    }

    if (!createdSessionPromiseRef.current) {
      createdSessionPromiseRef.current = (async () => {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        });
        const payload = (await response.json()) as CreateSessionResponse;

        if (!response.ok || !payload.session) {
          throw new Error(payload.error || "创建会话失败");
        }

        return payload.session;
      })();
    }

    try {
      const session = await createdSessionPromiseRef.current;
      syncSession(session);
      return session;
    } catch (sessionError) {
      createdSessionPromiseRef.current = null;
      throw sessionError;
    }
  }

  async function handleSendMessage(nextDraft?: string) {
    const content = (nextDraft ?? draft).trim();

    if (!content || isSending || isLoadingSession) {
      return;
    }

    setError(null);
    clearError();

    try {
      const session = await ensureSession(content);
      touchSession(session.id);
      setDraft("");

      await sendMessage(
        {
          text: content,
        },
        {
          body: {
            sessionId: session.id,
          },
        },
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "发送消息失败"));
    }
  }

  async function handlePromptSubmit(message: PromptInputMessage) {
    await handleSendMessage(message.text);
  }

  async function handleSelectSession(session: SessionRecord) {
    if (session.id === activeSession?.id || isLoadingSession) {
      return;
    }

    if (isSending) {
      stop();
    }

    setIsLoadingSession(true);
    setError(null);
    clearError();

    try {
      const response = await fetch(`/api/sessions/${session.id}`);
      const payload = (await response.json()) as SessionDetailResponse;

      if (!response.ok || !payload.session || !payload.messages) {
        throw new Error(payload.error || "读取会话失败");
      }

      syncSession(payload.session);
      setMessages(messageRecordsToUIMessages(payload.messages));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "读取会话失败"));
    } finally {
      setIsLoadingSession(false);
    }
  }

  function handleStartNewChat() {
    if (isSending) {
      stop();
    }

    createdSessionPromiseRef.current = null;
    setActiveSession(null);
    setMessages([]);
    setDraft("");
    setError(null);
    clearError();
  }

  return (
    <div className="grid h-full min-h-0 w-full gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="min-h-0 lg:h-full">
        <ChatSessionSidebar
          totalSessions={totalSessions}
          activeSessionTitle={activeSession?.title ?? null}
          sessions={sessionList}
          activeSessionId={activeSession?.id ?? null}
          isLoadingSession={isLoadingSession}
          onStartNewChat={handleStartNewChat}
          onSelectSession={(session) => {
            void handleSelectSession(session);
          }}
        />
      </div>

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
            <PromptInput
              onSubmit={(message) => handlePromptSubmit(message)}
              className="w-full"
            >
              <PromptInputBody>
                <PromptInputTextarea
                  value={draft}
                  onChange={(event) => setDraft(event.currentTarget.value)}
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
                    onStop={stop}
                    disabled={isLoadingSession || (!draft.trim() && !isSending)}
                  />
                </PromptInputTools>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </section>
    </div>
  );
}
