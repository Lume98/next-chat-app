import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  AgentName,
  AppState,
  MessageRecord,
  ReportArtifact,
  SessionBundle,
  SessionRecord,
  UploadRecord,
} from "@/lib/domain/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "workspace.json");

const EMPTY_STATE: AppState = {
  sessions: [],
  messages: [],
  uploads: [],
  reports: [],
};

let writeQueue = Promise.resolve();

function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state)) as AppState;
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(STORE_FILE, "utf8");
  } catch {
    await writeFile(STORE_FILE, JSON.stringify(EMPTY_STATE, null, 2), "utf8");
  }
}

async function readState(): Promise<AppState> {
  await ensureStore();
  const raw = await readFile(STORE_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      sessions: parsed.sessions ?? [],
      messages: parsed.messages ?? [],
      uploads: parsed.uploads ?? [],
      reports: parsed.reports ?? [],
    };
  } catch {
    return cloneState(EMPTY_STATE);
  }
}

async function writeState(state: AppState) {
  writeQueue = writeQueue.then(async () => {
    await ensureStore();
    await writeFile(STORE_FILE, JSON.stringify(state, null, 2), "utf8");
  });

  await writeQueue;
}

async function updateState<T>(updater: (state: AppState) => T | Promise<T>): Promise<T> {
  const state = await readState();
  const draft = cloneState(state);
  const result = await updater(draft);
  await writeState(draft);
  return result;
}

function sortSessions(sessions: SessionRecord[]) {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function sortMessages(messages: MessageRecord[]) {
  return [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function sortReports(reports: ReportArtifact[]) {
  return [...reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listSessions() {
  const state = await readState();
  return sortSessions(state.sessions);
}

export async function createSession(title = "新会话") {
  const now = new Date().toISOString();
  const session: SessionRecord = {
    id: randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    lastActiveAgent: "conversation",
  };

  await updateState((state) => {
    state.sessions.unshift(session);
  });

  return session;
}

export async function getSessionBundle(sessionId: string): Promise<SessionBundle | null> {
  const state = await readState();
  const session = state.sessions.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  return {
    session,
    messages: sortMessages(state.messages.filter((item) => item.sessionId === sessionId)),
    uploads: state.uploads.filter((item) => item.sessionId === sessionId),
    reports: sortReports(state.reports.filter((item) => item.sessionId === sessionId)),
  };
}

export async function getSessionRecord(sessionId: string) {
  const state = await readState();
  return state.sessions.find((item) => item.id === sessionId) ?? null;
}

export async function renameSessionIfUntitled(sessionId: string, title: string) {
  const trimmed = title.trim();

  if (!trimmed) {
    return getSessionRecord(sessionId);
  }

  await updateState((state) => {
    const session = state.sessions.find((item) => item.id === sessionId);

    if (!session || session.title !== "新会话") {
      return;
    }

    session.title = trimmed.slice(0, 48);
    session.updatedAt = new Date().toISOString();
  });

  return getSessionRecord(sessionId);
}

export async function addMessage(input: {
  sessionId: string;
  role: MessageRecord["role"];
  agent: AgentName;
  content: string;
  attachmentIds?: string[];
  artifactIds?: string[];
  status?: MessageRecord["status"];
}) {
  const now = new Date().toISOString();
  const message: MessageRecord = {
    id: randomUUID(),
    sessionId: input.sessionId,
    role: input.role,
    agent: input.agent,
    content: input.content,
    attachmentIds: input.attachmentIds ?? [],
    artifactIds: input.artifactIds ?? [],
    status: input.status ?? "complete",
    createdAt: now,
  };

  await updateState((state) => {
    const session = state.sessions.find((item) => item.id === input.sessionId);

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    session.updatedAt = now;
    session.lastActiveAgent = input.agent;
    state.messages.push(message);
  });

  return message;
}

export async function addUpload(input: Omit<UploadRecord, "id" | "createdAt">) {
  const now = new Date().toISOString();
  const upload: UploadRecord = {
    ...input,
    id: randomUUID(),
    createdAt: now,
  };

  await updateState((state) => {
    const session = state.sessions.find((item) => item.id === input.sessionId);

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    session.updatedAt = now;
    state.uploads.push(upload);
  });

  return upload;
}

export async function addReport(input: Omit<ReportArtifact, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const report: ReportArtifact = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await updateState((state) => {
    const session = state.sessions.find((item) => item.id === input.sessionId);

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    session.updatedAt = now;
    session.lastActiveAgent = "report";
    session.latestReportId = report.id;
    state.reports.push(report);
  });

  return report;
}

export async function getSessionUploads(sessionId: string) {
  const state = await readState();
  return state.uploads.filter((item) => item.sessionId === sessionId);
}

export async function getSessionReports(sessionId: string) {
  const state = await readState();
  return sortReports(state.reports.filter((item) => item.sessionId === sessionId));
}
