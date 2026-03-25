import type { FormEvent, KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="space-y-1">
          <label
            htmlFor="message"
            className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
          >
            对话 Agent
          </label>
          <p className="text-sm leading-6 text-muted-foreground">
            继续当前会话，结合已有消息和上传内容补充问题或追问。
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSending ? "正在生成回复…" : "支持多轮追问"}
        </p>
      </div>
      <div className="space-y-3">
        <textarea
          id="message"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题、分析目标或后续追问…"
          className="min-h-32 w-full resize-y border border-input bg-background px-4 py-3 text-sm leading-7 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Enter 换行，Ctrl / Cmd + Enter 发送。
          </p>
          <Button type="submit" disabled={isSending || !value.trim()}>
            {isSending ? "发送中…" : "发送消息"}
          </Button>
        </div>
      </div>
    </form>
  );
}
