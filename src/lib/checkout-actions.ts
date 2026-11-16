'use server';

import { isLimited, record } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;
const COOKIE = 'cart_id';
const COUNTRY = (process.env.NEXT_PUBLIC_COUNTRY_CODE || 'bd').toLowerCase();
const PROVIDER =
  process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'pp_system_default';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export type CheckoutInput = {
  fullName: string;
  phone: string;
  email: string;
  address1: string;
  city: string;
  postalCode: string;
  shippingOptionId: string;
  note: string;
  website: string; // honeypot: মানুষ এটা ভরে না
};
export type CheckoutResult = { ok: false; error: string };

async function medusa(
  method: string,
  path: string,
  body?: object,
  token?: string,
) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

const messageOf = (r: {
  json: { message?: string; error?: { message?: string } };
}) => String(r.json?.message ?? r.json?.error?.message ?? '');

function failText(r: { json: { message?: string } }, fallback: string) {
  const m = messageOf(r);
  if (/country/i.test(m))
    return 'Sorry, this store cannot deliver to that country.';
  if (/inventory|stock/i.test(m))
    return 'Some items just went out of stock. Please review your cart.';
  return fallback;
}

function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[^\d]/g, '').replace(/^88/, '');
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

export async function placeOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const jar = await cookies();
  const cartId = jar.get(COOKIE)?.value;
  if (!cartId) return { ok: false, error: 'Your cart is empty.' };
  const authToken = jar.get('auth_token')?.value;
  if (!authToken)
    return { ok: false, error: 'Please log in to place your order.' };
  const me = await medusa('GET', '/store/customers/me', undefined, authToken);
  if (!me.ok || !me.json?.customer?.email)
    return {
      ok: false,
      error: 'Your session has expired. Please log in again.',
    };
  // বট ধরার ফাঁদ
  if (input.website)
    return { ok: false, error: 'Something went wrong. Please try again.' };

  const h = await headers();
  const ip =
    (h.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'local';

  if (isLimited(`try:${ip}`, 20, 10 * MIN)) {
    return {
      ok: false,
      error: 'Too many attempts. Please wait a few minutes and try again.',
    };
  }
  record(`try:${ip}`);

  const name = input.fullName.trim().replace(/\s+/g, ' ');
  const phone = normalisePhone(input.phone);
  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (!phone)
    return {
      ok: false,
      error: 'Please enter a valid mobile number (01XXXXXXXXX).',
    };
  if (!input.address1.trim() || !input.city.trim())
    return { ok: false, error: 'Please enter your full address and district.' };
  if (!input.shippingOptionId)
    return { ok: false, error: 'Please choose a delivery option.' };

  // সফল অর্ডারের হার সীমা (ব্যর্থ চেষ্টা গোনা হয় না)
  if (isLimited(`phone:${phone}`, 3, DAY) || isLimited(`ip:${ip}`, 5, HOUR)) {
    return {
      ok: false,
      error:
        'Too many orders from this number or device today. Please contact us to place another order.',
    };
  }

  const [first, ...rest] = name.split(' ');
  const address = {
    first_name: first,
    last_name: rest.join(' '),
    address_1: input.address1.trim(),
    city: input.city.trim(),
    province: input.city.trim(),
    postal_code: input.postalCode.trim() || undefined,
    country_code: COUNTRY,
    phone,
  };
  const email: string = me.json.customer.email;
  await medusa('POST', `/store/carts/${cartId}/customer`, {}, authToken);

  // ১. ঠিকানা, যোগাযোগ ও যাচাইয়ের চিহ্ন
  let r = await medusa('POST', `/store/carts/${cartId}`, {
    email,
    shipping_address: address,
    billing_address: address,
    metadata: {
      payment_method: 'cod',
      cod_status: 'pending_confirmation',
      note: input.note.trim().slice(0, 500) || undefined,
    },
  });
  if (!r.ok)
    return {
      ok: false,
      error: failText(
        r,
        'Could not save your address. Please check it and try again.',
      ),
    };

  // ২. ডেলিভারি অপশন
  const cur = await medusa(
    'GET',
    `/store/carts/${cartId}?fields=${encodeURIComponent('*shipping_methods,*payment_collection')}`,
  );
  const methods: { shipping_option_id?: string }[] =
    cur.json?.cart?.shipping_methods ?? [];
  if (!methods.some((m) => m.shipping_option_id === input.shippingOptionId)) {
    r = await medusa('POST', `/store/carts/${cartId}/shipping-methods`, {
      option_id: input.shippingOptionId,
    });
    if (!r.ok)
      return {
        ok: false,
        error: 'That delivery option is not available for your address.',
      };
  }

  // ৩. পেমেন্ট (ক্যাশ অন ডেলিভারি)
  let pcId: string | undefined = cur.json?.cart?.payment_collection?.id;
  if (!pcId) {
    r = await medusa('POST', '/store/payment-collections', { cart_id: cartId });
    if (!r.ok)
      return { ok: false, error: 'Could not start payment. Please try again.' };
    pcId = r.json.payment_collection.id;
  }
  r = await medusa(
    'POST',
    `/store/payment-collections/${pcId}/payment-sessions`,
    { provider_id: PROVIDER },
  );
  if (!r.ok)
    return {
      ok: false,
      error: 'Cash on delivery is not set up for this store yet.',
    };

  // ৪. অর্ডার সম্পন্ন
  r = await medusa(
    'POST',
    `/store/carts/${cartId}/complete`,
    undefined,
    authToken,
  );
  if (!r.ok || r.json?.type !== 'order') {
    return {
      ok: false,
      error: failText(r, 'We could not place your order. Please try again.'),
    };
  }

  const orderId: string = r.json.order.id;
  record(`phone:${phone}`);
  record(`ip:${ip}`);

  jar.delete(COOKIE);
  jar.set('last_order', orderId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/', 'layout');
  redirect(`/order-confirmation/${orderId}`);
}
