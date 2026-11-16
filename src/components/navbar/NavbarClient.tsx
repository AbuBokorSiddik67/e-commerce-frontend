'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type NavLink = { label: string; url: string };
type Props = {
  storeName: string;
  logoUrl?: string | null;
  searchPlaceholder: string;
  navLinks: NavLink[];
  darkModeEnabled: boolean;
  suggestions: string[];
  cartCount?: number;
  loggedIn: boolean;
};

const ICONS = {
  search: 'M21 21l-4.3-4.3M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z',
  cart: 'M3 4h2l2.4 11.2a1 1 0 001 .8h8.9a1 1 0 001-.8L20 8H6.2M9 20.5a.5.5 0 100-1 .5.5 0 000 1zM17 20.5a.5.5 0 100-1 .5.5 0 000 1z',
  user: 'M20 21a8 8 0 10-16 0M12 12a4 4 0 100-8 4 4 0 000 8z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  back: 'M19 12H5M12 19l-7-7 7-7',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
};

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
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

function useTypewriter(first: string, names: string[]) {
  const [text, setText] = useState(first);
  const key = JSON.stringify(names);
  const enabled = names.length > 0;

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const list: string[] = JSON.parse(key);
    const phrases = [first, ...list.map((n) => `Search in ${n}`)];
    let p = 0;
    let c = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = phrases[p];
      c += deleting ? -1 : 1;
      setText(full.slice(0, c));
      let delay = deleting ? 35 : 70;
      if (!deleting && c === full.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && c === 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
        delay = 400;
      }
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [first, key, enabled]);

  return enabled ? text : first;
}

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5 md:h-10 md:w-10 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent';

export default function NavbarClient({
  storeName,
  logoUrl,
  searchPlaceholder,
  navLinks,
  darkModeEnabled,
  suggestions,
  cartCount = 0,
  loggedIn,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const animated = useTypewriter(searchPlaceholder, suggestions);

  const showMenu = navLinks.length > 0 || darkModeEnabled;

  useEffect(() => {
    const isDark = darkModeEnabled && localStorage.getItem('theme') === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [darkModeEnabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen, menuOpen]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const searchForm = (cls: string, autoFocus = false, h = 'h-9') => (
    <form action="/search" method="get" role="search" className={cls}>
      <input
        name="q"
        type="search"
        autoFocus={autoFocus}
        placeholder={animated}
        aria-label="Search products"
        className={`${h} w-full min-w-0 rounded-l-full border border-r-0 border-black/15 bg-transparent px-4 text-sm outline-none focus:border-accent dark:border-white/20`}
      />
      <button
        type="submit"
        aria-label="Search"
        className={`${h} flex w-11 shrink-0 items-center justify-center rounded-r-full bg-accent text-white`}
      >
        <Icon d={ICONS.search} />
      </button>
    </form>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--brand)_var(--tint),var(--background))] md:border-b md:border-black/10 dark:md:border-white/15">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2.5 px-3 sm:px-6 md:h-16 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-9 w-auto max-w-[110px] object-contain md:h-9 md:max-w-[140px]"
              />
            ) : (
              <span className="font-head text-lg font-bold text-brand md:text-xl">
                {storeName}
              </span>
            )}
          </Link>

          <nav
            className="hidden items-center gap-6 text-sm font-medium xl:flex"
            aria-label="Main"
          >
            {navLinks.map((l, i) => (
              <a
                key={i}
                href={l.url}
                className="whitespace-nowrap hover:text-accent"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop/tablet search */}
          {searchForm('mx-auto hidden w-full max-w-xl md:flex')}

          {/* Mobile: ছোট search pill, ট্যাপ করলে overlay খোলে */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-black/15 px-3 text-[13px] text-black/50 md:hidden dark:border-white/20 dark:text-white/50"
          >
            <span className="shrink-0">
              <Icon d={ICONS.search} />
            </span>
            <span className="truncate">{animated}</span>
          </button>

          <div className="flex items-center gap-0 md:gap-1">
            {darkModeEnabled && (
              <button
                className={`${iconBtn} max-md:hidden`}
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                <span className="dark:hidden">
                  <Icon d={ICONS.moon} />
                </span>
                <span className="hidden dark:inline">
                  <Icon d={ICONS.sun} />
                </span>
              </button>
            )}

            <a
              href={loggedIn ? '/account' : '/login'}
              className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-black/5 max-md:hidden dark:hover:bg-white/10"
            >
              <Icon d={ICONS.user} />
              <span className="hidden sm:inline">
                {loggedIn ? 'Account' : 'Login'}
              </span>
            </a>

            <a
              href="/cart"
              className={`${iconBtn} relative max-md:hidden`}
              aria-label="Cart"
            >
              <Icon d={ICONS.cart} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </a>

            {showMenu && (
              <button
                className={`${iconBtn} max-md:w-8 max-md:-mr-1 ${navLinks.length > 0 ? 'xl:hidden' : 'md:hidden'}`}
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Icon d={ICONS.menu} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search overlay (header-এর বাইরে, তাই পুরো স্ক্রিন জুড়ে) */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative flex items-center gap-1 bg-background px-2 py-2 shadow-md">
            <button
              className={iconBtn}
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <Icon d={ICONS.back} />
            </button>
            {searchForm('flex min-w-0 flex-1', true, 'h-10')}
          </div>
        </div>
      )}

      {/* Menu drawer (ডান দিক থেকে) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-8 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <span className="font-head text-lg font-bold text-brand">
                  {storeName}
                </span>
              )}
              <button
                className={iconBtn}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <Icon d={ICONS.close} />
              </button>
            </div>

            <nav className="flex flex-col" aria-label="Mobile">
              {navLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-black/10 py-3 text-sm font-medium dark:border-white/15"
                >
                  {l.label}
                </a>
              ))}

              {darkModeEnabled && (
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between py-3 text-left text-sm font-medium md:hidden"
                >
                  <span>
                    <span className="dark:hidden">Dark mode</span>
                    <span className="hidden dark:inline">Light mode</span>
                  </span>
                  <span className="dark:hidden">
                    <Icon d={ICONS.moon} />
                  </span>
                  <span className="hidden dark:inline">
                    <Icon d={ICONS.sun} />
                  </span>
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
