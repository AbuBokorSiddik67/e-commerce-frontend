// src/app/account/layout.tsx
import { redirect } from 'next/navigation';
import AccountNav from '@/components/account/AccountNav';
import { getCustomer } from '@/lib/auth';
import { logout } from '@/lib/auth-actions';
import { TRACK_PATH } from '@/lib/routes';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();
  if (!customer) redirect('/login?next=/account');

  const name =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    customer.email;

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-6 lg:gap-4 lg:self-start">
          {/* প্রোফাইল */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-head text-base font-bold text-accent sm:h-11 sm:w-11 sm:text-lg">
                {name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-black/60 dark:text-white/60">
                  {customer.email}
                </p>
              </div>
            </div>

            {/* ফোনে/ট্যাবলেটে ওপরে */}
            <form action={logout} className="shrink-0 lg:hidden">
              <button
                type="submit"
                className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium text-black/70 transition-colors hover:border-sale hover:text-sale dark:border-white/20 dark:text-white/70"
              >
                Log out
              </button>
            </form>
          </div>

          {/* মেনু: ফোনে অনুভূমিক swipe, ডেস্কটপে সাধারণ */}
          <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <AccountNav />
          </div>

          {/* ডেস্কটপে নিচে */}
          <form action={logout} className="hidden lg:block">
            <button
              type="submit"
              className="text-sm text-black/60 underline hover:text-sale dark:text-white/60"
            >
              Log out
            </button>
          </form>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
