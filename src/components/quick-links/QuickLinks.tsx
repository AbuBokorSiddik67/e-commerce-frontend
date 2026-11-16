import { getStoreSettings } from '@/lib/settings';

type Q = { image?: string; label?: string; link?: string };

export default async function QuickLinks() {
  const s = await getStoreSettings();
  if (!s?.quick_links_enabled) return null;

  const items: Q[] = (s.quick_links || [])
    .filter((q: Q) => q.label?.trim())
    .slice(0, 12);
  if (!items.length) return null;

  const rows = items.length > 5 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <section
      aria-label="Shortcuts"
      className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:hidden"
    >
      <div className="rounded-xl border border-black/10 bg-white py-3 pl-3 dark:border-white/15 dark:bg-[#171b22] lg:pr-3">
        <ul
          className={`grid auto-cols-[76px] grid-flow-col ${rows} gap-x-1 gap-y-3 overflow-x-auto pr-3 [scrollbar-width:none] lg:auto-cols-auto lg:grid-flow-row lg:grid-rows-none lg:grid-cols-[repeat(auto-fit,minmax(88px,1fr))] lg:overflow-visible [&::-webkit-scrollbar]:hidden`}
        >
          {items.map((q, i) => {
            const tile = (
              <>
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-accent/10 text-lg font-semibold text-accent lg:h-16 lg:w-16">
                  {q.image ? (
                    <img
                      src={q.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    q.label!.trim().charAt(0)
                  )}
                </span>
                <span className="line-clamp-2 text-center text-[11px] leading-[14px] lg:text-xs">
                  {q.label}
                </span>
              </>
            );
            const cls =
              'flex w-[76px] flex-col items-center gap-1.5 hover:text-accent lg:w-auto';
            return (
              <li key={i}>
                {q.link ? (
                  <a href={q.link} className={cls}>
                    {tile}
                  </a>
                ) : (
                  <div className={cls}>{tile}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
