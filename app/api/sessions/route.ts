import { createSession, listSessions } from "@/lib/storage/repository";

export const runtime = "nodejs";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET() {
  const sessions = await listSessions();
  return Response.json({ sessions });
}

export async function POST(request: Request) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const title = isObject(payload) && typeof payload.title === "string" ? payload.title : undefined;
  const session = await createSession(title?.trim() || undefined);

  return Response.json({ session }, { status: 201 });
}
