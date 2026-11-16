import type { SVGProps } from 'react';

import { getStoreSettings } from '@/lib/settings';
import HeroSlider from './HeroSlider';

type Promo = { image: string; link?: string };

const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
  </svg>
);

const AppleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

const storeBtn =
  'inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand hover:bg-white/90';

export default async function Hero() {
  const s = await getStoreSettings();

  const banners = (s?.hero_banners || []).filter(
    (b: { active: boolean; image: string }) => b.active && b.image,
  );
  if (!banners.length) return null;

  const hasApp = !!(
    s?.app_card_enabled &&
    (s.app_card_play_url || s.app_card_ios_url)
  );
  const promos: Promo[] = (s?.side_promos || [])
    .filter((p: Promo) => p.image)
    .slice(0, hasApp ? 1 : 2);
  const sideCount = promos.length + (hasApp ? 1 : 0);

  const sideGrid = sideCount > 1 ? 'lg:grid-rows-2' : 'lg:grid-rows-1';

  return (
    <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
      <div
        className={`grid gap-3 ${sideCount ? 'lg:grid-cols-[1fr_300px]' : ''}`}
      >
        <HeroSlider banners={banners} />

        {sideCount > 0 && (
          <div className={`hidden gap-3 lg:grid lg:grid-cols-1 ${sideGrid}`}>
            {promos.map((p, i) => {
              const img = (
                <img
                  src={p.image}
                  alt={`Promotion ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              );
              const cls =
                'relative block aspect-[400/205] overflow-hidden rounded-lg lg:aspect-auto';
              return p.link ? (
                <a key={i} href={p.link} className={cls}>
                  {img}
                </a>
              ) : (
                <div key={i} className={cls}>
                  {img}
                </div>
              );
            })}

            {hasApp && (
              <div className="relative min-h-36 overflow-hidden rounded-lg p-4 text-white flex flex-col justify-between">
                {/* Full Background Image - Fits perfectly regardless of original ratio/size */}
                {s.app_card_image && (
                  <img
                    src={s.app_card_image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                  />
                )}

                {/* Dark Overlay (Keeps background dim so text is super clear) */}
                {/* <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" /> */}

                {/* Content Area */}
                <div className="relative z-10 flex flex-col justify-between gap-3 h-full">
                  <div>
                    <p className="font-head text-sm sm:text-base font-semibold leading-snug !text-white">
                      {s.app_card_title || 'Shop faster on our app'}
                    </p>
                    <p className="mt-1 text-xs !text-white/90">
                      {s.app_card_text ||
                        'Exclusive offers and easier checkout.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {s.app_card_play_url && (
                      <a
                        href={s.app_card_play_url}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/40 border border-white/40 !text-white text-xs font-medium transition"
                      >
                        <PlayIcon className="w-4 h-4 !text-white group-hover:!text-black fill-current" />
                        <span className="!text-white">Google Play</span>
                      </a>
                    )}
                    {s.app_card_ios_url && (
                      <a
                        href={s.app_card_ios_url}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/40 border border-white/40 !text-white text-xs font-medium transition"
                      >
                        <AppleIcon className="w-4 h-4 !text-white group-hover:!text-black fill-current" />
                        <span className="!text-white">App Store</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
