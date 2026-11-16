import { getMyOrders } from '@/lib/account';
import { formatPrice } from '@/lib/format';
import { TRACK_PATH } from '@/lib/routes';
import OrderRow, { fmtDate } from '@/components/account/OrderRow';
import OrderTimeline from '@/components/account/OrderTimeline';
import Link from 'next/link';

export const metadata = { title: 'Track your orders' };

const MESSAGE = [
  'We have received your order and are getting it ready.',
  'Your order is packed and will be handed to the courier soon.',
  'Your order is on the way to you.',
];

export default async function AccountTrack() {
  const orders = await getMyOrders();
  const active = orders.filter((o) => !o.cancelled && o.step < 3);
  const past = orders.filter((o) => o.cancelled || o.step === 3).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-head text-2xl font-bold">Track your orders</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          The latest status of your orders. No order number needed.
        </p>
      </div>

      {active.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {active.map((o) => {
            const items = o.lines.reduce((n, l) => n + l.quantity, 0);
            return (
              <li
                key={o.id}
                className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-[#171b22]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-head text-lg font-bold">
                      Order {o.displayId ? `#${o.displayId}` : ''}
                    </h2>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      Placed {fmtDate(o.createdAt)} · {items}{' '}
                      {items === 1 ? 'item' : 'items'} ·{' '}
                      {formatPrice(o.total, o.currency)}
                    </p>
                  </div>
                  <a
                    href={`/account/orders/${o.id}`}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    Details →
                  </a>
                </div>

                <div className="mt-5">
                  <OrderTimeline step={o.step} cancelled={false} />
                </div>

                <p className="mt-4 text-sm">{MESSAGE[o.step]}</p>

                {(o.trackingNumber || o.trackingUrl) && (
                  <p className="mt-2 text-sm text-black/70 dark:text-white/70">
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

                <ul className="mt-4 flex -space-x-2">
                  {o.lines.slice(0, 5).map((l) => (
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
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-black/20 px-6 py-12 text-center dark:border-white/20">
          <p className="text-sm text-black/60 dark:text-white/60">
            You have no orders on the way right now.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      )}

      {past.length > 0 && (
        <section aria-labelledby="past">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="past" className="font-head text-lg font-bold">
              Delivered or cancelled
            </h2>
            <Link
              href="/account/orders"
              className="text-sm font-semibold text-accent hover:underline"
            >
              All orders →
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {past.map((o) => (
              <li key={o.id}>
                <OrderRow o={o} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-black/60 dark:text-white/60">
        Ordered without logging in?{' '}
        <a href={TRACK_PATH} className="text-accent hover:underline">
          Track with your order number
        </a>
      </p>
    </div>
  );
}
