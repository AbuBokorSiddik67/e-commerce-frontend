import { getStoreSettings } from '@/lib/settings';
import { getCollectionProducts } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';
import Countdown from './Countdown';

export default async function FlashSale() {
  const s = await getStoreSettings();
  if (!s?.flash_sale_enabled) return null;

  const endsAt: string | null = s.flash_sale_ends_at || null;
  if (endsAt && new Date(endsAt).getTime() <= new Date().getTime()) return null;

  const products = await getCollectionProducts('flash-sale', 6);
  if (!products.length) return null;

  return (
    <section
      aria-labelledby="flash-title"
      className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
    >
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/15 dark:bg-[#171b22]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-black/10 px-4 py-3 dark:border-white/15">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <h2
              id="flash-title"
              className="flex items-center gap-1.5 font-head text-lg font-bold"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                className="text-sale"
                aria-hidden="true"
              >
                <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
              </svg>
              {s.flash_sale_title || 'Flash Sale'}
            </h2>
            {endsAt && <Countdown endsAt={endsAt} />}
          </div>
          <a
            href={s.flash_sale_link || '/collections/flash-sale'}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Show more →
          </a>
        </div>

        <ul className="flex snap-x gap-3 overflow-x-auto p-3 [scrollbar-width:none] lg:grid lg:grid-cols-6 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {products.map((p) => (
            <li key={p.id} className="w-40 shrink-0 snap-start lg:w-auto">
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
