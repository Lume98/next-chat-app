import { WorkspaceEntry } from "@/components/workspace/workspace-entry";
import { listSessions } from "@/lib/storage/repository";

export default async function Home() {
  const sessions = await listSessions();

  return (
    <WorkspaceEntry
      sessions={sessions.slice(0, 8)}
      totalSessions={sessions.length}
    />
  );
}
