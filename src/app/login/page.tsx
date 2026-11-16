// src/app/login/page.tsx
import { redirect } from 'next/navigation';
import AuthForm from '@/components/account/AuthForm';
import { getCustomer } from '@/lib/auth';

export const metadata = { title: 'Log in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  if (await getCustomer()) redirect('/account');
  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <AuthForm mode="login" next={sp.next} />
    </main>
  );
}
