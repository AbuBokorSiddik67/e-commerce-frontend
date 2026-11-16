'use client';

import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/account', label: 'Overview', exact: true },
  { href: '/account/track', label: 'Track order' },
  { href: '/account/orders', label: 'My orders' },
  { href: '/account/profile', label: 'Profile' },
];

export default function AccountNav() {
  const path = usePathname();
  const link = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium lg:rounded-lg lg:border-transparent ${
      active
        ? 'border-brand bg-brand text-white'
        : 'border-black/15 hover:border-accent hover:text-accent dark:border-white/20'
    }`;

  return (
    <nav
      aria-label="Account"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {ITEMS.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <a
            key={i.href}
            href={i.href}
            aria-current={active ? 'page' : undefined}
            className={link(active)}
          >
            {i.label}
          </a>
        );
      })}
    </nav>
  );
}
