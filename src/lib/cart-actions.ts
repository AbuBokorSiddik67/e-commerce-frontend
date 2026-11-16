'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getRegionId } from '@/lib/products';
import { getCart } from '@/lib/cart';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;
const COOKIE = 'cart_id';

export type ActionResult =
  | { ok: true; count?: number }
  | { ok: false; error: string };

async function medusa(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

const readCartId = async () => (await cookies()).get(COOKIE)?.value ?? null;
const refresh = () => revalidatePath('/', 'layout');

const failText = (r: { json: { message?: string } }, fallback: string) =>
  /inventory|stock/i.test(String(r.json?.message ?? ''))
    ? 'Not enough stock for that quantity.'
    : fallback;

async function createCart(): Promise<string | null> {
  const regionId = await getRegionId();
  if (!regionId) return null;
  const r = await medusa('POST', '/store/carts', { region_id: regionId });
  return r.ok ? r.json.cart.id : null;
}

export async function addToCart(
  variantId: string,
  quantity: number,
): Promise<ActionResult> {
  try {
    const jar = await cookies();
    const qty = Math.max(1, Math.min(99, Math.floor(quantity) || 1));
    const startFail: ActionResult = {
      ok: false,
      error: 'Could not start a cart. Please try again.',
    };

    const save = (id: string) =>
      jar.set(COOKIE, id, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === 'production',
      });

    let cartId = jar.get(COOKIE)?.value ?? null;
    if (!cartId) {
      cartId = await createCart();
      if (!cartId) return startFail;
      save(cartId);
    }

    let r = await medusa('POST', `/store/carts/${cartId}/line-items`, {
      variant_id: variantId,
      quantity: qty,
    });

    if (
      !r.ok &&
      (r.status === 404 || /completed/i.test(String(r.json?.message ?? '')))
    ) {
      cartId = await createCart();
      if (!cartId) return startFail;
      save(cartId);
      r = await medusa('POST', `/store/carts/${cartId}/line-items`, {
        variant_id: variantId,
        quantity: qty,
      });
    }

    if (!r.ok)
      return {
        ok: false,
        error: failText(r, 'Could not add this item. Please try again.'),
      };

    refresh();
    const count = (r.json.cart?.items ?? []).reduce(
      (n: number, i: { quantity?: number }) => n + (i.quantity ?? 0),
      0,
    );
    return { ok: true, count };
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function removeLine(lineId: string): Promise<ActionResult> {
  const id = await readCartId();
  if (!id) return { ok: false, error: 'Your cart is empty.' };
  const r = await medusa('DELETE', `/store/carts/${id}/line-items/${lineId}`);
  if (!r.ok) return { ok: false, error: 'Could not remove this item.' };
  refresh();
  return { ok: true };
}

export async function updateLine(
  lineId: string,
  quantity: number,
): Promise<ActionResult> {
  const id = await readCartId();
  if (!id) return { ok: false, error: 'Your cart is empty.' };
  const q = Math.floor(quantity);
  if (q < 1) return removeLine(lineId);
  const r = await medusa('POST', `/store/carts/${id}/line-items/${lineId}`, {
    quantity: Math.min(q, 99),
  });
  if (!r.ok)
    return { ok: false, error: failText(r, 'Could not update the quantity.') };
  refresh();
  return { ok: true };
}

export async function applyPromo(code: string): Promise<ActionResult> {
  const id = await readCartId();
  const clean = code.trim();
  if (!id || !clean) return { ok: false, error: 'Enter a promo code.' };

  const r = await medusa('POST', `/store/carts/${id}/promotions`, {
    promo_codes: [clean],
  });
  if (!r.ok) return { ok: false, error: 'That code is not valid.' };

  const cart = await getCart();
  const applied = cart?.promos.some(
    (p) => p.toLowerCase() === clean.toLowerCase(),
  );
  if (!applied)
    return { ok: false, error: 'That code is not valid for this cart.' };

  refresh();
  return { ok: true };
}

export async function removePromo(code: string): Promise<ActionResult> {
  const id = await readCartId();
  if (!id) return { ok: false, error: 'Your cart is empty.' };
  const r = await medusa('DELETE', `/store/carts/${id}/promotions`, {
    promo_codes: [code],
  });
  if (!r.ok) return { ok: false, error: 'Could not remove the code.' };
  refresh();
  return { ok: true };
}
