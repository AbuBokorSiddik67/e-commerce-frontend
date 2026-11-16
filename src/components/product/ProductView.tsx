'use client';

import { addToCart } from '@/lib/cart-actions';
import { formatPrice } from '@/lib/format';
import type { ProductDetail } from '@/lib/products';
import { useMemo, useState, useTransition } from 'react';
import { AssuranceItem } from '../../lib/assurance';
import AssuranceList from '../common/AssuranceList';

const chip =
  'min-w-11 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent';

export default function ProductView({
  p,
  assurance,
}: {
  p: ProductDetail;
  assurance: AssuranceItem[];
}) {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    p.variants.length === 1 ? { ...p.variants[0].options } : {},
  );
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );

  const variant = useMemo(() => {
    if (p.options.length === 0)
      return p.variants.length === 1 ? p.variants[0] : null;
    if (p.options.some((o) => !selected[o.id])) return null;
    return (
      p.variants.find((v) =>
        p.options.every((o) => v.options[o.id] === selected[o.id]),
      ) ?? null
    );
  }, [p, selected]);

  const lowest = p.variants.reduce((a, b) => (b.price < a.price ? b : a));
  const shown = variant ?? lowest;
  const range = !variant && p.variants.some((v) => v.price !== lowest.price);

  const pick = (optId: string, value: string) => {
    const next = { ...selected, [optId]: value };
    // এই বাছাইয়ের সাথে মেলে না এমন অন্য বাছাই বাদ দিন
    for (const o of p.options) {
      if (o.id === optId || !next[o.id]) continue;
      const ok = p.variants.some(
        (v) => v.options[optId] === value && v.options[o.id] === next[o.id],
      );
      if (!ok) delete next[o.id];
    }
    setSelected(next);
    setQty(1);
    setMsg(null);
  };

  // বর্তমান বাছাইয়ের সাথে এই মানের কোনো stock-এ থাকা variant আছে কি
  const inStockFor = (optId: string, value: string) =>
    p.variants.some(
      (v) =>
        v.inStock &&
        v.options[optId] === value &&
        p.options.every(
          (o) =>
            o.id === optId ||
            !selected[o.id] ||
            v.options[o.id] === selected[o.id],
        ),
    );

  const max = variant?.maxQty != null ? Math.min(variant.maxQty, 10) : 10;
  const missing = p.options.find((o) => !selected[o.id]);
  const canBuy = !!variant && variant.inStock;

  const label = !variant
    ? `Select ${missing?.title ?? 'option'}`
    : !variant.inStock
      ? 'Sold out'
      : pending
        ? 'Adding...'
        : 'Add to cart';

  const stockText = !variant
    ? null
    : !variant.inStock
      ? { text: 'Out of stock', cls: 'text-black/50 dark:text-white/50' }
      : variant.maxQty !== null && variant.maxQty <= 5
        ? { text: `Only ${variant.maxQty} left`, cls: 'text-sale' }
        : { text: 'In stock', cls: 'text-accent' };

  const add = () => {
    if (!variant || !variant.inStock) return;
    setMsg(null);
    start(async () => {
      try {
        const res = await addToCart(variant.id, qty);
        setMsg(
          res.ok
            ? { type: 'ok', text: 'Added to cart.' }
            : { type: 'err', text: res.error },
        );
      } catch {
        setMsg({
          type: 'err',
          text: 'Something went wrong. Please try again.',
        });
      }
    });
  };

  const images = p.images;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-[#171b22]">
          {images[active] ? (
            <img
              src={images[active]}
              alt={p.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl font-semibold text-black/15 dark:text-white/15">
              {p.title.charAt(0)}
            </div>
          )}
          {shown.percentOff > 0 && (
            <span className="absolute left-3 top-3 rounded-md bg-sale px-2.5 py-1 text-xs font-bold text-white">
              -{shown.percentOff}%
            </span>
          )}
        </div>

        {images.length > 1 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <li key={src + i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === active}
                  className={`block h-16 w-16 overflow-hidden rounded-lg border-2 bg-white dark:bg-[#171b22] ${
                    i === active
                      ? 'border-accent'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-head text-2xl font-bold leading-tight md:text-3xl">
            {p.title}
          </h1>
          {p.subtitle && (
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              {p.subtitle}
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            {range && (
              <span className="text-sm text-black/60 dark:text-white/60">
                From
              </span>
            )}
            <span className="text-3xl font-bold">
              {formatPrice(shown.price, shown.currency)}
            </span>
            {shown.percentOff > 0 && (
              <span className="text-base text-black/45 line-through dark:text-white/45">
                {formatPrice(shown.originalPrice, shown.currency)}
              </span>
            )}
          </div>
          {shown.percentOff > 0 && (
            <p className="mt-1 text-sm font-medium text-accent">
              You save{' '}
              {formatPrice(shown.originalPrice - shown.price, shown.currency)}
            </p>
          )}
        </div>

        {p.options.map((o) => (
          <div key={o.id}>
            <p className="mb-2 text-sm font-semibold">
              {o.title}
              {selected[o.id] && (
                <span className="ml-2 font-normal text-black/60 dark:text-white/60">
                  {selected[o.id]}
                </span>
              )}
            </p>
            <div
              role="radiogroup"
              aria-label={o.title}
              className="flex flex-wrap gap-2"
            >
              {o.values.map((val) => {
                const on = selected[o.id] === val;
                const out = !inStockFor(o.id, val);
                return (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(o.id, val)}
                    className={`${chip} ${
                      on
                        ? 'border-brand bg-brand text-white'
                        : out
                          ? 'border-black/15 text-black/40 line-through hover:border-black/30 dark:border-white/20 dark:text-white/40'
                          : 'border-black/20 hover:border-accent dark:border-white/25'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {stockText && (
          <p className={`text-sm font-medium ${stockText.cls}`}>
            {stockText.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Quantity"
            className="flex items-center rounded-lg border border-black/20 dark:border-white/25"
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-11 w-11 text-lg disabled:opacity-40"
            >
              −
            </button>
            <span
              className="w-10 text-center text-sm font-semibold tabular-nums"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={qty >= max}
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="h-11 w-11 text-lg disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={add}
            disabled={!canBuy || pending}
            className="h-11 min-w-48 flex-1 rounded-lg bg-brand px-6 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {label}
          </button>
        </div>

        {msg && (
          <p
            role="status"
            className={`text-sm font-medium ${msg.type === 'ok' ? 'text-accent' : 'text-sale'}`}
          >
            {msg.text}
            {msg.type === 'ok' && (
              <>
                {' '}
                <a href="/cart" className="underline">
                  View cart →
                </a>
              </>
            )}
          </p>
        )}

        <AssuranceList items={assurance} />
      </div>
    </div>
  );
}
