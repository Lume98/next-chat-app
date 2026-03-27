import { openApiDocument } from "@/lib/api-docs/openapi";

export async function GET() {
  return Response.json(openApiDocument);
}
