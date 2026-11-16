'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CategoryNode } from '@/lib/categories';
import { MobileItem } from '@/components/category-bar/CategoryBarClient';
import Link from 'next/dist/client/link';

const P = {
  home: 'M3 11l9-8 9 8M5 9.5V20h5v-6h4v6h5V9.5',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  cart: 'M3 4h2l2.4 11.2a1 1 0 001 .8h8.9a1 1 0 001-.8L20 8H6.2M9 20.5a.5.5 0 100-1 .5.5 0 000 1zM17 20.5a.5.5 0 100-1 .5.5 0 000 1z',
  user: 'M20 21a8 8 0 10-16 0M12 12a4 4 0 100-8 4 4 0 000 8z',
  close: 'M6 6l12 12M18 6L6 18',
};

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const tab = (active: boolean) =>
  `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
    active ? 'text-accent' : 'text-black/60 dark:text-white/60'
  }`;

export default function BottomTabBarClient({
  tree,
  cartCount = 0,
  loggedIn = false,
}: {
  tree: CategoryNode[];
    cartCount?: number;
    loggedIn: boolean;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-black/10 bg-background pb-[env(safe-area-inset-bottom)] md:hidden dark:border-white/15"
      >
        <Link
          href="/"
          className={tab(path === '/')}
          aria-current={path === '/' ? 'page' : undefined}
        >
          <Icon d={P.home} />
          Home
        </Link>

        <button
          className={tab(open)}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Icon d={P.grid} />
          Categories
        </button>

        <a href="/cart" className={tab(path.startsWith('/cart'))}>
          <span className="relative">
            <Icon d={P.cart} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </a>

        <a
          href={loggedIn ? '/account' : '/login'}
          className={tab(
            path.startsWith('/login') ||
              path.startsWith('/register') ||
              path.startsWith('/account'),
          )}
        >
          <Icon d={P.user} />
          Account
        </a>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Categories"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-2xl bg-background pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/15">
              <span className="font-head text-base font-semibold">
                Categories
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Icon d={P.close} />
              </button>
            </div>
            <ul className="overflow-y-auto px-4 pb-4">
              {tree.length ? (
                tree.map((n) => <MobileItem key={n.id} node={n} depth={0} />)
              ) : (
                <li className="py-6 text-sm text-black/60 dark:text-white/60">
                  No categories yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
