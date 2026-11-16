'use client';

import { useEffect, useRef, useState } from 'react';

type Banner = { image: string; link?: string };

const arrow =
  'absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 md:flex focus-visible:outline-2 focus-visible:outline-white';

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = banners.length;

  const go = (i: number) => setIndex((i + count) % count);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count, paused]);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) > 50) go(delta < 0 ? index + 1 : index - 1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      className="relative aspect-[3/1] overflow-hidden rounded-lg bg-black/5 dark:bg-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-500 motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b, i) => {
          const img = (
            <img
              src={b.image}
              alt={`Banner ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className="h-full w-full object-cover"
            />
          );
          return (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="h-full w-full shrink-0"
            >
              {b.link ? (
                <a
                  href={b.link}
                  tabIndex={i === index ? 0 : -1}
                  className="block h-full w-full"
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            className={`${arrow} left-3`}
            onClick={() => go(index - 1)}
            aria-label="Previous banner"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            className={`${arrow} right-3`}
            onClick={() => go(index + 1)}
            aria-label="Next banner"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === index}
                className="flex h-6 w-5 items-center justify-center"
              >
                <span
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-2 bg-white/60'}`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
