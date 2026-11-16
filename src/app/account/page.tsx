// src/app/account/page.tsx
import OrderRow, { fmtDate } from '@/components/account/OrderRow';
import { getMyOrders } from '@/lib/account';
import { getCustomer } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import OrderTimeline from '../../components/account/OrderTimeline';

export const metadata = { title: 'My account' };

export default async function AccountHome() {
  const [customer, orders] = await Promise.all([getCustomer(), getMyOrders()]);
  const recent = orders.slice(0, 3);
  const spent = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((n, o) => n + o.total, 0);
  const currency = orders[0]?.currency;
  const active = orders.find((o) => !o.cancelled && o.step < 3);

  const stats = [
    { k: 'Orders', v: String(orders.length), wide: false },
    {
      k: 'Total spent',
      v: currency ? formatPrice(spent, currency) : '-',
      wide: false,
    },
    {
      k: 'Last order',
      v: orders[0] ? fmtDate(orders[0].createdAt) : '-',
      wide: true,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
      <h1 className="break-words font-head text-xl font-bold sm:text-2xl">
        Hi, {customer?.firstName || 'there'}
      </h1>

      {active && (
        <section
          aria-label="Order in progress"
          className="rounded-xl border border-accent/30 bg-accent/5 p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">
              Your order {active.displayId ? `#${active.displayId}` : ''} is in
              progress
            </p>
            <a
              href="/account/track"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Track →
            </a>
          </div>
          <OrderTimeline step={active.step} cancelled={false} />
        </section>
      )}

      {/* ফোনে ২ কলাম (শেষটা পুরো চওড়া), sm থেকে ৩ কলাম */}
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {stats.map((s) => (
          <div
            key={s.k}
            className={`min-w-0 rounded-xl border border-black/10 bg-white p-3.5 sm:p-4 dark:border-white/15 dark:bg-[#171b22] ${
              s.wide ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <dt className="text-xs text-black/60 dark:text-white/60">{s.k}</dt>
            <dd
              className="mt-1 truncate text-base font-bold sm:text-lg"
              title={s.v}
            >
              {s.v}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent" className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="recent" className="font-head text-base font-bold sm:text-lg">
            Recent orders
          </h2>
          {orders.length > 3 && (
            <Link
              href="/account/orders"
              className="shrink-0 text-sm font-semibold text-accent hover:underline"
            >
              View all →
            </Link>
          )}
        </div>

        {recent.length ? (
          <ul className="flex flex-col gap-2.5 sm:gap-3">
            {recent.map((o) => (
              <li key={o.id} className="min-w-0">
                <OrderRow o={o} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-black/20 px-4 py-8 text-center sm:px-6 sm:py-10 dark:border-white/20">
            <p className="text-sm text-black/60 dark:text-white/60">
              You have not placed any orders yet.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:bg-accent"
            >
              Start shopping
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

