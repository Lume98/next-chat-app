import type { Metadata } from "next";
import Link from "next/link";

import { ApiReference } from "@/components/api-docs/api-reference";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "API 文档",
  description: "基于 Scalar 渲染的项目 API 参考文档。",
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(99,102,241,0.08),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.04),transparent)]">
      <section className="border-b border-border/70 bg-background/80 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              API Reference
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              工作台接口文档
            </h1>
            <p className="text-sm text-muted-foreground">
              基于 OpenAPI 3.1 生成，JSON 入口为{" "}
              <code>/api/openapi</code>。
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/api/openapi">查看 JSON</Link>
            </Button>
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-0 py-0">
        <ApiReference />
      </div>
    </main>
  );
}
