// src/app/account/orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getMyOrders } from '@/lib/account';
import { formatPrice } from '@/lib/format';
import { fmtDate, statusClass } from '@/components/account/OrderRow';
import Link from 'next/link';
import OrderTimeline from '../../../../components/account/OrderTimeline';

export const metadata = { title: 'Order details' };

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = (await getMyOrders()).find((x) => x.id === id);
  if (!o) notFound();

  const money = (n: number) => formatPrice(n, o.currency);
  const box =
    'rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-[#171b22]';

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/account/orders"
        className="text-sm text-accent hover:underline"
      >
        ← All orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-head text-2xl font-bold">
            Order {o.displayId ? `#${o.displayId}` : ''}
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Placed on {fmtDate(o.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(o.status)}`}
        >
          {o.status}
        </span>
      </div>

      <section className={box}>
        <OrderTimeline step={o.step} cancelled={o.cancelled} />
        {(o.trackingNumber || o.trackingUrl) && (
          <p className="mt-4 text-sm text-black/70 dark:text-white/70">
            {o.trackingNumber && (
              <>
                Courier tracking number:{' '}
                <strong>{o.trackingNumber}</strong>{' '}
              </>
            )}
            {o.trackingUrl && (
              <a
                href={o.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                Track with courier →
              </a>
            )}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className={`${box} text-sm`}>
          <h2 className="mb-2 font-head font-bold">Delivering to</h2>
          <p>{o.name}</p>
          {o.phone && (
            <p className="text-black/70 dark:text-white/70">{o.phone}</p>
          )}
          <p className="text-black/70 dark:text-white/70">{o.address}</p>
        </section>
        <section className={`${box} text-sm`}>
          <h2 className="mb-2 font-head font-bold">Payment</h2>
          <p>{o.paymentMethod === 'bkash' ? 'bKash' : 'Cash on delivery'}</p>
          <p className="mt-3 text-black/60 dark:text-white/60">
            Need help?{' '}
            <a href="/contact" className="text-accent hover:underline">
              Contact us
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
