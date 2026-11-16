import { mediaUrl } from "./media";

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

export type OrderData = {
  id: string;
  displayId: number | null;
  email: string | null;
  currency: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  name: string;
  phone: string | null;
  address: string;
  lines: {
    id: string;
    title: string;
    variantTitle: string | null;
    thumbnail: string | null;
    quantity: number;
    lineTotal: number;
  }[];
};

export async function getOrder(id: string): Promise<OrderData | null> {
  try {
    const res = await fetch(
      `${BASE}/store/orders/${id}?fields=${encodeURIComponent('*items,*shipping_address')}`,
      { headers: { 'x-publishable-api-key': KEY }, cache: 'no-store' },
    );
    if (!res.ok) return null;
    const { order: o } = await res.json();
    if (!o) return null;

    const a = o.shipping_address ?? {};
    const lines = (o.items ?? []).map((i: any) => ({
      id: i.id,
      title: i.product_title ?? i.title ?? 'Item',
      variantTitle: i.variant_title ?? null,
      thumbnail: mediaUrl(i.thumbnail) ?? null,
      quantity: Number(i.quantity ?? 0),
      lineTotal: Number(i.unit_price ?? 0) * Number(i.quantity ?? 0),
    }));
    const subtotal = lines.reduce(
      (n: number, l: { lineTotal: number }) => n + l.lineTotal,
      0,
    );
    const shipping = Number(o.shipping_total ?? 0);
    const discount = Number(o.discount_total ?? 0);

    return {
      id: o.id,
      displayId: o.display_id ?? null,
      email: o.email && !String(o.email).endsWith('.invalid') ? o.email : null,
      currency: o.currency_code,
      subtotal,
      shipping,
      discount,
      total: Number(o.total ?? subtotal - discount + shipping),
      name: [a.first_name, a.last_name].filter(Boolean).join(' '),
      phone: a.phone ?? null,
      address: [a.address_1, a.city, a.postal_code].filter(Boolean).join(', '),
      lines,
    };
  } catch {
    return null;
  }
}
