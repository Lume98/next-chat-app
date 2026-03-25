import type { FormEvent, KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              对话 Agent
            </CardTitle>
            <CardDescription>
              继续当前会话，结合已有消息和上传内容补充问题或追问。
            </CardDescription>
          </div>
          <CardDescription>
            {isSending ? "正在生成回复…" : "支持多轮追问"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            id="message"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题、分析目标或后续追问…"
            className="min-h-32 text-sm leading-7"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Enter 换行，Ctrl / Cmd + Enter 发送。
            </p>
            <Button type="submit" disabled={isSending || !value.trim()}>
              {isSending ? "发送中…" : "发送消息"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
