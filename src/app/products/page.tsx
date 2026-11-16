import ProductListing from '@/components/listing/ProductListing';
import { getProductsPage } from '@/lib/products';

export const metadata = { title: 'All products' };

type Props = { searchParams: Promise<{ sort?: string; page?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === 'name' ? 'name' : 'newest';
  const { products, count } = await getProductsPage({ sort, page });

  return (
    <ProductListing
      title="All products"
      crumbs={[{ label: 'Home', href: '/' }, { label: 'All products' }]}
      products={products}
      total={count}
      page={page}
      sort={sort}
      basePath="/products"
    />
  );
}
