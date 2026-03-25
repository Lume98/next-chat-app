import Link from "next/link";
import type { SessionRecord } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

interface SessionListProps {
  sessions: SessionRecord[];
  isCreating: boolean;
  onCreateSession: () => void;
}

export function SessionList({ sessions, isCreating, onCreateSession }: SessionListProps) {
  return (
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
          <Button onClick={onCreateSession} disabled={isCreating}>
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
  );
}
