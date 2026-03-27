import { getSessionBundle } from "@/lib/storage/repository";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);

  if (!bundle) {
    return Response.json({ error: "会话不存在" }, { status: 404 });
  }

  return Response.json({
    session: bundle.session,
    messages: bundle.messages,
  });
}
