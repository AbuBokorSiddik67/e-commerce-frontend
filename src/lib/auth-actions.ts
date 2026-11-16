'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AUTH_COOKIE } from '@/lib/auth';
import { isLimited, record } from '@/lib/rate-limit';
import { normalisePhone } from '@/lib/phone';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;
const MIN = 60_000;

export type AuthResult = { ok: false; error: string };
export type ProfileResult = { ok: true } | { ok: false; error: string };

async function call(
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

const safeNext = (n?: string) => {
  if (!n || !n.startsWith('/') || n.startsWith('//') || n.includes('\\'))
    return '/account';
  try {
    const u = new URL(n, 'http://local.invalid');
    return u.origin === 'http://local.invalid'
      ? u.pathname + u.search
      : '/account';
  } catch {
    return '/account';
  }
};

async function clientIp() {
  const h = await headers();
  return (
    (h.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'local'
  );
}

async function startSession(token: string) {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
  });
  // লগইনের আগে বানানো কার্ট এখন এই ক্রেতার
  const cartId = jar.get('cart_id')?.value;
  if (cartId) await call('POST', `/store/carts/${cartId}/customer`, {}, token);
  revalidatePath('/', 'layout');
}

export async function login(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<AuthResult> {
  const ip = await clientIp();
  if (isLimited(`login:${ip}`, 10, 10 * MIN)) {
    return {
      ok: false,
      error: 'Too many attempts. Please wait a few minutes and try again.',
    };
  }
  record(`login:${ip}`);

  const email = input.email.trim().toLowerCase();
  if (!email || !input.password)
    return { ok: false, error: 'Enter your email and password.' };

  const r = await call('POST', '/auth/customer/emailpass', {
    email,
    password: input.password,
  });
  if (!r.ok || !r.json?.token)
    return { ok: false, error: 'Incorrect email or password.' };

  await startSession(r.json.token);
  redirect(safeNext(input.next));
}

export async function register(input: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  next?: string;
}): Promise<AuthResult> {
  const ip = await clientIp();
  if (isLimited(`reg:${ip}`, 5, 60 * MIN)) {
    return {
      ok: false,
      error: 'Too many sign-ups from this device. Please try again later.',
    };
  }
  record(`reg:${ip}`);

  const first = input.firstName.trim();
  const email = input.email.trim().toLowerCase();
  if (!first) return { ok: false, error: 'Please enter your first name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: 'Please enter a valid email address.' };
  if (input.password.length < 8)
    return { ok: false, error: 'Password must be at least 8 characters.' };

  let phone: string | undefined;
  if (input.phone.trim()) {
    const p = normalisePhone(input.phone);
    if (!p)
      return {
        ok: false,
        error: 'Please enter a valid mobile number (01XXXXXXXXX).',
      };
    phone = p;
  }

  const reg = await call('POST', '/auth/customer/emailpass/register', {
    email,
    password: input.password,
  });
  if (!reg.ok || !reg.json?.token) {
    const exists = /exist/i.test(String(reg.json?.message ?? ''));
    return {
      ok: false,
      error: exists
        ? 'An account with this email already exists. Please log in.'
        : 'Could not create your account. Please try again.',
    };
  }

  const created = await call(
    'POST',
    '/store/customers',
    { email, first_name: first, last_name: input.lastName.trim(), phone },
    reg.json.token,
  );
  if (!created.ok)
    return {
      ok: false,
      error: 'Could not create your account. Please try again.',
    };

  const login = await call('POST', '/auth/customer/emailpass', {
    email,
    password: input.password,
  });
  if (!login.ok || !login.json?.token)
    return { ok: false, error: 'Account created. Please log in.' };

  await startSession(login.json.token);
  redirect(safeNext(input.next));
}

export async function logout(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateProfile(input: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<ProfileResult> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return { ok: false, error: 'Please log in again.' };

  const first = input.firstName.trim();
  if (!first) return { ok: false, error: 'Please enter your first name.' };

  let phone: string | undefined;
  if (input.phone.trim()) {
    const p = normalisePhone(input.phone);
    if (!p)
      return {
        ok: false,
        error: 'Please enter a valid mobile number (01XXXXXXXXX).',
      };
    phone = p;
  }

  const r = await call(
    'POST',
    '/store/customers/me',
    { first_name: first, last_name: input.lastName.trim(), phone },
    token,
  );
  if (!r.ok)
    return {
      ok: false,
      error: 'Could not save your changes. Please try again.',
    };

  revalidatePath('/account', 'layout');
  return { ok: true };
}
