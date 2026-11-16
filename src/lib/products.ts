import { mediaUrl } from './media';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;
const CARD_FIELDS =
  'id,title,handle,thumbnail,created_at,*images,*variants.calculated_price,+variants.inventory_quantity';

export type ProductCardData = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  secondImage: string | null;
  price: number;
  originalPrice: number;
  currency: string;
  percentOff: number;
  hasRange: boolean;
  isNew: boolean;
  soldOut: boolean;
  left: number | null;
};

type CalculatedPrice = {
  calculated_amount: number;
  original_amount?: number | null;
  currency_code: string;
};

type StoreProduct = {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string | null;
  variants?: { calculated_price?: CalculatedPrice | null }[] | null;
};
const NEW_DAYS = 7;
async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'x-publishable-api-key': KEY },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getRegionId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_MEDUSA_REGION_ID)
    return process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;
  const data = await api<{ regions: { id: string }[] }>('/store/regions');
  return data?.regions?.[0]?.id ?? null;
}

function toCard(p: any): ProductCardData | null {
  const variants: any[] = p.variants ?? [];

  const prices = variants
    .map((v) => v.calculated_price)
    .filter((c) => c && typeof c.calculated_amount === 'number');
  if (!prices.length) return null;

  const best = prices.reduce((a, b) =>
    b.calculated_amount < a.calculated_amount ? b : a,
  );
  const highest = prices.reduce((a, b) =>
    b.calculated_amount > a.calculated_amount ? b : a,
  );
  const original = best.original_amount ?? best.calculated_amount;
  const percentOff =
    original > best.calculated_amount
      ? Math.round((1 - best.calculated_amount / original) * 100)
      : 0;

  // stock: জানা না থাকলে "পাওয়া যাচ্ছে" ধরা হয়
  const available = variants.some(
    (v) =>
      !v.manage_inventory ||
      v.allow_backorder ||
      (typeof v.inventory_quantity === 'number'
        ? v.inventory_quantity > 0
        : true),
  );

  const images: { url: string }[] = p.images ?? [];
  const first = p.thumbnail ?? images[0]?.url ?? null;
  const second = images.find((i) => i.url !== first)?.url ?? null;
const stocked = variants.filter(
  (v) =>
    v.manage_inventory &&
    !v.allow_backorder &&
    typeof v.inventory_quantity === 'number',
);
const stockTotal = stocked.reduce(
  (n: number, v) => n + v.inventory_quantity,
  0,
);
const left =
  variants.length > 0 &&
  stocked.length === variants.length &&
  stockTotal > 0 &&
  stockTotal <= 5
    ? stockTotal
    : null;

  const ageMs = p.created_at
    ? Date.now() - new Date(p.created_at).getTime()
    : Infinity;

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: mediaUrl(first),
    secondImage: mediaUrl(second),
    price: best.calculated_amount,
    originalPrice: original,
    currency: best.currency_code,
    percentOff,
    hasRange: highest.calculated_amount > best.calculated_amount,
    isNew: ageMs < NEW_DAYS * 86400000,
    soldOut: variants.length > 0 && !available,
    left,
  };
}

export async function getCollectionProducts(
  handle: string,
  limit = 6,
): Promise<ProductCardData[]> {
  const col = await api<{ collections: { id: string }[] }>(
    `/store/collections?handle=${encodeURIComponent(handle)}`,
  );
  const collectionId = col?.collections?.[0]?.id;
  if (!collectionId) return [];

  const regionId = await getRegionId();
  if (!regionId) return [];

  const qs = new URLSearchParams({
    limit: String(limit),
    region_id: regionId,
    fields: CARD_FIELDS,
  });
  qs.append('collection_id[]', collectionId);

  const data = await api<{ products: StoreProduct[] }>(`/store/products?${qs}`);
  return (data?.products ?? [])
    .map(toCard)
    .filter((p): p is ProductCardData => p !== null);
}

export { formatPrice } from './format';

export async function getLatestProducts(
  limit = 12,
): Promise<ProductCardData[]> {
  const regionId = await getRegionId();
  if (!regionId) return [];

  const qs = new URLSearchParams({
    limit: String(limit),
    order: '-created_at',
    region_id: regionId,
    fields: CARD_FIELDS,
  });

  const data = await api<{ products: StoreProduct[] }>(`/store/products?${qs}`);
  return (data?.products ?? [])
    .map(toCard)
    .filter((p): p is ProductCardData => p !== null);
}

export const PAGE_SIZE = 24;

export type ListingQuery = {
  categoryIds?: string[];
  collectionId?: string;
  q?: string;
  sort?: 'newest' | 'name';
  page?: number;
};

const SORTS = { newest: '-created_at', name: 'title' } as const;

