import ProductCard from '@/components/product/ProductCard';
import { PAGE_SIZE, type ProductCardData } from '@/lib/products';
import Link from 'next/dist/client/link';
// import Link from 'next/link';

type Crumb = { label: string; href?: string };
type Chip = { label: string; href: string };

type Props = {
  title: string;
  crumbs: Crumb[];
  chips?: Chip[];
  products: ProductCardData[];
  total: number;
  page: number;
  sort: 'newest' | 'name';
  basePath: string;
  keep?: Record<string, string | undefined>;
  showSort?: boolean;
  emptyText?: string;
};

function pageList(current: number, total: number): (number | '…')[] {
  const nums = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

const pill = 'rounded-full border px-3.5 py-1.5 text-sm font-medium';
const pillOff =
  'border-black/15 hover:border-accent hover:text-accent dark:border-white/20';
const pillOn = 'border-brand bg-brand text-white';

export default function ProductListing({
  title,
  crumbs,
  chips = [],
  products,
  total,
  page,
  sort,
  basePath,
  keep = {},
  showSort = true,
  emptyText = 'No products found.',
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const href = (extra: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries({ ...keep, ...extra }).forEach(
      ([k, v]) => v && qs.set(k, v),
    );
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const sortParam = sort === 'name' ? 'name' : undefined;
  const pageHref = (n: number) =>
    href({ sort: sortParam, page: n > 1 ? String(n) : undefined });

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 text-xs text-black/60 dark:text-white/60"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? (
                <a href={c.href} className="hover:text-accent">
                  {c.label}
                </a>
              ) : (
                <span
                  aria-current="page"
                  className="text-black dark:text-white"
                >
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="font-head text-2xl font-bold">{title}</h1>

      {chips.length > 0 && (
        <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((c) => (
            <li key={c.href} className="shrink-0">
              <a
                href={c.href}
                className={`${pill} ${pillOff} block whitespace-nowrap`}
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm text-black/60 dark:text-white/60"
          aria-live="polite"
        >
          {total > 0
            ? `Showing ${from}–${to} of ${total} products`
            : '0 products'}
        </p>
        {showSort && total > 0 && (
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Sort by"
          >
            <span className="text-sm text-black/60 dark:text-white/60">
              Sort:
            </span>
            <a
              href={href({ sort: undefined })}
              aria-current={sort === 'newest'}
              className={`${pill} ${sort === 'newest' ? pillOn : pillOff}`}
            >
              Newest
            </a>
            <a
              href={href({ sort: 'name' })}
              aria-current={sort === 'name'}
              className={`${pill} ${sort === 'name' ? pillOn : pillOff}`}
            >
              A–Z
            </a>
          </div>
        )}
      </div>

      {products.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-black/20 px-6 py-16 text-center dark:border-white/20">
          <p className="text-sm text-black/60 dark:text-white/60">
            {emptyText}
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Back to home
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
        >
          {page > 1 && (
            <a href={pageHref(page - 1)} className={`${pill} ${pillOff}`}>
              ← Prev
            </a>
          )}
          {pageList(page, totalPages).map((n, i) =>
            n === '…' ? (
              <span
                key={`d${i}`}
                className="px-1 text-black/40 dark:text-white/40"
              >
                …
              </span>
            ) : (
              <a
                key={n}
                href={pageHref(n)}
                aria-current={n === page ? 'page' : undefined}
                className={`${pill} min-w-10 text-center ${n === page ? pillOn : pillOff}`}
              >
                {n}
              </a>
            ),
          )}
          {page < totalPages && (
            <a href={pageHref(page + 1)} className={`${pill} ${pillOff}`}>
              Next →
            </a>
          )}
        </nav>
      )}
    </main>
  );
}
