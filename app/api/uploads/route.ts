import { randomUUID } from "node:crypto";

import {
  addUpload,
  getSessionRecord,
  getSessionUploads,
} from "@/lib/storage/repository";
import {
  MAX_UPLOADS_PER_SESSION,
  parseUploadFile,
} from "@/lib/uploads/parse-upload";

export const runtime = "nodejs";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function mapUploadError(error: unknown) {
  if (!(error instanceof Error)) {
    return { status: 500, message: "上传解析失败" };
  }

  switch (error.message) {
    case "EMPTY_FILE":
      return { status: 400, message: "文件不能为空" };
    case "FILE_TOO_LARGE":
      return { status: 400, message: "文件超过 10MB 限制" };
    case "UNSUPPORTED_FILE_TYPE":
      return { status: 400, message: "仅支持 CSV、Excel、TXT 或 Markdown 文件" };
    default:
      return { status: 500, message: "上传解析失败" };
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const sessionIdValue = formData.get("sessionId");
  const fileValue = formData.get("file");

  const sessionId = typeof sessionIdValue === "string" ? sessionIdValue.trim() : "";

  if (!sessionId) {
    return Response.json({ error: "缺少 sessionId" }, { status: 400 });
  }

  if (!(fileValue instanceof File)) {
    return Response.json({ error: "缺少上传文件" }, { status: 400 });
  }

  const session = await getSessionRecord(sessionId);

  if (!session) {
    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  const uploads = await getSessionUploads(sessionId);

  if (uploads.length >= MAX_UPLOADS_PER_SESSION) {
    return Response.json({ error: `单个会话最多上传 ${MAX_UPLOADS_PER_SESSION} 个文件` }, { status: 400 });
  }

  try {
    const parsed = await parseUploadFile(fileValue);
    const upload = await addUpload({
      sessionId,
      fileName: fileValue.name,
      mimeType: fileValue.type || "application/octet-stream",
      size: fileValue.size,
      kind: parsed.kind,
      storageKey: `${sessionId}/${randomUUID()}-${sanitizeFileName(fileValue.name)}`,
      parseStatus: "parsed",
      summary: parsed.summary,
      schemaPreview: parsed.schemaPreview,
      analysisText: parsed.analysisText,
    });

    return Response.json({ upload }, { status: 201 });
  } catch (error) {
    const mapped = mapUploadError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}
