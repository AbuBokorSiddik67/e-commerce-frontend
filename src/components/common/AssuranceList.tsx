import { TrustIcon } from '@/components/common/TrustIcon';
import type { AssuranceItem } from '@/lib/assurance';

export default function AssuranceList({
  items,
  cols = 2,
}: {
  items: AssuranceItem[];
  cols?: 1 | 2;
}) {
  if (!items.length) return null;
  return (
    <ul
      className={`grid gap-x-4 gap-y-2 rounded-lg border border-black/10 bg-black/[0.02] p-3 text-[13px] dark:border-white/15 dark:bg-white/5 ${
        cols === 2 ? 'sm:grid-cols-2' : ''
      }`}
    >
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="shrink-0 text-accent">
            <TrustIcon name={it.icon} size={16} />
          </span>
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}
