export type AgentName = "conversation" | "report";

export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "pending" | "complete" | "error";

export type UploadKind = "csv" | "excel" | "text";

export type UploadStatus = "parsed" | "error";

export type ArtifactStatus = "pending" | "complete" | "error";

export interface SessionRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAgent: AgentName;
  latestReportId?: string;
}

export interface MessageRecord {
  id: string;
  sessionId: string;
  role: MessageRole;
  agent: AgentName;
  content: string;
  attachmentIds: string[];
  artifactIds: string[];
  status: MessageStatus;
  createdAt: string;
}

export interface UploadRecord {
  id: string;
  sessionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  kind: UploadKind;
  storageKey: string;
  parseStatus: UploadStatus;
  summary: string;
  schemaPreview: string[];
  analysisText: string;
  createdAt: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export interface ReportArtifact {
  id: string;
  sessionId: string;
  title: string;
  sourceUploadIds: string[];
  status: ArtifactStatus;
  format: "markdown";
  summary: string;
  sections: ReportSection[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionBundle {
  session: SessionRecord;
  messages: MessageRecord[];
  uploads: UploadRecord[];
  reports: ReportArtifact[];
}

export interface AppState {
  sessions: SessionRecord[];
  messages: MessageRecord[];
  uploads: UploadRecord[];
  reports: ReportArtifact[];
}
