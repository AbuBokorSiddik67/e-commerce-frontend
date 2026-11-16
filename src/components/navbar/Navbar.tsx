import { getStoreSettings } from '@/lib/settings';
import NavbarClient from './NavbarClient';
import { getCategoryTree } from '@/lib/categories';
import { getCartCount } from '../../lib/cart';
import { hasAuthToken } from '../../lib/auth';

export default async function Navbar() {
  const s = await getStoreSettings();
  const cartCount = await getCartCount();
  const loggedIn = await hasAuthToken();

  const tree = await getCategoryTree();
  const suggestions = tree
    .flatMap((n) => [n.name, ...n.children.map((c) => c.name)])
    .slice(0, 8);

  const showBar =
    s?.announcement_enabled && (s.announcement_left || s.announcement_right);
  const barContent = showBar && (
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs sm:px-6">
      <span>{s.announcement_left}</span>
      <span className="hidden sm:block">{s.announcement_right}</span>
    </div>
  );

  return (
    <>
      {showBar && (
        <div className="bg-brand text-white">
          {s.announcement_link ? (
            <a href={s.announcement_link} className="block hover:underline">
              {barContent}
            </a>
          ) : (
            barContent
          )}
        </div>
      )}
      <NavbarClient
        storeName={s?.store_name || 'Store'}
        logoUrl={s?.logo_url}
        searchPlaceholder={s?.search_placeholder || 'Search for products...'}
        suggestions={suggestions}
        cartCount={cartCount}
        loggedIn={loggedIn}
        navLinks={(s?.nav_links || [])
          .filter(
            (l: { label?: string; url?: string }) =>
              l.label?.trim() && l.url?.trim(),
          )
          .slice(0, 5)}
        darkModeEnabled={s?.dark_mode_enabled ?? false}
      />
    </>
  );
}
