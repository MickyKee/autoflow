export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value };
}

export function readPath(payload: Record<string, unknown>, path: string) {
  const segments = path.split(".").filter(Boolean);
  let cursor: unknown = payload;

  for (const segment of segments) {
    if (!cursor || typeof cursor !== "object" || Array.isArray(cursor)) {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[segment];
  }

  return cursor;
}
