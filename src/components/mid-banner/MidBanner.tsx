import { getStoreSettings } from '@/lib/settings';

type B = { image?: string; link?: string; active?: boolean };

export default async function MidBanner() {
  const s = await getStoreSettings();
  const items: B[] = (s?.mid_banners || [])
    .filter((b: B) => b.active !== false && b.image)
    .slice(0, 3);
  if (!items.length) return null;

  return (
    <section
      aria-label="Promotions"
      className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
    >
      <ul className="flex flex-col gap-3">
        {items.map((b, i) => {
          const img = (
            <img
              src={b.image}
              alt={`Promotion ${i + 1}`}
              loading="lazy"
              className="block h-auto w-full sm:h-full sm:object-cover"
            />
          );
          const cls =
            'block overflow-hidden rounded-xl sm:aspect-[9/1] transition-transform duration-300 hover:-translate-y-0.5';
          return (
            <li key={i}>
              {b.link ? (
                <a href={b.link} className={cls}>
                  {img}
                </a>
              ) : (
                <div className={cls}>{img}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
