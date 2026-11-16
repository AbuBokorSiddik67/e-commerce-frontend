import { mediaUrl } from "./media";

export type CategoryNode = {
  id: string;
  name: string;
  handle: string | null;
  image?: string | null;
  children: CategoryNode[];
};

type ApiCategory = {
  id: string;
  name: string;
  handle: string;
  metadata?: Record<string, unknown> | null;
  category_children?: ApiCategory[];
};

const toNode = (c: ApiCategory): CategoryNode => ({
  id: c.id,
  name: c.name,
  handle: c.handle,
  image: mediaUrl((c.metadata?.image_url as string) || null),
  children: (c.category_children || []).map(toNode),
});

export async function getCategoryTree(): Promise<CategoryNode[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/product-categories?include_descendants_tree=true&parent_category_id=null&limit=100&fields=%2Bmetadata`,
      {
        headers: {
          'x-publishable-api-key':
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
        },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    const { product_categories } = await res.json();
    return (product_categories || []).map(toNode);
  } catch {
    return [];
  }
}
