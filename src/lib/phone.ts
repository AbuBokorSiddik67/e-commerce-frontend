// src/lib/phone.ts
export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[^\d]/g, '').replace(/^88/, '');
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}
