export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function isResponse<T>(value: T | Response): value is Response {
  return value instanceof Response;
}

export function serverError(message: string, error: unknown) {
  return Response.json(
    {
      error: error instanceof Error ? error.message : message,
    },
    { status: 500 },
  );
}
