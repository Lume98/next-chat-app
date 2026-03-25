"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { SessionRecord } from "@/lib/domain/types";

function formatTimestamp(value: string) {
  return value.slice(0, 16).replace("T", " ");
}

function getAgentLabel(agent: SessionRecord["lastActiveAgent"]) {
  if (agent === "report") {
    return "报表 Agent";
  }

  if (agent === "conversation") {
    return "对话 Agent";
  }

  return agent;
}

export function WorkspaceEntry({ sessions }: { sessions: SessionRecord[] }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateSession() {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as
        | { session?: SessionRecord; error?: string }
        | undefined;

      if (!response.ok || !payload?.session) {
        throw new Error(payload?.error || "创建会话失败");
      }

      router.push(`/sessions/${payload.session.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "创建会话失败",
      );
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 border border-border bg-card p-6 md:grid-cols-[1.4fr_0.9fr] md:p-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                AI Multi-Agent MVP
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                用一个工作区串起对话分析、文件理解与报表生成。
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                当前版本聚焦个人用户场景：先创建会话，再发送问题、上传文件，最后调用报表
                Agent 生成结构化结论。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={handleCreateSession} disabled={isCreating}>
                {isCreating ? "正在创建…" : "新建工作区"}
              </Button>
              <p className="text-xs text-muted-foreground">
                首页由服务端读取最近会话，进入工作台后可继续恢复历史内容。
              </p>
            </div>

            {error ? (
              <div className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  1. 先发起对话
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  用自然语言描述目标、问题或你希望完成的分析任务。
                </p>
              </div>
              <div className="border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  2. 再补充资料
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  上传 CSV、Excel、TXT 或 Markdown，让上下文更完整。
                </p>
              </div>
              <div className="border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  3. 生成报表
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  报表 Agent 会基于当前资料输出结构化中文结论。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border border-border bg-muted/30 p-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                MVP Scope
              </p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                <li>· 对话 Agent 负责追问、总结与上下文建议</li>
                <li>· 报表 Agent 基于上传文件生成结构化中文报告</li>
                <li>· 文件先走手工上传，数据和消息本地持久化</li>
              </ul>
            </div>
            <div className="border border-border bg-background px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                当前状态
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                已支持最近会话恢复、消息追问、文件上传和报表生成的完整闭环。
              </p>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-semibold">最近会话</h2>
              <p className="text-xs text-muted-foreground">
                {sessions.length === 0
                  ? "还没有会话记录"
                  : `共 ${sessions.length} 个会话，点击即可继续工作。`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              工作台会保留消息、上传记录和最新报表状态。
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-4 border border-dashed border-border px-6 py-10 text-center">
              <div className="space-y-2">
                <h3 className="text-base font-medium">还没有工作区</h3>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  先创建一个会话，再开始对话、上传文件和生成报表。
                </p>
              </div>
              <Button onClick={handleCreateSession} disabled={isCreating}>
                {isCreating ? "正在创建…" : "创建第一个会话"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 pt-4 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="group border border-border bg-background p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium group-hover:underline">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        更新于 {formatTimestamp(session.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span className="border border-border px-2 py-1">
                        {getAgentLabel(session.lastActiveAgent)}
                      </span>
                      <span className="border border-border px-2 py-1">
                        {session.latestReportId ? "已有报表" : "无报表"}
                      </span>
                    </div>
                    <p className="text-xs leading-6 text-muted-foreground">
                      点击继续当前工作区，保留既有消息与上传上下文。
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
