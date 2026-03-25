import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import type {
  MessageRecord,
  ReportArtifact,
  ReportSection,
  SessionRecord,
  UploadRecord,
} from "@/lib/domain/types";

const MODEL = "claude-opus-4-6";

let client: Anthropic | null | undefined;

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  if (client) {
    return client;
  }

  client = new Anthropic({ apiKey });
  return client;
}

function textFromContent(content: Anthropic.Message["content"]) {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function summarizeWorkspace(uploads: UploadRecord[], reports: ReportArtifact[]) {
  const uploadSummary = uploads.length
    ? uploads
        .map((upload) => `- ${upload.fileName}: ${upload.summary}`)
        .join("\n")
    : "- 当前没有上传文件";

  const reportSummary = reports.length
    ? reports
        .slice(0, 3)
        .map((report) => `- ${report.title}: ${report.summary}`)
        .join("\n")
    : "- 当前没有报表";

  return [`上传文件:`, uploadSummary, "", `已有报表:`, reportSummary].join("\n");
}

function fallbackConversationReply(message: string, uploads: UploadRecord[], reports: ReportArtifact[]) {
  const uploadHint = uploads.length
    ? `当前会话里有 ${uploads.length} 个上传文件，我可以围绕这些文件继续帮你分析。`
    : "当前还没有上传文件，你可以先上传 CSV、Excel 或文本，再让我进一步分析。";
  const reportHint = reports.length
    ? `另外你已经生成过 ${reports.length} 份报表，也可以继续追问报表里的结论。`
    : "如果你想快速得到结构化结论，也可以直接生成一份报表。";

  return `我已收到你的问题：${message}\n\n${uploadHint}\n${reportHint}`;
}

function parseSections(markdown: string) {
  const trimmed = markdown.trim();

  if (!trimmed) {
    return [];
  }

  const normalized = trimmed.startsWith("## ") ? trimmed : `## Summary\n${trimmed}`;
  const chunks = normalized.split(/\n(?=##\s)/g).map((chunk) => chunk.trim()).filter(Boolean);

  return chunks.map<ReportSection>((chunk, index) => {
    const lines = chunk.split("\n");
    const heading = lines[0].replace(/^##\s*/, "").trim() || `Section ${index + 1}`;
    const content = lines.slice(1).join("\n").trim();

    return {
      id: `section-${index + 1}`,
      title: heading,
      content,
    };
  });
}

function fallbackReport(uploadRecords: UploadRecord[]) {
  const sourceNames = uploadRecords.map((upload) => upload.fileName).join("、");
  const sections: ReportSection[] = [
    {
      id: "section-1",
      title: "Executive Summary",
      content: `本次报告基于 ${uploadRecords.length} 个文件生成，来源包括：${sourceNames}。整体建议先围绕数据结构、异常值和关键字段做进一步追问。`,
    },
    {
      id: "section-2",
      title: "Key Findings",
      content: uploadRecords.map((upload) => `- ${upload.fileName}: ${upload.summary}`).join("\n"),
    },
    {
      id: "section-3",
      title: "Data Snapshot",
      content: uploadRecords
        .map((upload) => {
          const preview = upload.schemaPreview.length > 0 ? upload.schemaPreview.join(", ") : "无结构化字段";
          return `- ${upload.fileName}: ${preview}`;
        })
        .join("\n"),
    },
    {
      id: "section-4",
      title: "Risks and Limitations",
      content: "当前为 MVP 报告，主要依据上传文件摘要与样例内容生成，尚未接入更深层的数据校验与外部系统比对。",
    },
  ];

  return {
    title: `分析报告 · ${uploadRecords[0]?.fileName ?? "未命名数据"}`,
    summary: sections[0].content,
    sections,
  };
}

export async function generateConversationReply(input: {
  session: SessionRecord;
  history: MessageRecord[];
  uploads: UploadRecord[];
  reports: ReportArtifact[];
  latestUserMessage: string;
}) {
  const sdk = getClient();

  if (!sdk) {
    return fallbackConversationReply(input.latestUserMessage, input.uploads, input.reports);
  }

  try {
    const response = await sdk.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: [
        "你是一个 AI 多 Agent 应用中的对话 Agent。",
        "你的职责是回答用户问题、结合当前会话里的上传文件和报表上下文提供建议。",
        "回答要简洁、直接、适合产品内聊天场景。",
        "如果用户需要结构化结论或数据总结，可以建议其生成报表。",
        "当前工作空间摘要如下：",
        summarizeWorkspace(input.uploads, input.reports),
      ].join("\n\n"),
      messages: input.history.slice(-12).map((message) => ({
        role: message.role === "system" ? "assistant" : message.role,
        content: message.content,
      })),
    });

    return textFromContent(response.content) || fallbackConversationReply(input.latestUserMessage, input.uploads, input.reports);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return `对话 Agent 暂时无法连接模型服务（${error.status ?? "unknown"}）。你可以稍后重试，或先继续上传和整理数据。`;
    }

    return fallbackConversationReply(input.latestUserMessage, input.uploads, input.reports);
  }
}

export async function generateReportContent(input: {
  session: SessionRecord;
  uploads: UploadRecord[];
  priorReports: ReportArtifact[];
}) {
  const sdk = getClient();

  if (!sdk) {
    return fallbackReport(input.uploads);
  }

  const sourceBundle = input.uploads
    .map(
      (upload, index) =>
        `文件 ${index + 1}: ${upload.fileName}\n摘要: ${upload.summary}\n结构: ${upload.schemaPreview.join(", ") || "无"}\n内容摘要:\n${upload.analysisText}`,
    )
    .join("\n\n");

  try {
    const response = await sdk.messages.create({
      model: MODEL,
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      system: [
        "你是一个 AI 多 Agent 应用中的报表 Agent。",
        "请基于用户上传的数据生成一份结构化中文报告。",
        "请严格使用以下 H2 标题输出：",
        "## Executive Summary",
        "## Key Findings",
        "## Data Snapshot",
        "## Risks and Limitations",
        "## Recommended Next Steps",
        "内容要清晰、简洁、可读。不要输出 JSON。",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: [
            `会话标题: ${input.session.title}`,
            `历史报表数: ${input.priorReports.length}`,
            "以下是本次可分析的数据源：",
            sourceBundle,
          ].join("\n\n"),
        },
      ],
    });

    const markdown = textFromContent(response.content);
    const sections = parseSections(markdown);

    if (sections.length === 0) {
      return fallbackReport(input.uploads);
    }

    return {
      title: `分析报告 · ${input.uploads[0]?.fileName ?? input.session.title}`,
      summary: sections[0]?.content || "已生成结构化报告。",
      sections,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return {
        ...fallbackReport(input.uploads),
        summary: `模型服务暂时不可用（${error.status ?? "unknown"}），已生成本地简化报告。`,
      };
    }

    return fallbackReport(input.uploads);
  }
}
