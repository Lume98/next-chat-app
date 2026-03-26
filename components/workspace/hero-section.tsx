"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
    <Card className="relative overflow-hidden border-border/70 bg-muted/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_38%)]" />
      <CardContent className="relative space-y-6 px-5 py-5 sm:px-6 sm:py-6 lg:space-y-7 lg:px-8 lg:py-8">
        <div className="space-y-4 lg:space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="text-[11px] uppercase tracking-[0.28em]"
            >
              Workspace Launcher
            </Badge>
            <Badge
              variant="outline"
              className="bg-background/80 text-[11px] uppercase tracking-[0.22em]"
            >
              Launch Panel
            </Badge>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              工作区启动台
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[3.2rem] lg:leading-[1.08]">
              从这里启动新的分析，或直接接回最近工作区。
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              首页现在更像真正的工作入口：保留创建动作、最近上下文和关键状态，不再用说明内容占据首屏。
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 bg-background/95">
          <CardContent className="space-y-4 py-5 sm:space-y-5 sm:py-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="text-[11px] uppercase tracking-[0.2em]"
              >
                Launch Ready
              </Badge>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                创建后立即进入工作台
              </p>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-base font-medium leading-7 tracking-tight sm:text-xl">
                  新建一个工作区，马上开始对话、上传资料和生成报表。
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  最近会话、上传文件和报表结果会一起保留，之后回到首页就能继续当前上下文。
                </p>
              </div>
              <Button
                size="lg"
                className="min-w-48 justify-center text-sm sm:text-base"
                onClick={onCreateSession}
                disabled={isCreating}
              >
                {isCreating ? "正在创建…" : "新建工作区"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>创建失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((item) => (
            <Card
              key={item.label}
              size="sm"
              className="border-border/70 bg-background/90 transition-colors duration-200 hover:bg-background"
            >
              <CardContent className="space-y-3 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-base font-semibold tracking-tight sm:text-lg">
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
