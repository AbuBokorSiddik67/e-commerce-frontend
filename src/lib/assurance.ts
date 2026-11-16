export type AssuranceItem = { icon: string; text: string };

type Settings = {
  assurance_enabled?: boolean;
  assurance_items?: { icon?: string; text?: string }[] | null;
} | null;

export function getAssuranceItems(s: Settings): AssuranceItem[] {
  if (!s?.assurance_enabled) return [];
  return (s.assurance_items ?? [])
    .filter((i) => i.text?.trim())
    .slice(0, 4)
    .map((i) => ({ icon: i.icon || 'shield', text: i.text!.trim() }));
}
