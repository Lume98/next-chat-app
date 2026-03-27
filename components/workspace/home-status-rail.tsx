import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionRecord } from "@/lib/domain/types";
import { formatTimestamp, getAgentLabel } from "@/lib/utils/session";

interface HomeStatusRailProps {
  latestSession: SessionRecord | null;
}

export function HomeStatusRail({ latestSession }: HomeStatusRailProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-5">
      <Card className="border-border/50 bg-gradient-to-b from-background to-muted/5 shadow-sm">
        <CardHeader className="gap-3 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent pb-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              首页路径
            </p>
            <CardTitle className="text-lg leading-7 sm:text-xl">
              先创建，或直接继续最近工作区。
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-4 text-sm leading-7 text-muted-foreground">
          <div className="flex items-center justify-between gap-3 border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent px-3 py-3 text-foreground transition-all hover:border-primary/50">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                主路径一
              </p>
              <p className="text-base font-medium leading-6">新建工作区</p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              立即进入
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border border-border/40 bg-gradient-to-r from-background to-muted/10 px-3 py-3 text-foreground transition-all hover:border-border/60 hover:from-muted/5">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                主路径二
              </p>
              <p className="text-base font-medium leading-6">继续最近工作区</p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {latestSession ? "可直接恢复" : "创建后可用"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-gradient-to-b from-accent/5 via-background to-muted/10 shadow-sm">
        <CardHeader className="gap-3 border-b border-border/40 bg-gradient-to-r from-accent/10 to-transparent pb-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              最近状态
            </p>
            <CardTitle className="text-lg leading-7 sm:text-xl">
              {latestSession ? latestSession.title : "还没有最近工作区"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 py-4 text-sm leading-7 text-muted-foreground">
          {latestSession ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="text-[11px] uppercase tracking-[0.16em]"
                >
                  {getAgentLabel(latestSession.lastActiveAgent)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[11px] uppercase tracking-[0.16em]"
                >
                  {latestSession.latestReportId ? "已有报表" : "待生成报表"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="space-y-1 border border-border/40 bg-gradient-to-br from-background to-muted/20 px-3 py-3 text-foreground transition-all hover:border-border/60">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    最近更新
                  </p>
                  <p className="text-lg font-medium leading-8">
                    {formatTimestamp(latestSession.updatedAt)}
                  </p>
                </div>
                <div className="space-y-1 border border-border/40 bg-gradient-to-br from-background to-muted/20 px-3 py-3 text-foreground transition-all hover:border-border/60">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    恢复状态
                  </p>
                  <p className="text-lg font-medium leading-8">可继续当前上下文</p>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-border/40 bg-gradient-to-br from-muted/10 to-background/50 px-3 py-4">
              <p>创建第一个工作区后，这里会显示最近一次活跃状态。</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm">
        <CardHeader className="gap-2 border-b border-border/40 pb-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            开发者
          </p>
          <CardTitle className="text-lg leading-7">查看 API 文档</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-4 text-sm leading-7 text-muted-foreground">
          <p>
            已接入基于 OpenAPI 3.1 的接口文档，包含请求体、响应体和状态码。
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/api/openapi">JSON</Link>
            </Button>
            <Button asChild>
              <Link href="/docs/api">打开文档</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
