import { cookies } from 'next/headers';
import { mediaUrl } from './media';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

export type CartLine = {
  id: string;
  title: string;
  variantTitle: string | null;
  handle: string | null;
  thumbnail: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CartData = {
  id: string;
  currency: string;
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  promos: string[];
};

export type ShippingOption = { id: string; name: string; amount: number };

type RawItem = {
  id: string;
  title?: string | null;
  product_title?: string | null;
  variant_title?: string | null;
  product_handle?: string | null;
  thumbnail?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
};

type RawCart = {
  id: string;
  currency_code: string;
  completed_at?: string | null;
  items?: RawItem[] | null;
  discount_total?: number | null;
  total?: number | null;
  promotions?: { code?: string | null }[] | null;
};

type RawShippingOption = {
  id: string;
  name: string;
  amount?: number | null;
  calculated_price?: { calculated_amount?: number | null } | null;
};

export async function getCart(): Promise<CartData | null> {
  try {
    const id = (await cookies()).get('cart_id')?.value;
    if (!id) return null;

    const res = await fetch(
      `${BASE}/store/carts/${id}?fields=${encodeURIComponent('*items,*promotions')}`,
      { headers: { 'x-publishable-api-key': KEY }, cache: 'no-store' },
    );
    if (!res.ok) return null;

    const { cart } = (await res.json()) as { cart?: RawCart };
    if (!cart || cart.completed_at) return null;

    const lines: CartLine[] = (cart.items ?? []).map((i) => {
      const unitPrice = Number(i.unit_price ?? 0);
      const quantity = Number(i.quantity ?? 0);
      return {
        id: i.id,
        title: i.product_title ?? i.title ?? 'Item',
        variantTitle: i.variant_title ?? null,
        handle: i.product_handle ?? null,
        thumbnail: mediaUrl(i.thumbnail)?? null,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      };
    });

    const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
    const discount = Number(cart.discount_total ?? 0);

    return {
      id: cart.id,
      currency: cart.currency_code,
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      discount,
      total: typeof cart.total === 'number' ? cart.total : subtotal - discount,
      promos: (cart.promotions ?? [])
        .map((p) => p.code)
        .filter((c): c is string => !!c),
    };
  } catch {
    return null;
  }
}

export async function getCartCount(): Promise<number> {
  return (await getCart())?.count ?? 0;
}

export async function getShippingOptions(
  cartId: string,
): Promise<ShippingOption[]> {
  try {
    const res = await fetch(
      `${BASE}/store/shipping-options?cart_id=${cartId}`,
      {
        headers: { 'x-publishable-api-key': KEY },
        cache: 'no-store',
      },
    );
    if (!res.ok) return [];

    const { shipping_options } = (await res.json()) as {
      shipping_options?: RawShippingOption[];
    };
    return (shipping_options ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      amount: Number(o.amount ?? o.calculated_price?.calculated_amount ?? 0),
    }));
  } catch {
    return [];
  }
}
