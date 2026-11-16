import { notFound } from 'next/navigation';
import ProductListing from '@/components/listing/ProductListing';
import { getCategoryByHandle, getProductsPage } from '@/lib/products';

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const cat = await getCategoryByHandle(handle);
  return { title: cat?.name ?? 'Category' };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const sp = await searchParams;
  const cat = await getCategoryByHandle(handle);
  if (!cat) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === 'name' ? 'name' : 'newest';
  const { products, count } = await getProductsPage({
    categoryIds: cat.allIds,
    sort,
    page,
  });

  return (
    <ProductListing
      title={cat.name}
      crumbs={[
        { label: 'Home', href: '/' },
        ...(cat.parent
          ? [{ label: cat.parent.name, href: `/category/${cat.parent.handle}` }]
          : []),
        { label: cat.name },
      ]}
      chips={cat.children.map((c) => ({
        label: c.name,
        href: `/category/${c.handle}`,
      }))}
      products={products}
      total={count}
      page={page}
      sort={sort}
      basePath={`/category/${handle}`}
      emptyText="No products in this category yet."
    />
  );
}
