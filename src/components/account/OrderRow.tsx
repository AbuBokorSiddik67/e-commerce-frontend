// src/components/account/OrderRow.tsx
import { formatPrice } from '@/lib/format';
import type { AccountOrder } from '@/lib/account';

export const statusClass = (s: string) =>
  s === 'Delivered'
    ? 'bg-accent/10 text-accent'
    : s === 'Cancelled'
      ? 'bg-sale/10 text-sale'
      : 'bg-black/5 dark:bg-white/10';

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function OrderRow({ o }: { o: AccountOrder }) {
  return (
    <a
      href={`/account/orders/${o.id}`}
      className="block rounded-xl border border-black/10 bg-white p-4 hover:border-accent/40 dark:border-white/15 dark:bg-[#171b22]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            Order {o.displayId ? `#${o.displayId}` : ''}
          </p>
          <p className="text-xs text-black/60 dark:text-white/60">
            {fmtDate(o.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(o.status)}`}
        >
          {o.status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <ul className="flex -space-x-2">
          {o.lines.slice(0, 4).map((l) => (
            <li
              key={l.id}
              className="h-10 w-10 overflow-hidden rounded-md border-2 border-white bg-black/5 dark:border-[#171b22] dark:bg-white/10"
            >
              {l.thumbnail && (
                <img
                  src={l.thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </li>
          ))}
        </ul>
        <p className="text-sm font-bold">{formatPrice(o.total, o.currency)}</p>
      </div>
    </a>
  );
}
