"use client";

import { useRef, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";

import { ChatSessionSidebar } from "@/components/chat/chat-session-sidebar";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { MessageRecord, SessionRecord } from "@/lib/domain/types";
import { messageRecordsToUIMessages } from "@/lib/chat/ui-messages";

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
    <section
      aria-labelledby="chat-shell-title"
      className="relative h-full min-h-0 w-full overflow-hidden"
    >
      <h1 id="chat-shell-title" className="sr-only">
        聊天布局
      </h1>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-muted/12" />

      <div className="relative grid h-full min-h-0 w-full gap-3 px-3 py-3 lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-0 lg:px-0 lg:py-0 xl:grid-cols-[336px_minmax(0,1fr)]">
        <div className="min-h-0 lg:h-full">
          <ChatSessionSidebar
            totalSessions={totalSessions}
            sessions={sessionList}
            activeSessionId={activeSession?.id ?? null}
            isLoadingSession={isLoadingSession}
            onStartNewChat={handleStartNewChat}
            onSelectSession={(session) => {
              void handleSelectSession(session);
            }}
          />
        </div>

        <ChatWorkspace
          activeSession={activeSession}
          messages={messages}
          draft={draft}
          status={status}
          statusLabel={statusLabel}
          error={error}
          isLoadingSession={isLoadingSession}
          isSending={isSending}
          onDraftChange={setDraft}
          onSubmit={handlePromptSubmit}
          onStop={stop}
        />
      </div>
    </section>
  );
}
