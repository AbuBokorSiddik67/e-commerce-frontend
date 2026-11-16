import { getCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import CartLineControls from '@/components/cart/CartLineControls';
import PromoForm from '@/components/cart/PromoForm';
import Link from 'next/dist/client/link';

export const metadata = { title: 'Your cart' };

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-head text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Start shopping
        </Link>
      </main>
    );
  }

  const money = (n: number) => formatPrice(n, cart.currency);

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <h1 className="font-head text-2xl font-bold">
        Shopping cart{' '}
        <span className="text-base font-normal text-black/60 dark:text-white/60">
          ({cart.count} {cart.count === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col gap-3">
          {cart.lines.map((l) => {
            const thumb = l.thumbnail ? (
              <img
                src={l.thumbnail}
                alt={l.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-xl font-semibold text-black/20 dark:text-white/20">
                {l.title.charAt(0)}
              </span>
            );
            const imgBox =
              'h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/[0.04] dark:bg-white/5';

            return (
              <li
                key={l.id}
                className="flex gap-4 rounded-xl border border-black/10 bg-white p-3 dark:border-white/15 dark:bg-[#171b22]"
              >
                {l.handle ? (
                  <a href={`/products/${l.handle}`} className={imgBox}>
                    {thumb}
                  </a>
                ) : (
                  <div className={imgBox}>{thumb}</div>
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-sm font-medium">
                        {l.handle ? (
                          <a
                            href={`/products/${l.handle}`}
                            className="hover:text-accent"
                          >
                            {l.title}
                          </a>
                        ) : (
                          l.title
                        )}
                      </h2>
                      {l.variantTitle && l.variantTitle !== l.title && (
                        <p className="mt-0.5 text-xs text-black/60 dark:text-white/60">
                          {l.variantTitle}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-black/60 dark:text-white/60">
                        {money(l.unitPrice)} each
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold">
                      {money(l.lineTotal)}
                    </p>
                  </div>
                  <CartLineControls lineId={l.id} quantity={l.quantity} />
                </div>
              </li>
            );
          })}
        </ul>

        <aside
          aria-labelledby="sum-title"
          className="h-fit rounded-xl border border-black/10 bg-white p-5 lg:sticky lg:top-24 dark:border-white/15 dark:bg-[#171b22]"
        >
          <h2 id="sum-title" className="font-head text-lg font-bold">
            Order summary
          </h2>

          <div className="mt-4">
            <PromoForm applied={cart.promos} />
          </div>

          <dl className="mt-5 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Subtotal</dt>
              <dd>{money(cart.subtotal)}</dd>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-accent">
                <dt>Discount</dt>
                <dd>−{money(cart.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">Shipping</dt>
              <dd className="text-black/60 dark:text-white/60">At checkout</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-black/10 pt-3 text-base font-bold dark:border-white/15">
              <dt>Total</dt>
              <dd>{money(cart.total)}</dd>
            </div>
          </dl>

          <a
            href="/checkout"
            className="mt-5 block rounded-lg bg-brand py-3 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Proceed to checkout
          </a>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-accent hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
