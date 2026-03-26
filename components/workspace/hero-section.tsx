"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { StepCards } from "@/components/workspace/step-cards";
import { formatTimestamp } from "@/lib/utils/session";

const highlights = [
  {
    title: "对话 Agent",
    description: "负责追问、总结和整理上下文，帮你把问题先说清楚。",
  },
  {
    title: "文件补充",
    description: "支持上传 CSV、Excel、TXT 和 Markdown，让分析依据更完整。",
  },
  {
    title: "报表输出",
    description: "基于当前会话与资料生成结构化中文结论，方便直接复用。",
  },
];

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
      label: "最近会话",
      value: totalSessions === 0 ? "暂无" : `${totalSessions} 个`,
    },
    {
      label: "最近含报表",
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
    <Card className="overflow-hidden border-border/70 bg-muted/30">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.28fr)_340px]">
        <div className="space-y-6 p-5 sm:p-6 lg:space-y-7 lg:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="text-[11px] uppercase tracking-[0.28em]"
              >
                Workspace Home
              </Badge>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                分析入口 / 会话恢复
              </p>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                先开一个工作区，再把最近分析接回来。
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                首页只保留最常用的两个动作：开始新的分析，或继续最近的消息、资料与报表上下文。
              </p>
            </div>
          </div>

          <Card className="bg-background/95">
            <CardContent className="grid gap-4 py-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <Button
                size="lg"
                className="min-w-40 justify-center"
                onClick={onCreateSession}
                disabled={isCreating}
              >
                {isCreating ? "正在创建…" : "新建工作区"}
              </Button>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-6">
                  创建后会立即进入工作台。
                </p>
                <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
                  最近会话、上传资料和报表结果会一起保留，回到首页就能继续。
                </p>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>创建失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                工作区快照
              </p>
              <p className="text-xs text-muted-foreground">
                先确认当前状态，再选择新建或继续。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {summaryCards.map((item) => (
                <Card key={item.label} size="sm" className="bg-background/90">
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
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                开始路径
              </p>
              <p className="text-xs text-muted-foreground">
                先发起问题，再补充资料，最后生成结构化报表。
              </p>
            </div>
            <StepCards />
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/70 xl:border-t-0 xl:border-l">
          <div className="flex h-full flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                当前支持
              </p>
              <h2 className="text-base font-medium tracking-tight sm:text-lg">
                把首页当成工作区入口，而不是说明页。
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                直接进入对话，随时补充文件，再由报表 Agent 输出结构化中文结论。
              </p>
            </div>

            <div className="grid gap-2">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="border border-border/70 bg-muted/20 px-3 py-3"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <Card size="sm" className="border-dashed bg-muted/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-[11px] uppercase tracking-[0.22em]">
                  继续最近工作
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {latestSessionUpdatedAt
                  ? `最近一次更新于 ${formatTimestamp(latestSessionUpdatedAt)}，右侧列表可直接恢复上下文。`
                  : "创建第一个工作区后，这里会开始展示最近状态摘要。"}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
}
