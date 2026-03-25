import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

interface SessionListProps {
  sessions: SessionRecord[];
  isCreating: boolean;
  onCreateSession: () => void;
}

export function SessionList({
  sessions,
  isCreating,
  onCreateSession,
}: SessionListProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>最近会话</CardTitle>
          <CardDescription>
            {sessions.length === 0
              ? "还没有会话记录"
              : `共 ${sessions.length} 个会话，点击即可继续工作。`}
          </CardDescription>
        </div>
        <CardDescription className="hidden md:block">
          工作台会保留消息、上传记录和最新报表状态。
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto pr-1">
        {sessions.length === 0 ? (
          <Card className="flex min-h-full min-h-56 flex-col items-center justify-center gap-4 border-dashed text-center">
            <div className="space-y-2">
              <h3 className="text-base font-medium">还没有工作区</h3>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                先创建一个会话，再开始对话、上传文件和生成报表。
              </p>
            </div>
            <Button onClick={onCreateSession} disabled={isCreating}>
              {isCreating ? "正在创建…" : "创建第一个会话"}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="group"
              >
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium group-hover:underline">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        更新于 {formatTimestamp(session.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
                        {getAgentLabel(session.lastActiveAgent)}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] uppercase tracking-[0.18em]">
                        {session.latestReportId ? "已有报表" : "无报表"}
                      </Badge>
                    </div>
                    <p className="text-xs leading-6 text-muted-foreground">
                      点击继续当前工作区，保留既有消息与上传上下文。
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
