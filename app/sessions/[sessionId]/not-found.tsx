import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SessionNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Session Not Found
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">会话不存在</h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          这个工作区可能已被删除，或者链接已经失效。你可以返回首页重新创建会话。
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">返回工作台首页</Link>
      </Button>
    </main>
  );
}
