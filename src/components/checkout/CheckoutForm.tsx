'use client';

import type { AssuranceItem } from '@/lib/assurance';
import { placeOrder } from '@/lib/checkout-actions';
import { DISTRICTS } from '@/lib/districts';
import { formatPrice } from '@/lib/format';
import { useState, useTransition } from 'react';
import AssuranceList from '../common/AssuranceList';

type Line = {
  id: string;
  title: string;
  variantTitle: string | null;
  thumbnail: string | null;
  quantity: number;
  lineTotal: number;
};
type Option = { id: string; name: string; amount: number };
type Props = {
  currency: string;
  lines: Line[];
  subtotal: number;
  discount: number;
  options: Option[];
  assurance?: AssuranceItem[];
  defaults: {
    fullName: string;
    phone: string;
    email: string;
  };
  loggedIn: boolean;
};

const field =
  'h-11 w-full rounded-lg border border-black/20 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/25';
const card =
  'rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-[#171b22]';

const Labeled = ({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5 text-sm font-medium">
    <span>
      {label}
      {optional && (
        <span className="ml-1 font-normal text-black/50 dark:text-white/50">
          (optional)
        </span>
      )}
    </span>
    {children}
  </label>
);

export default function CheckoutForm({
  currency,
  lines,
  subtotal,
  discount,
  options,
  assurance,
  defaults,
  loggedIn
}: Props) {
 const [f, setF] = useState({
   fullName: defaults.fullName,
   phone: defaults.phone,
   email: defaults.email,
   address1: '',
   city: '',
   postalCode: '',
   note: '',
   website: '',
 });
  const [optionId, setOptionId] = useState(options[0]?.id ?? '');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const shipping = options.find((o) => o.id === optionId)?.amount ?? 0;
  const total = subtotal - discount + shipping;
  const money = (n: number) => formatPrice(n, currency);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    start(async () => {
      try {
        const r = await placeOrder({ ...f, shippingOptionId: optionId });
        if (r && r.ok === false) setError(r.error);
      } catch {
        setError('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={f.website}
            onChange={set('website')}
          />
        </label>
      </div>
      <div className="flex flex-col gap-5">
        <section className={card} aria-labelledby="c-contact">
          <h2 id="c-contact" className="mb-4 font-head text-lg font-bold">
            Contact
          </h2>
          <p className="-mt-2 mb-4 text-sm text-black/60 dark:text-white/60">
            {loggedIn ? (
              <>Ordering as {f.email}.</>
            ) : (
              <>
                Have an account?{' '}
                <a
                  href="/login?next=/checkout"
                  className="font-semibold text-accent hover:underline"
                >
                  Log in
                </a>{' '}
                to fill this in faster.
              </>
            )}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Full name">
              <input
                className={field}
                required
                autoComplete="name"
                value={f.fullName}
                onChange={set('fullName')}
              />
            </Labeled>
            <Labeled label="Mobile number">
              <input
                className={field}
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                pattern="([+]?88)?01[3-9][0-9]{8}"
                title="Enter a Bangladeshi mobile number, e.g. 01712345678"
                value={f.phone}
                onChange={set('phone')}
              />
            </Labeled>
            <div className="sm:col-span-2">
              <Labeled label="Email" optional>
                <input
                  className={field}
                  type="email"
                  autoComplete="email"
                  readOnly={loggedIn}
                  value={f.email}
                  onChange={set('email')}
                />
              </Labeled>
            </div>
          </div>
        </section>

        <section className={card} aria-labelledby="c-address">
          <h2 id="c-address" className="mb-4 font-head text-lg font-bold">
            Delivery address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Labeled label="Full address">
                <textarea
                  className={`${field} h-24 py-2`}
                  required
                  autoComplete="street-address"
                  placeholder="House, road, area"
                  value={f.address1}
                  onChange={set('address1')}
                />
              </Labeled>
            </div>
            <Labeled label="District">
              <input
                className={field}
                required
                list="districts"
                autoComplete="address-level2"
                value={f.city}
                onChange={set('city')}
              />
              <datalist id="districts">
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </Labeled>
            <Labeled label="Postal code" optional>
              <input
                className={field}
                inputMode="numeric"
                autoComplete="postal-code"
                value={f.postalCode}
                onChange={set('postalCode')}
              />
            </Labeled>
          </div>
        </section>

        <section className={card} aria-labelledby="c-ship">
          <h2 id="c-ship" className="mb-4 font-head text-lg font-bold">
            Delivery method
          </h2>
          <div
            role="radiogroup"
            aria-labelledby="c-ship"
            className="flex flex-col gap-2"
          >
            {options.map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm ${
                  optionId === o.id
                    ? 'border-accent bg-accent/5'
                    : 'border-black/15 dark:border-white/20'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ship"
                    className="accent-[var(--accent)]"
                    checked={optionId === o.id}
                    onChange={() => setOptionId(o.id)}
                  />
                  <span className="font-medium">{o.name}</span>
                </span>
                <span className="font-semibold">{money(o.amount)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={card} aria-labelledby="c-pay">
          <h2 id="c-pay" className="mb-4 font-head text-lg font-bold">
            Payment
          </h2>
          <div className="flex items-start gap-3 rounded-lg border border-accent bg-accent/5 p-3 text-sm">
            <input
              type="radio"
              checked
              readOnly
              className="mt-0.5 accent-[var(--accent)]"
              aria-label="Cash on delivery"
            />
            <div>
              <p className="font-medium">Cash on delivery</p>
              <p className="text-black/60 dark:text-white/60">
                Pay in cash when your order arrives.
              </p>
            </div>
          </div>
        </section>

        <section className={card}>
          <Labeled label="Order note" optional>
            <textarea
              className={`${field} h-20 py-2`}
              placeholder="Anything we should know?"
              value={f.note}
              onChange={set('note')}
            />
          </Labeled>
        </section>
      </div>

      <aside
        aria-labelledby="c-sum"
        className={`${card} h-fit lg:sticky lg:top-24`}
      >
        <h2 id="c-sum" className="font-head text-lg font-bold">
          Order summary
        </h2>

        <ul className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 text-sm">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-black/[0.04] dark:bg-white/5">
                {l.thumbnail && (
                  <img
                    src={l.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-md bg-brand px-1 text-[10px] font-semibold text-white">
                  {l.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 font-medium">{l.title}</span>
                {l.variantTitle && l.variantTitle !== l.title && (
                  <span className="block text-xs text-black/60 dark:text-white/60">
                    {l.variantTitle}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-semibold">
                {money(l.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm dark:border-white/15">
          <div className="flex justify-between">
            <dt className="text-black/60 dark:text-white/60">Subtotal</dt>
            <dd>{money(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-accent">
              <dt>Discount</dt>
              <dd>−{money(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-black/60 dark:text-white/60">Delivery</dt>
            <dd>{money(shipping)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-black/10 pt-3 text-base font-bold dark:border-white/15">
            <dt>Total</dt>
            <dd>{money(total)}</dd>
          </div>
        </dl>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-sale/10 p-3 text-sm font-medium text-sale"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !optionId}
          className="mt-5 h-12 w-full rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Placing order...' : `Place order · ${money(total)}`}
        </button>
        <div className="mt-4">
          <AssuranceList items={assurance ?? []} cols={1} />
        </div>
        <a
          href="/cart"
          className="mt-3 block text-center text-sm text-accent hover:underline"
        >
          Back to cart
        </a>
      </aside>
    </form>
  );
}
