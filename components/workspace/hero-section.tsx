"use client";

import { Button } from "@/components/ui/button";
import { StepCards } from "@/components/workspace/step-cards";

interface HeroSectionProps {
  isCreating: boolean;
  error: string | null;
  onCreateSession: () => void;
}

export function HeroSection({ isCreating, error, onCreateSession }: HeroSectionProps) {
  return (
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
          <Button size="lg" onClick={onCreateSession} disabled={isCreating}>
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

        <StepCards />
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
  );
}
