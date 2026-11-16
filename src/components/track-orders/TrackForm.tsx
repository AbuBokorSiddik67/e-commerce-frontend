'use client';

import { useActionState } from 'react';
import { trackOrder, type TrackState } from '@/app/track-order/actions';

const card =
  'rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#171b22]';
const inputCls =
  'w-full rounded-lg border border-black/15 bg-transparent px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-black/35 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-white/20 dark:placeholder:text-white/35';

const STEPS = [
  {
    key: 'placed',
    label: 'Order placed',
    icon: [
      'M9 11l3 3L22 4',
      'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    ],
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: ['M21 8l-9-5-9 5v8l9 5 9-5z', 'M3 8l9 5 9-5', 'M12 13v8'],
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: [
      'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2',
      'M15 18H9',
      'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
      'M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
      'M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
    ],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  },
] as const;

const Ico = ({ d, size = 20 }: { d: readonly string[]; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d.map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const money = (n: number, cur: string) => {
  const sym = cur?.toLowerCase() === 'bdt' ? '৳' : cur?.toUpperCase() + ' ';
  return `${sym}${Math.round(n).toLocaleString('en-US')}`;
};

const fmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

export default function TrackForm({
  defaultOrder = '',
}: {
  defaultOrder?: string;
}) {
  const [state, action, pending] = useActionState<TrackState, FormData>(
    trackOrder,
    {},
  );
  const o = state.order;

  return (
    <div className="mx-auto max-w-2xl">
      <form action={action} className={`${card} p-6 sm:p-8`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Order number
            </span>
            <input
              name="order_number"
              required
              inputMode="numeric"
              placeholder="e.g. 1024"
              defaultValue={defaultOrder}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Phone number
            </span>
            <input
              name="phone"
              required
              type="tel"
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </label>
        </div>

        {state.error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-sale/10 px-4 py-3 text-sm text-sale ring-1 ring-sale/20"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 dark:bg-accent"
        >
          {pending ? 'Checking...' : 'Track order'}
        </button>
        <p className="mt-3 text-center text-xs text-black/50 dark:text-white/50">
          Use the phone number you entered at checkout.
        </p>
      </form>

      {o && (
        <div className={`${card} mt-6 overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-6 py-5 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
                Order
              </p>
              <p className="font-head text-2xl font-bold">#{o.number}</p>
              <p className="mt-0.5 text-sm text-black/55 dark:text-white/55">
                Placed on {fmt(o.placed_at)}
              </p>
            </div>
            <span
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${
                o.cancelled
                  ? 'bg-sale/10 text-sale ring-sale/20'
                  : 'bg-accent/10 text-accent ring-accent/20'
              }`}
            >
              {o.cancelled ? 'Cancelled' : STEPS[o.stage].label}
            </span>
          </div>

          {!o.cancelled && (
            <ol className="grid grid-cols-4 gap-2 px-4 py-8 sm:px-6">
              {STEPS.map((s, i) => {
                const done = i <= o.stage;
                const date = (o.dates as any)[s.key] as string | undefined;
                return (
                  <li
                    key={s.key}
                    className="relative flex flex-col items-center text-center"
                  >
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`absolute right-1/2 top-6 -z-0 h-[3px] w-full ${i <= o.stage ? 'bg-accent' : 'bg-black/10 dark:bg-white/10'}`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ring-1 transition-colors ${
                        done
                          ? 'bg-accent text-white ring-accent'
                          : 'bg-white text-black/35 ring-black/15 dark:bg-[#171b22] dark:text-white/35 dark:ring-white/15'
                      }`}
                    >
                      <Ico d={s.icon} />
                    </span>
                    <span
                      className={`mt-2.5 text-xs font-semibold sm:text-sm ${done ? '' : 'text-black/45 dark:text-white/45'}`}
                    >
                      {s.label}
                    </span>
                    {done && date && (
                      <span className="mt-0.5 text-[11px] text-black/50 dark:text-white/50">
                        {fmt(date)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="divide-y divide-black/10 border-t border-black/10 dark:divide-white/10 dark:border-white/10">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 px-6 py-4">
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                  {it.thumbnail && (
                    <img
                      src={it.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {it.title}
                  </span>
                  <span className="block text-xs text-black/55 dark:text-white/55">
                    {it.variant ? `${it.variant} · ` : ''}Qty {it.quantity}
                  </span>
                </span>
                <span className="text-sm font-semibold">
                  {money(it.price * it.quantity, o.currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-black/10 px-6 py-5 text-sm dark:border-white/10">
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Subtotal</dt>
              <dd>{money(o.subtotal, o.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Delivery</dt>
              <dd>{money(o.shipping, o.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold dark:border-white/10">
              <dt>Total</dt>
              <dd>{money(o.total, o.currency)}</dd>
            </div>
            {o.city && (
              <p className="pt-2 text-xs text-black/50 dark:text-white/50">
                Delivering to {o.city}
              </p>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
