import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';
import ProductCard from '@/components/product/ProductCard';
import { getProductByHandle, getProductsPage } from '@/lib/products';
import Link from 'next/dist/client/link';
import { getStoreSettings } from '../../../lib/settings';
import { getAssuranceItems } from '../../../lib/assurance';
// import Link from 'next/link';

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);
  if (!p) return { title: 'Product not found' };
  return {
    title: p.title,
    description: p.description?.slice(0, 160) ?? undefined,
    openGraph: p.images[0] ? { images: [p.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);
  const assurance = getAssuranceItems(await getStoreSettings());
  if (!p) notFound();

  const cat = p.categories[0];
  const related = cat
    ? (await getProductsPage({ categoryIds: [cat.id] })).products
        .filter((r) => r.id !== p.id)
        .slice(0, 6)
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-xs text-black/60 dark:text-white/60"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          {cat && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <a
                  href={`/category/${cat.handle}`}
                  className="hover:text-accent"
                >
                  {cat.name}
                </a>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-black dark:text-white">
            {p.title}
          </li>
        </ol>
      </nav>

      <ProductView p={p} assurance={assurance} />

      {p.description && (
        <section aria-labelledby="desc-title" className="mt-10 max-w-3xl">
          <h2 id="desc-title" className="mb-3 font-head text-lg font-bold">
            Description
          </h2>
          <p className="whitespace-pre-line text-sm leading-7 text-black/75 dark:text-white/75">
            {p.description}
          </p>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="rel-title" className="mt-12">
          <h2 id="rel-title" className="mb-3 font-head text-lg font-bold">
            You may also like
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((r) => (
              <li key={r.id}>
                <ProductCard p={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
