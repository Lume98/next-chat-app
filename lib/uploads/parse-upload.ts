import "server-only";

import * as XLSX from "xlsx";

import type { UploadKind } from "@/lib/domain/types";

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const MAX_UPLOADS_PER_SESSION = 5;

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
]);

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n…`;
}

function toPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function detectUploadKind(file: File): UploadKind {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv")) {
    return "csv";
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    return "excel";
  }

  if (
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    TEXT_TYPES.has(file.type)
  ) {
    return "text";
  }

  throw new Error("UNSUPPORTED_FILE_TYPE");
}

function buildTabularSummary(headers: string[], rows: Record<string, unknown>[], kind: UploadKind) {
  const sampleRows = rows.slice(0, 5);
  const preview = sampleRows.length > 0 ? toPrettyJson(sampleRows) : "[]";
  const summary = `${kind === "csv" ? "CSV" : "Excel"} 文件，共 ${rows.length} 行，${headers.length} 列。`;
  const analysisText = truncate(
    [`文件类型: ${kind}`, `表头: ${headers.join(", ") || "无"}`, `总行数: ${rows.length}`, "示例数据:", preview].join("\n\n"),
    12000,
  );

  return {
    summary,
    schemaPreview: headers,
    analysisText,
  };
}

function parseCsv(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("EMPTY_FILE");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  const headers = rows[0] ? Object.keys(rows[0]) : [];

  return buildTabularSummary(headers, rows, "csv");
}

function parseExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("EMPTY_FILE");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const result = buildTabularSummary(headers, rows, "excel");

  return {
    ...result,
    summary: `${result.summary} 使用首个工作表 ${firstSheetName}。`,
  };
}

async function parseText(file: File) {
  const text = await file.text();
  const normalized = text.trim();

  if (!normalized) {
    throw new Error("EMPTY_FILE");
  }

  const excerpt = truncate(normalized, 12000);
  const lineCount = normalized.split(/\r?\n/).length;

  return {
    summary: `文本文件，共 ${lineCount} 行。`,
    schemaPreview: [],
    analysisText: [`文件类型: text`, `总行数: ${lineCount}`, "正文摘录:", excerpt].join("\n\n"),
  };
}

export async function parseUploadFile(file: File) {
  if (file.size === 0) {
    throw new Error("EMPTY_FILE");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const kind = detectUploadKind(file);

  if (kind === "text") {
    return {
      kind,
      ...(await parseText(file)),
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (kind === "csv") {
    return {
      kind,
      ...parseCsv(buffer),
    };
  }

  return {
    kind,
    ...parseExcel(buffer),
  };
}
