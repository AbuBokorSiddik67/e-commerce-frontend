import { formatPrice, type ProductCardData } from '@/lib/products';

export default function ProductCard({ p }: { p: ProductCardData }) {
  const saving = p.originalPrice - p.price;

  return (
    <a
      href={`/products/${p.handle}`}
      className="group block overflow-hidden rounded-xl border border-black/10 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-accent dark:border-white/15 dark:bg-[#171b22]"
    >
      <div className="relative aspect-square overflow-hidden bg-black/[0.04] dark:bg-white/5">
        {p.thumbnail ? (
          <>
            <img
              src={p.thumbnail}
              alt={p.title}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none ${
                p.soldOut ? 'opacity-50 grayscale' : ''
              }`}
            />
            {p.secondImage && !p.soldOut && (
              <img
                src={p.secondImage}
                alt=""
                loading="lazy"
                decoding="async"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold text-black/20 dark:text-white/20">
            {p.title.charAt(0)}
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {p.percentOff > 0 && !p.soldOut && (
            <span className="rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              -{p.percentOff}%
            </span>
          )}
          {p.isNew && !p.soldOut && (
            <span className="rounded-md bg-brand px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              New
            </span>
          )}
        </div>

        {p.soldOut && (
          <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-[13px] leading-5 group-hover:text-accent">
          {p.title}
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-1.5">
          {p.hasRange && (
            <span className="text-[11px] text-black/50 dark:text-white/50">
              From
            </span>
          )}
          <span className="text-base font-bold">
            {formatPrice(p.price, p.currency)}
          </span>
          {p.percentOff > 0 && (
            <span className="text-xs text-black/45 line-through dark:text-white/45">
              {formatPrice(p.originalPrice, p.currency)}
            </span>
          )}
        </div>

        {saving > 0 && (
          <span className="text-[11px] font-medium text-accent">
            Save {formatPrice(saving, p.currency)}
          </span>
        )}

        {p.left !== null && !p.soldOut && (
          <span className="text-[11px] font-semibold text-sale">
            Only {p.left} left
          </span>
        )}
      </div>
    </a>
  );
}
