import type { Metadata } from 'next';
import { sdk } from '@/lib/medusa';
import Link from 'next/dist/client/link';

export const metadata: Metadata = { title: 'Page not found' };

async function getTopCategories() {
  try {
    const res: any = await sdk.store.category.list({ limit: 6 } as any);
    return (res.product_categories || []) as {
      id: string;
      name: string;
      handle: string;
    }[];
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const cats = await getTopCategories();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div
          aria-hidden
          className="select-none bg-gradient-to-b from-brand to-accent bg-clip-text font-head text-[8rem] font-bold leading-none tracking-tight text-transparent sm:text-[11rem] dark:from-white dark:to-accent"
        >
          404
        </div>
        <h1 className="mt-2 font-head text-2xl font-semibold tracking-tight sm:text-3xl">
          This page could not be found
        </h1>
        <p className="mt-3 max-w-md text-black/60 dark:text-white/60">
          The link may be broken or the page may have been moved. Let&apos;s get
          you back to shopping.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:bg-accent"
          >
            Back to home
          </Link>
          <a
            href="/categories"
            className="rounded-lg border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent dark:border-white/20"
          >
            Browse categories
          </a>
        </div>

        {cats.length > 0 && (
          <div className="mt-12 w-full">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-black/50 dark:text-white/50">
              Popular categories
            </p>
            <ul className="flex flex-wrap justify-center gap-2.5">
              {cats.map((c) => (
                <li key={c.id}>
                  <a
                    href={`/category/${c.handle}`}
                    className="inline-block rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent dark:border-white/10 dark:bg-[#171b22]"
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
