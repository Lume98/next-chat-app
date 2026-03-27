"use client";

import { startTransition, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageComposer } from "@/components/workspace/message-composer";
import { UploadList } from "@/components/workspace/upload-list";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

type CreateSessionResponse = {
  session?: SessionRecord;
  error?: string;
};

type ChatResponse = {
  error?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ChatEntry({
  sessions,
  totalSessions,
}: {
  sessions: SessionRecord[];
  totalSessions: number;
}) {
  const router = useRouter();
  const createdSessionPromiseRef = useRef<Promise<SessionRecord> | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function ensureSession(title?: string) {
    if (!createdSessionPromiseRef.current) {
      setIsCreatingSession(true);
      createdSessionPromiseRef.current = (async () => {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(title ? { title } : {}),
        });
        const payload = (await response.json()) as CreateSessionResponse;

        if (!response.ok || !payload.session) {
          throw new Error(payload.error || "创建会话失败");
        }

        return payload.session;
      })();
    }

    try {
      return await createdSessionPromiseRef.current;
    } catch (sessionError) {
      createdSessionPromiseRef.current = null;
      throw sessionError;
    } finally {
      setIsCreatingSession(false);
    }
  }

  function openSession(sessionId: string) {
    startTransition(() => {
      router.replace(`/sessions/${sessionId}`);
    });
  }

  async function handleCreateBlankSession() {
    if (isCreatingSession || isSending || isUploading) {
      return;
    }

    setError(null);

    try {
      const session = await ensureSession();
      openSession(session.id);
    } catch (sessionError) {
      setError(getErrorMessage(sessionError, "创建会话失败"));
    }
  }

  async function handleSendMessage() {
    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const session = await ensureSession(content);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
          content,
        }),
      });
      const payload = (await response.json()) as ChatResponse;

      if (!response.ok) {
        throw new Error(payload.error || "发送消息失败");
      }

      openSession(session.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "发送消息失败"));
    } finally {
      setIsSending(false);
    }
  }

  async function handleUploadFile(file: File) {
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const session = await ensureSession(file.name);
      const formData = new FormData();
      formData.set("sessionId", session.id);
      formData.set("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "上传文件失败");
      }

      openSession(session.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "上传文件失败"));
    } finally {
      setIsUploading(false);
    }
  }

  const isBusy = isCreatingSession || isSending || isUploading;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.12),transparent_30%),linear-gradient(180deg,transparent,rgba(15,23,42,0.03))] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <section className="space-y-5">
          <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
            <CardContent className="space-y-6 px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs uppercase tracking-[0.24em]"
                  >
                    Chat
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs uppercase tracking-[0.24em]"
                  >
                    独立入口
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[3.3rem] lg:leading-[1.05]">
                    直接开始一轮对话，真正需要时再创建会话。
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    你可以先发首条消息、先上传资料，或者直接进入一个空白工作区。系统只会在第一次有效操作时落库会话，避免产生无用空记录。
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card size="sm" className="bg-primary/[0.04]">
                  <CardContent className="space-y-2 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      总会话
                    </p>
                    <p className="text-xl font-semibold tracking-tight">
                      {totalSessions === 0 ? "暂无" : `${totalSessions} 个`}
                    </p>
                  </CardContent>
                </Card>
                <Card size="sm" className="bg-muted/40">
                  <CardContent className="space-y-2 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      当前模式
                    </p>
                    <p className="text-xl font-semibold tracking-tight">懒创建</p>
                  </CardContent>
                </Card>
                <Card size="sm" className="bg-muted/40">
                  <CardContent className="space-y-2 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      首次动作
                    </p>
                    <p className="text-xl font-semibold tracking-tight">
                      自动建会话
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={handleCreateBlankSession}
                  disabled={isBusy}
                >
                  {isCreatingSession ? "创建中…" : "进入空白工作区"}
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/">返回首页</Link>
                </Button>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>请求失败</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <MessageComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSendMessage}
            isSending={isSending || isCreatingSession}
          />

          <UploadList
            uploads={[]}
            onUpload={handleUploadFile}
            isUploading={isUploading || isCreatingSession}
          />
        </section>

        <aside className="space-y-5">
          <Card className="border-border/60 bg-sidebar text-sidebar-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">进入方式</CardTitle>
              <CardDescription>
                `/chat` 现在是独立启动页，适合从零开始一轮新对话。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Card size="sm" className="bg-sidebar-accent/60">
                <CardContent className="py-3">
                  首条消息会自动创建会话，并用消息内容初始化标题。
                </CardContent>
              </Card>
              <Card size="sm" className="bg-sidebar-accent/60">
                <CardContent className="py-3">
                  首次上传也会自动建会话，方便先给上下文再继续追问。
                </CardContent>
              </Card>
              <Card size="sm" className="bg-sidebar-accent/60">
                <CardContent className="py-3">
                  真正进入工作区后，仍然使用原有的消息、上传和报表能力。
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">最近会话</CardTitle>
                <CardDescription>
                  从这里可以直接回到已有上下文。
                </CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">
                {sessions.length} 条
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-sm leading-7 text-muted-foreground">
                    还没有任何会话。发出第一条消息后，这里会出现最近记录。
                  </CardContent>
                </Card>
              ) : (
                sessions.map((session) => (
                  <Link key={session.id} href={`/sessions/${session.id}`}>
                    <Card
                      size="sm"
                      className="border-border/50 transition-colors hover:bg-muted/40"
                    >
                      <CardContent className="space-y-2 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 font-medium">
                            {session.title}
                          </p>
                          <Badge variant="outline" className="shrink-0 text-[11px]">
                            {getAgentLabel(session.lastActiveAgent)}
                          </Badge>
                        </div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          更新于 {formatTimestamp(session.updatedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
