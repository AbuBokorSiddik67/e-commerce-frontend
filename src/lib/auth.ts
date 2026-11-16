// src/lib/auth.ts
import { cookies } from 'next/headers';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;
export const AUTH_COOKIE = 'auth_token';

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

type RawCustomer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export async function getAuthToken() {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

export async function hasAuthToken() {
  return !!(await getAuthToken());
}

export async function getCustomer(): Promise<Customer | null> {
  const token = await getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE}/store/customers/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-publishable-api-key': KEY,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { customer } = (await res.json()) as { customer?: RawCustomer };
    if (!customer) return null;
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name ?? '',
      lastName: customer.last_name ?? '',
      phone: customer.phone ?? null,
    };
  } catch {
    return null;
  }
}
