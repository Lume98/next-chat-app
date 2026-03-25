import { notFound } from "next/navigation";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getSessionBundle, listSessions } from "@/lib/storage/repository";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const [bundle, sessions] = await Promise.all([
    getSessionBundle(sessionId),
    listSessions(),
  ]);

  if (!bundle) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={bundle.session}
      sessions={sessions}
      initialMessages={bundle.messages}
      initialUploads={bundle.uploads}
      initialReports={bundle.reports}
    />
  );
}
