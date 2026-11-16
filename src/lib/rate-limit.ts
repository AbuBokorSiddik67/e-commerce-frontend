const hits = new Map<string, number[]>();

function recent(key: string, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.set(key, list);
  return list;
}

export const isLimited = (key: string, limit: number, windowMs: number) =>
  recent(key, windowMs).length >= limit;

export function record(key: string) {
  const list = hits.get(key) ?? [];
  list.push(Date.now());
  hits.set(key, list);

  if (hits.size > 5000) {
    const cutoff = Date.now() - 86_400_000;
    for (const [k, v] of hits)
      if (!v.length || v[v.length - 1] < cutoff) hits.delete(k);
  }
}
