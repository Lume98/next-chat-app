"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { SessionRecord } from "@/lib/domain/types";
import { HeroSection } from "@/components/workspace/hero-section";
import { SessionList } from "@/components/workspace/session-list";

export function WorkspaceEntry({ sessions }: { sessions: SessionRecord[] }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateSession() {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as
        | { session?: SessionRecord; error?: string }
        | undefined;

      if (!response.ok || !payload?.session) {
        throw new Error(payload?.error || "创建会话失败");
      }

      router.push(`/sessions/${payload.session.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "创建会话失败",
      );
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <HeroSection
          isCreating={isCreating}
          error={error}
          onCreateSession={handleCreateSession}
        />
        <SessionList
          sessions={sessions}
          isCreating={isCreating}
          onCreateSession={handleCreateSession}
        />
      </div>
    </main>
  );
}
