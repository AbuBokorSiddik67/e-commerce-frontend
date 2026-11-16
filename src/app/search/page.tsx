import ProductListing from '@/components/listing/ProductListing';
import { getProductsPage } from '@/lib/products';

export const metadata = { title: 'Search' };

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === 'name' ? 'name' : 'newest';
  const { products, count } = q
    ? await getProductsPage({ q, sort, page })
    : { products: [], count: 0 };

  return (
    <ProductListing
      title={q ? `Results for “${q}”` : 'Search'}
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
      products={products}
      total={count}
      page={page}
      sort={sort}
      basePath="/search"
      keep={{ q }}
      emptyText={
        q
          ? `Nothing matched “${q}”. Try a shorter or different word.`
          : 'Type something in the search box above.'
      }
    />
  );
}
