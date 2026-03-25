"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageComposer } from "@/components/workspace/message-composer";
import { MessageList } from "@/components/workspace/message-list";
import { ReportPanel } from "@/components/workspace/report-panel";
import { SessionSidebar } from "@/components/workspace/session-sidebar";
import { UploadList } from "@/components/workspace/upload-list";
import type {
  MessageRecord,
  ReportArtifact,
  SessionRecord,
  UploadRecord,
} from "@/lib/domain/types";

function sortSessions(sessions: SessionRecord[]) {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function sortReports(reports: ReportArtifact[]) {
  return [...reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function WorkspaceShell({
  session,
  sessions,
  initialMessages,
  initialUploads,
  initialReports,
}: {
  session: SessionRecord;
  sessions: SessionRecord[];
  initialMessages: MessageRecord[];
  initialUploads: UploadRecord[];
  initialReports: ReportArtifact[];
}) {
  const [currentSession, setCurrentSession] = useState(session);
  const [sessionList, setSessionList] = useState(sortSessions(sessions));
  const [messages, setMessages] = useState(initialMessages);
  const [uploads, setUploads] = useState(initialUploads);
  const [reports, setReports] = useState(sortReports(initialReports));
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  function syncSession(nextSession: SessionRecord) {
    setCurrentSession(nextSession);
    setSessionList((previous) =>
      sortSessions([
        nextSession,
        ...previous.filter((item) => item.id !== nextSession.id),
      ]),
    );
  }

  function touchCurrentSession(patch: Partial<SessionRecord>) {
    syncSession({ ...currentSession, ...patch });
  }

  async function sendMessage() {
    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          content,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        session?: SessionRecord;
        userMessage?: MessageRecord;
        assistantMessage?: MessageRecord;
      };

      if (
        !response.ok ||
        !payload.session ||
        !payload.userMessage ||
        !payload.assistantMessage
      ) {
        throw new Error(payload.error || "发送消息失败");
      }

      syncSession(payload.session);
      setMessages((previous) => [
        ...previous,
        payload.userMessage as MessageRecord,
        payload.assistantMessage as MessageRecord,
      ]);
      setDraft("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "发送消息失败",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function uploadFile(file: File) {
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("sessionId", currentSession.id);
      formData.set("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        error?: string;
        upload?: UploadRecord;
      };

      if (!response.ok || !payload.upload) {
        throw new Error(payload.error || "上传文件失败");
      }

      setUploads((previous) => [...previous, payload.upload as UploadRecord]);
      touchCurrentSession({ updatedAt: new Date().toISOString() });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "上传文件失败",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function generateReport() {
    if (isGenerating || uploads.length === 0) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        report?: ReportArtifact;
        reportMessage?: MessageRecord;
      };

      if (!response.ok || !payload.report || !payload.reportMessage) {
        throw new Error(payload.error || "生成报表失败");
      }

      setReports((previous) => sortReports([payload.report as ReportArtifact, ...previous]));
      setMessages((previous) => [...previous, payload.reportMessage as MessageRecord]);
      touchCurrentSession({
        updatedAt: payload.report.updatedAt,
        lastActiveAgent: "report",
        latestReportId: payload.report.id,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "生成报表失败",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 xl:min-h-[calc(100vh-3rem)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <SessionSidebar
          currentSession={currentSession}
          sessions={sessionList}
          uploads={uploads}
          reports={reports}
        />

        <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-h-[80vh] min-w-0 flex-col gap-4 xl:min-h-0">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>请求失败</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-border bg-muted/20 p-3 sm:p-4">
              <MessageList messages={messages} isSending={isSending} />
            </div>
            <div className="shrink-0">
              <MessageComposer
                value={draft}
                onChange={setDraft}
                onSubmit={sendMessage}
                isSending={isSending}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-4 xl:overflow-y-auto xl:pr-1">
            <UploadList
              uploads={uploads}
              onUpload={uploadFile}
              isUploading={isUploading}
            />
            <ReportPanel
              reports={reports}
              onGenerate={generateReport}
              isGenerating={isGenerating}
              canGenerate={uploads.length > 0}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
