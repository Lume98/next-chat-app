import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function ChatOverviewPanel({
  statusLabel,
  activeSessionTitle,
}: {
  statusLabel: string;
  activeSessionTitle: string | null;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardContent className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            在 `/chat` 内直接完成一轮流式对话
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">
            这个页面不再承担“启动后跳转”的角色，而是直接消费 `/api/ai-chat`
            并在页内切换历史会话。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm" className="bg-primary/[0.04]">
            <CardContent className="flex flex-col gap-2 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                返回模式
              </p>
              <p className="text-xl font-semibold tracking-tight">流式</p>
            </CardContent>
          </Card>
          <Card size="sm" className="bg-muted/40">
            <CardContent className="flex flex-col gap-2 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                当前状态
              </p>
              <p className="text-xl font-semibold tracking-tight">{statusLabel}</p>
            </CardContent>
          </Card>
          <Card size="sm" className="bg-muted/40">
            <CardContent className="flex flex-col gap-2 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                当前会话
              </p>
              <p className="truncate text-xl font-semibold tracking-tight">
                {activeSessionTitle ?? "未创建"}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
