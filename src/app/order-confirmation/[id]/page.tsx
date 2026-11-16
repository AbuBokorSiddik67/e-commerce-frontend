import { formatPrice } from '@/lib/format';
import { getOrder } from '@/lib/orders';
import Link from 'next/dist/client/link';
import { cookies } from 'next/headers';

export const metadata = { title: 'Order placed', robots: { index: false } };

export default async function OrderConfirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tick = (
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
  const mine = (await cookies()).get('last_order')?.value === id;
  const o = mine ? await getOrder(id) : null;

  if (!mine) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        {tick}
        <h1 className="mt-4 font-head text-2xl font-bold">
          Thank you, your order is placed
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          For your privacy, order details are only shown on the device that
          placed the order.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Continue shopping
        </Link>
      </main>
    );
  }
  if (!o) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        {tick}
        <h1 className="mt-4 font-head text-2xl font-bold">
          Thank you, your order is placed
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          We could not load the details just now, but your order was received.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  const money = (n: number) => formatPrice(n, o.currency);
  const firstName = o.name.split(' ')[0];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="text-center">
        {tick}
        <h1 className="mt-4 font-head text-2xl font-bold">
          Thank you{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Your order {o.displayId ? <strong>#{o.displayId}</strong> : null} has
          been placed.
          {o.email ? ` A copy will go to ${o.email}.` : ''}
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-[#171b22]">
        <ul className="flex flex-col gap-3">
          {o.lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 text-sm">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-black/[0.04] dark:bg-white/5">
                {l.thumbnail && (
                  <img
                    src={l.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 font-medium">{l.title}</span>
                <span className="block text-xs text-black/60 dark:text-white/60">
                  {l.variantTitle && l.variantTitle !== l.title
                    ? `${l.variantTitle} · `
                    : ''}
                  Qty {l.quantity}
                </span>
              </span>
              <span className="font-semibold">{money(l.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm dark:border-white/15">
          <div className="flex justify-between">
            <dt className="text-black/60 dark:text-white/60">Subtotal</dt>
            <dd>{money(o.subtotal)}</dd>
          </div>
          {o.discount > 0 && (
            <div className="flex justify-between text-accent">
              <dt>Discount</dt>
              <dd>−{money(o.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-black/60 dark:text-white/60">Delivery</dt>
            <dd>{money(o.shipping)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-black/10 pt-3 text-base font-bold dark:border-white/15">
            <dt>Total (pay on delivery)</dt>
            <dd>{money(o.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-xl border border-black/10 bg-white p-5 text-sm dark:border-white/15 dark:bg-[#171b22]">
        <h2 className="mb-2 font-head font-bold">Delivering to</h2>
        <p>{o.name}</p>
        {o.phone && (
          <p className="text-black/70 dark:text-white/70">{o.phone}</p>
        )}
        <p className="text-black/70 dark:text-white/70">{o.address}</p>
      </section>

      <Link
        href="/products"
        className="mx-auto mt-8 block w-fit rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Continue shopping
      </Link>
    </main>
  );
}