export async function getProductsPage(
  opts: ListingQuery,
): Promise<{ products: ProductCardData[]; count: number }> {
  const regionId = await getRegionId();
  if (!regionId) return { products: [], count: 0 };

  const page = Math.max(1, opts.page ?? 1);
  const qs = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String((page - 1) * PAGE_SIZE),
    order: SORTS[opts.sort ?? 'newest'],
    region_id: regionId,
    fields: CARD_FIELDS,
  });
  opts.categoryIds?.forEach((id) => qs.append('category_id[]', id));
  if (opts.collectionId) qs.append('collection_id[]', opts.collectionId);
  if (opts.q) qs.set('q', opts.q);

  const data = await api<{ products: any[]; count: number }>(
    `/store/products?${qs}`,
  );
  return {
    products: (data?.products ?? [])
      .map(toCard)
      .filter((p): p is ProductCardData => p !== null),
    count: data?.count ?? 0,
  };
}

export type CategoryInfo = {
  id: string;
  name: string;
  handle: string;
  parent: { name: string; handle: string } | null;
  children: { id: string; name: string; handle: string }[];
  allIds: string[];
};

const collectIds = (c: any): string[] => [
  c.id,
  ...(c.category_children ?? []).flatMap(collectIds),
];

export async function getCategoryByHandle(
  handle: string,
): Promise<CategoryInfo | null> {
  const data = await api<{ product_categories: any[] }>(
    `/store/product-categories?handle=${encodeURIComponent(handle)}&include_descendants_tree=true`,
  );
  const c = data?.product_categories?.[0];
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    handle: c.handle,
    parent: c.parent_category
      ? { name: c.parent_category.name, handle: c.parent_category.handle }
      : null,
    children: (c.category_children ?? []).map((x: any) => ({
      id: x.id,
      name: x.name,
      handle: x.handle,
    })),
    allIds: collectIds(c),
  };
}

export async function getCollectionByHandle(handle: string) {
  const data = await api<{
    collections: { id: string; title: string; handle: string }[];
  }>(`/store/collections?handle=${encodeURIComponent(handle)}`);
  return data?.collections?.[0] ?? null;
}

export type VariantData = {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  currency: string;
  percentOff: number;
  options: Record<string, string>;
  inStock: boolean;
  maxQty: number | null;
};

export type ProductDetail = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  images: string[];
  options: { id: string; title: string; values: string[] }[];
  variants: VariantData[];
  categories: { id: string; name: string; handle: string }[];
};

const DETAIL_FIELDS =
  'id,title,subtitle,description,handle,thumbnail,*images,*options,*options.values,*variants,*variants.options,*variants.calculated_price,+variants.inventory_quantity,*categories';

export async function getProductByHandle(
  handle: string,
): Promise<ProductDetail | null> {
  const regionId = await getRegionId();
  if (!regionId) return null;

  const qs = new URLSearchParams({
    handle,
    region_id: regionId,
    fields: DETAIL_FIELDS,
    limit: '1',
  });
  const data = await api<{ products: any[] }>(`/store/products?${qs}`);
  const p = data?.products?.[0];
  if (!p) return null;

  const variants: VariantData[] = (p.variants ?? [])
    .map((v: any): VariantData | null => {
      const c = v.calculated_price;
      if (!c || typeof c.calculated_amount !== 'number') return null;

      const original = c.original_amount ?? c.calculated_amount;
      const options: Record<string, string> = {};
      for (const o of v.options ?? []) options[o.option_id] = o.value;

      const qty =
        typeof v.inventory_quantity === 'number' ? v.inventory_quantity : null;
      return {
        id: v.id,
        title: v.title ?? '',
        price: c.calculated_amount,
        originalPrice: original,
        currency: c.currency_code,
        percentOff:
          original > c.calculated_amount
            ? Math.round((1 - c.calculated_amount / original) * 100)
            : 0,
        options,
        inStock:
          !v.manage_inventory || v.allow_backorder || qty === null || qty > 0,
        maxQty:
          v.manage_inventory && !v.allow_backorder && qty !== null ? qty : null,
      };
    })
    .filter((v: VariantData | null): v is VariantData => v !== null);

  if (!variants.length) return null;

  const images: string[] = [...(p.images ?? [])]
    .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((i: any) => i.url);
  if (!images.length && p.thumbnail) images.push(p.thumbnail);

  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle ?? null,
    description: p.description ?? null,
    handle: p.handle,
    images: images.map((u) => mediaUrl(u) ?? u),
    options: (p.options ?? []).map((o: any) => ({
      id: o.id,
      title: o.title,
      values: [
        ...new Set<string>((o.values ?? []).map((x: any) => x.value)),
      ].filter((val) => variants.some((v) => v.options[o.id] === val)),
    })),
    variants,
    categories: (p.categories ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
    })),
  };
}
