import type { Metadata } from 'next';
import { sdk } from '@/lib/medusa';
import { getStoreSettings } from '@/lib/settings';
import Link from 'next/dist/client/link';

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse every category in our store.',
};

type Cat = {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  parent_category_id?: string | null;
  metadata?: Record<string, any> | null;
};

async function getCategories(): Promise<Cat[]> {
  try {
    const res: any = await sdk.store.category.list({
      limit: 100,
      fields: 'id,name,handle,description,parent_category_id,+metadata',
    } as any);
    return (res.product_categories || []) as Cat[];
  } catch {
    return [];
  }
}

const card =
  'rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#171b22]';

export default async function CategoriesPage() {
  const [all, s]: [Cat[], any] = await Promise.all([
    getCategories(),
    getStoreSettings(),
  ]);

  const top = all.filter((c) => !c.parent_category_id);
  const childrenOf = (id: string) =>
    all.filter((c) => c.parent_category_id === id);

  return (
    <>
      <header className="relative overflow-hidden bg-brand text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/90">Categories</span>
          </nav>
          <h1 className="font-head text-3xl font-bold tracking-tight sm:text-5xl">
            Shop by category
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/75 sm:text-lg">
            Find exactly what you are looking for at{' '}
            {s?.store_name || 'our store'}.
          </p>
          <div className="mt-6 h-1 w-14 rounded bg-accent" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {top.length === 0 ? (
          <div className={`${card} mx-auto max-w-lg px-6 py-14 text-center`}>
            <p className="font-head text-xl font-semibold">No categories yet</p>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              Categories will appear here once they are added.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((c) => {
              const subs = childrenOf(c.id);
              const img: string | undefined =
                c.metadata?.image ||
                c.metadata?.image_url ||
                c.metadata?.thumbnail;
              return (
                <li key={c.id}>
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden ${card} transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_28px_-10px_rgba(16,24,40,0.2)] dark:hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.6)]`}
                  >
                    <a
                      href={`/category/${c.handle}`}
                      className="relative block aspect-[16/9] overflow-hidden bg-brand"
                      aria-label={c.name}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-accent/60">
                          <span className="font-head text-6xl font-bold text-white/30">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </a>

                    <div className="flex flex-1 flex-col p-5">
                      <a href={`/category/${c.handle}`}>
                        <h2 className="font-head text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
                          {c.name}
                        </h2>
                      </a>
                      {c.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                          {c.description}
                        </p>
                      )}

                      {subs.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {subs.slice(0, 6).map((sc) => (
                            <li key={sc.id}>
                              <a
                                href={`/category/${sc.handle}`}
                                className="inline-block rounded-full bg-black/[0.05] px-3 py-1 text-xs font-medium text-black/70 transition-colors hover:bg-accent hover:text-white dark:bg-white/10 dark:text-white/70"
                              >
                                {sc.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}

                      <a
                        href={`/category/${c.handle}`}
                        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent"
                      >
                        Shop now
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </a>
                    </div>

                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
