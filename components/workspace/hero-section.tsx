import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/utils/session";

interface HeroSectionProps {
  isCreating: boolean;
  error: string | null;
  onCreateSession: () => void;
  totalSessions: number;
  sessionsWithReports: number;
  latestSessionUpdatedAt: string | null;
}

export function HeroSection({
  isCreating,
  error,
  onCreateSession,
  totalSessions,
  sessionsWithReports,
  latestSessionUpdatedAt,
}: HeroSectionProps) {
  const summaryCards = [
    {
      label: "累计工作区",
      value: totalSessions === 0 ? "暂无" : `${totalSessions} 个`,
    },
    {
      label: "已有报表",
      value: sessionsWithReports === 0 ? "暂无" : `${sessionsWithReports} 个`,
    },
    {
      label: "最近更新",
      value: latestSessionUpdatedAt
        ? formatTimestamp(latestSessionUpdatedAt)
        : "创建后开始记录",
    },
  ];

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-muted/30 via-muted/20 to-background shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb),0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent-rgb),0.05),transparent_40%)]" />
      <CardContent className="relative space-y-6 px-5 py-5 sm:px-6 sm:py-6 lg:space-y-7 lg:px-8 lg:py-8">
        <div className="space-y-3 lg:space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            工作区启动台
          </p>

          <div className="space-y-3">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[3.15rem] lg:leading-[1.06]">
              启动新的分析，或直接回到最近工作区。
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              首页只保留创建入口、最近上下文和关键状态，让进入工作区这一步更直接。
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/50 bg-gradient-to-r from-background/95 via-primary/5 to-background/95 shadow-sm">
          <CardContent className="space-y-5 py-5 sm:space-y-6 sm:py-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                主路径一
              </p>
              <p className="max-w-2xl text-lg font-medium leading-8 tracking-tight sm:text-[1.4rem]">
                新建一个工作区，马上开始对话、上传资料和生成报表。
              </p>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                创建后立即进入工作台，后续回到首页时会保留最近上下文。
              </p>
            </div>

            <Button
              size="lg"
              className="min-w-56 justify-center px-5 text-sm sm:text-base"
              onClick={onCreateSession}
              disabled={isCreating}
            >
              {isCreating ? "正在创建…" : "新建工作区"}
            </Button>
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>创建失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((item, index) => (
            <Card
              key={item.label}
              size="sm"
              className={`min-h-28 border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                index === 0
                  ? 'bg-gradient-to-br from-primary/10 to-transparent hover:from-primary/15'
                  : index === 1
                    ? 'bg-gradient-to-br from-accent/10 to-transparent hover:from-accent/15'
                    : 'bg-gradient-to-br from-muted/20 to-background hover:from-muted/30'
              }`}
            >
              <CardContent className="flex h-full flex-col justify-between gap-3 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-lg font-semibold tracking-tight sm:text-xl">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
