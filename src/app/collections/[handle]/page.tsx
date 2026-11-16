import { notFound } from 'next/navigation';
import ProductListing from '@/components/listing/ProductListing';
import { getCollectionByHandle, getProductsPage } from '@/lib/products';

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const col = await getCollectionByHandle(handle);
  return { title: col?.title ?? 'Collection' };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const sp = await searchParams;
  const col = await getCollectionByHandle(handle);
  if (!col) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === 'name' ? 'name' : 'newest';
  const { products, count } = await getProductsPage({
    collectionId: col.id,
    sort,
    page,
  });

  return (
    <ProductListing
      title={col.title}
      crumbs={[{ label: 'Home', href: '/' }, { label: col.title }]}
      products={products}
      total={count}
      page={page}
      sort={sort}
      basePath={`/collections/${handle}`}
      emptyText="No products in this collection right now."
    />
  );
}
