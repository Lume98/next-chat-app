"use client";

import { useRef, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChatOverviewPanel } from "@/components/chat/chat-overview-panel";
import { MessageComposer } from "@/components/chat/message-composer";
import { ChatSessionSidebar } from "@/components/chat/chat-session-sidebar";
import { ChatStreamList } from "@/components/chat/chat-stream-list";
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

  async function handleSendMessage() {
    const content = draft.trim();

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
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
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

      <section
        aria-labelledby="chat-workspace-title"
        className="flex min-h-[80vh] min-w-0 flex-col gap-4"
      >
        <h2 id="chat-workspace-title" className="sr-only">
          聊天工作区
        </h2>
        <ChatOverviewPanel
          statusLabel={
            isLoadingSession ? "加载会话" : isSending ? "生成中" : "就绪"
          }
          activeSessionTitle={activeSession?.title ?? null}
        />

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>请求失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {isLoadingSession ? (
          <Alert>
            <AlertTitle>正在切换会话</AlertTitle>
            <AlertDescription>
              正在加载历史消息并同步当前上下文，完成后会自动替换右侧对话流。
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-border bg-muted/20 p-3 sm:p-4">
          <ChatStreamList
            messages={messages}
            isStreaming={isSending || isLoadingSession}
          />
        </div>

        <div className="shrink-0">
          <MessageComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSendMessage}
            isSending={isSending || isLoadingSession}
          />
        </div>
      </section>
    </div>
  );
}
