// src/lib/account.ts
import { getAuthToken } from '@/lib/auth';
import { mediaUrl } from '@/lib/media';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

export type AccountOrder = {
  id: string;
  displayId: number | null;
  createdAt: string;
  status: string;
  currency: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'bkash';
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
  step: 0 | 1 | 2 | 3;
  cancelled: boolean;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

type Addr = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address_1?: string | null;
  city?: string | null;
  postal_code?: string | null;
};

type RawOrder = {
  id: string;
  display_id?: number | null;
  created_at: string;
  status?: string | null;
  fulfillment_status?: string | null;
  currency_code: string;
  total?: number | null;
  shipping_total?: number | null;
  discount_total?: number | null;
  metadata?: Record<string, unknown> | null;
  shipping_address?: Addr | null;
  items?:
    | {
        id: string;
        title?: string | null;
        product_title?: string | null;
        variant_title?: string | null;
        thumbnail?: string | null;
        quantity?: number | null;
        unit_price?: number | null;
      }[]
    | null;
};

function statusLabel(o: RawOrder) {
  if (o.status === 'canceled') return 'Cancelled';
  switch (o.fulfillment_status) {
    case 'delivered':
      return 'Delivered';
    case 'shipped':
    case 'partially_shipped':
    case 'partially_delivered':
      return 'On the way';
    case 'fulfilled':
    case 'partially_fulfilled':
      return 'Packed';
    default:
      return 'Order placed';
  }
}

function statusStep(o: RawOrder): 0 | 1 | 2 | 3 {
  switch (o.fulfillment_status) {
    case 'delivered':
      return 3;
    case 'shipped':
    case 'partially_shipped':
    case 'partially_delivered':
      return 2;
    case 'fulfilled':
    case 'partially_fulfilled':
      return 1;
    default:
      return 0;
  }
}

const safeUrl = (u: unknown) =>
  typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : null;

function toOrder(o: RawOrder): AccountOrder {
  const a: Addr = o.shipping_address ?? {};
  const tn = o.metadata?.tracking_number;
  const lines = (o.items ?? []).map((i) => {
    const qty = Number(i.quantity ?? 0);
    return {
      id: i.id,
      title: i.product_title ?? i.title ?? 'Item',
      variantTitle: i.variant_title ?? null,
      thumbnail: mediaUrl(i.thumbnail),
      quantity: qty,
      lineTotal: Number(i.unit_price ?? 0) * qty,
    };
  });
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const shipping = Number(o.shipping_total ?? 0);
  const discount = Number(o.discount_total ?? 0);
  return {
    id: o.id,
    displayId: o.display_id ?? null,
    createdAt: o.created_at,
    status: statusLabel(o),
    step: statusStep(o),
    cancelled: o.status === 'canceled',
    trackingNumber: typeof tn === 'string' && tn.trim() ? tn.trim() : null,
    trackingUrl: safeUrl(o.metadata?.tracking_url),
    currency: o.currency_code,
    subtotal,
    shipping,
    discount,
    total: Number(o.total ?? subtotal - discount + shipping),
    paymentMethod: o.metadata?.payment_method === 'bkash' ? 'bkash' : 'cod',
    name: [a.first_name, a.last_name].filter(Boolean).join(' '),
    phone: a.phone ?? null,
    address: [a.address_1, a.city, a.postal_code].filter(Boolean).join(', '),
    lines,
  };
}

export async function getMyOrders(): Promise<AccountOrder[]> {
  const token = await getAuthToken();
  if (!token) return [];
  try {
    const qs = new URLSearchParams({
      order: '-created_at',
      limit: '50',
      fields: '*items,*shipping_address,+metadata',
    });
    const res = await fetch(`${BASE}/store/orders?${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-publishable-api-key': KEY,
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const { orders } = (await res.json()) as { orders?: RawOrder[] };
    return (orders ?? []).map(toOrder);
  } catch {
    return [];
  }
}
