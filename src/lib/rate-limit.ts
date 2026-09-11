const buckets = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entries = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (entries.length >= limit) {
    buckets.set(key, entries);
    return true;
  }
  entries.push(now);
  buckets.set(key, entries);
  return false;
}