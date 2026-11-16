const BACKEND = (
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
).replace(/\/$/, '');
const ORIGINS = [
  ...new Set([BACKEND, 'http://localhost:9000', 'http://127.0.0.1:9000']),
];

export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  for (const o of ORIGINS) {
    const prefix = `${o}/static/`;
    if (url.startsWith(prefix)) return `/media/${url.slice(prefix.length)}`;
  }
  return url;
}

export function localizeMedia<T>(value: T): T {
  if (typeof value === 'string') return (mediaUrl(value) ?? value) as T;
  if (Array.isArray(value)) return value.map(localizeMedia) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        localizeMedia(v),
      ]),
    ) as T;
  }
  return value;
}
