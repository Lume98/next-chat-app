import { generateReportContent } from "@/lib/agents/anthropic";
import {
  addMessage,
  addReport,
  getSessionRecord,
  getSessionReports,
  getSessionUploads,
} from "@/lib/storage/repository";

export const runtime = "nodejs";

type ReportRequest = {
  sessionId?: unknown;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: ReportRequest;

  try {
    payload = (await request.json()) as ReportRequest;
  } catch {
    return badRequest("请求体必须是有效 JSON");
  }

  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.trim() : "";

  if (!sessionId) {
    return badRequest("缺少 sessionId");
  }

  const session = await getSessionRecord(sessionId);

  if (!session) {
    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  const [uploads, priorReports] = await Promise.all([
    getSessionUploads(sessionId),
    getSessionReports(sessionId),
  ]);

  if (uploads.length === 0) {
    return badRequest("请先上传至少一个文件，再生成报表");
  }

  const result = await generateReportContent({
    session,
    uploads,
    priorReports,
  });

  const report = await addReport({
    sessionId,
    title: result.title,
    sourceUploadIds: uploads.map((upload) => upload.id),
    status: "complete",
    format: "markdown",
    summary: result.summary,
    sections: result.sections,
  });

  const reportMessage = await addMessage({
    sessionId,
    role: "assistant",
    agent: "report",
    content: [report.title, report.summary].join("\n\n"),
    artifactIds: [report.id],
  });

  return Response.json({ report, reportMessage }, { status: 201 });
}
