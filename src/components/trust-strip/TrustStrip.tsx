import { getStoreSettings } from '@/lib/settings';

type Item = { icon?: string; title?: string; text?: string };

// Outline icons, 24x24 grid, one consistent stroke style
const ICONS: Record<string, string[]> = {
  truck: [
    'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2',
    'M15 18H9',
    'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
    'M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
    'M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  ],
  shield: [
    'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    'm9 12 2 2 4-4',
  ],
  return: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  support: [
    'M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z',
    'M21 16v2a4 4 0 0 1-4 4h-5',
  ],
  tag: [
    'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z',
    'M7.5 7.5h.01',
  ],
  card: ['M3 6h18v12H3z', 'M3 10h18', 'M7 15h3'],
  gift: [
    'M20 12v9H4v-9',
    'M2 7h20v5H2z',
    'M12 21V7',
    'M12 7H8.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z',
    'M12 7h3.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z',
  ],
  star: [
    'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  ],
};

// icon না দিলে position অনুযায়ী default আইকন বসবে
const DEFAULT_ORDER = ['truck', 'return', 'shield', 'support'];

export default async function TrustStrip() {
  const s = await getStoreSettings();
  if (!s?.trust_strip_enabled) return null;

  const items: Item[] = (s.trust_strip_items || [])
    .filter((i: Item) => i.title?.trim() || i.text?.trim())
    .slice(0, 4);
  if (!items.length) return null;

  return (
    <section
      aria-label="Why shop with us"
      className="mx-auto hidden max-w-7xl px-4 py-3 sm:px-6 lg:block lg:py-5"
    >
      <style>{`
        @keyframes ts-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ts-item { animation: ts-rise .55s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ts-item { animation: none; }
          .ts-item, .ts-icon, .ts-bar { transition: none !important; }
        }
      `}</style>

      <ul
        style={{ '--n': items.length } as React.CSSProperties}
        className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-4"
      >
        {items.map((it, i) => {
          const key =
            it.icon && ICONS[it.icon]
              ? it.icon
              : DEFAULT_ORDER[i % DEFAULT_ORDER.length];

          return (
            <li
              key={i}
              style={{ animationDelay: `${i * 90}ms` }}
              className="ts-item group relative flex items-center gap-2.5 overflow-hidden rounded-lg border border-black/10 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_10px_24px_-8px_rgba(16,24,40,0.18)] max-lg:last:odd:col-span-2 lg:gap-4 lg:rounded-xl lg:px-5 lg:py-4 dark:border-white/10 dark:bg-[#171b22] dark:hover:border-accent/50 dark:hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]"
            >
              <span className="ts-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20 transition-all duration-300 group-hover:rotate-[360deg] group-hover:scale-105 group-hover:bg-accent group-hover:text-white group-hover:ring-accent lg:h-12 lg:w-12">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] lg:h-[22px] lg:w-[22px]"
                >
                  {ICONS[key].map((d, k) => (
                    <path key={k} d={d} />
                  ))}
                </svg>
              </span>

              <span className="min-w-0">
                {it.title && (
                  <span className="block text-[13px] font-semibold leading-tight tracking-tight text-[#12161C] max-lg:line-clamp-2 lg:truncate lg:text-[15px] dark:text-white">
                    {it.title}
                  </span>
                )}
                {it.text && (
                  <span className="mt-0.5 block text-[11px] leading-snug text-black/55 max-lg:line-clamp-2 lg:truncate lg:text-[13px] dark:text-white/55">
                    {it.text}
                  </span>
                )}
              </span>

              {/* hover-এ বাড়তে থাকা accent রেখা */}
              <span
                aria-hidden="true"
                className="ts-bar absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
