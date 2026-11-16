import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreSettings } from '@/lib/settings';
import Link from 'next/link';

type Section = { heading?: string; body?: string };
type Page = {
  type?: 'policy' | 'about' | 'contact';
  slug: string;
  title: string;
  subtitle?: string;
  hero_image?: string;
  updated_at?: string;
  hours?: string;
  published?: boolean;
  sections?: Section[];
  stats?: { value?: string; label?: string }[];
  faqs?: { q?: string; a?: string }[];
};

const FALLBACK: Record<string, string> = {
  about: 'About Us',
  contact: 'Contact Us',
  returns: 'Returns & Refunds',
  shipping: 'Shipping & Delivery',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
};

async function getPage(slug: string) {
  const s: any = await getStoreSettings();
  const found: Page | undefined = (s?.pages || []).find(
    (p: Page) => p.slug === slug && p.published !== false,
  );
  if (found) return { s, page: found };
  if (FALLBACK[slug]) {
    return {
      s,
      page: {
        slug,
        title: FALLBACK[slug],
        type: 'policy',
        sections: [
          {
            heading: 'Coming soon',
            body: 'This page is being prepared. Please contact us if you need this information right now.',
          },
        ],
      } as Page,
    };
  }
  return { s, page: null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { s, page } = await getPage(slug);
  return page
    ? {
        title: `${page.title} | ${s?.store_name || 'Store'}`,
        description: page.subtitle,
      }
    : {};
}

const P = {
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'm22 7-10 5L2 7',
  ],
  pin: [
    'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z',
    'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
};

const Ico = ({ d, size = 20 }: { d: string[]; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d.map((x, i) => (
      <path key={i} d={x} />
    ))}
  </svg>
);

const card =
  'rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#171b22]';

function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="mb-4 space-y-2.5">
              {lines.map((l, k) => (
                <li
                  key={k}
                  className="flex gap-3 leading-relaxed text-black/75 dark:text-white/75"
                >
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{l.replace(/^\s*-\s*/, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="mb-4 whitespace-pre-line leading-[1.75] text-black/75 dark:text-white/75"
          >
            {b}
          </p>
        );
      })}
    </>
  );
}

function Faq({ faqs }: { faqs: { q?: string; a?: string }[] }) {
  const list = faqs.filter((f) => f.q?.trim() && f.a?.trim());
  if (!list.length) return null;
  return (
    <section className="mt-14">
      <h2 className="mb-5 font-head text-2xl font-semibold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {list.map((f, i) => (
          <details
            key={i}
            className={`group ${card} px-5 py-4 transition-colors open:border-accent/40`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-300 group-open:rotate-45">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function HelpCard({ s }: { s: any }) {
  const wa = s?.social_whatsapp?.trim();
  const phone = s?.contact_phone?.trim();
  const mail = s?.contact_email?.trim();
  if (!wa && !phone && !mail) return null;
  return (
    <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl bg-brand p-7 text-white sm:flex-row sm:items-center">
      <div>
        <h3 className="font-head text-xl font-semibold">Still need help?</h3>
        <p className="mt-1 text-sm text-white/70">
          Our team is happy to answer any question.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            WhatsApp us
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            Call {phone}
          </a>
        )}
        {!phone && mail && (
          <a
            href={`mailto:${mail}`}
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            Email us
          </a>
        )}
      </div>
    </div>
  );
}

function Hero({ page }: { page: Page }) {
  const img = page.hero_image && page.type === 'about';
  return (
    <header
      className="relative overflow-hidden bg-brand text-white"
      style={
        img
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(22,50,79,.92), rgba(22,50,79,.6)), url(${page.hero_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/60">
          <Link href="/" className="hover:text-white">
            Home
          </Link>{' '}
          <span className="mx-1.5">/</span>{' '}
          <span className="text-white/90">{page.title}</span>
        </nav>
        <h1 className="font-head text-3xl font-bold tracking-tight sm:text-5xl">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="mt-3 max-w-2xl text-base text-white/75 sm:text-lg">
            {page.subtitle}
          </p>
        )}
        <div className="mt-6 h-1 w-14 rounded bg-accent" />
      </div>
    </header>
  );
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { s, page } = await getPage(slug);
  if (!page) notFound();

  const type = page.type || 'policy';
  const sections = (page.sections || []).filter(
    (x) => x.heading?.trim() || x.body?.trim(),
  );

  /* ---------- POLICY ---------- */
  if (type === 'policy') {
    const dateLabel = page.updated_at
      ? new Date(page.updated_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;
    return (
      <>
        <Hero page={page} />
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
            <aside className="hidden lg:block">
              <nav aria-label="On this page" className="sticky top-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-black/50 dark:text-white/50">
                  On this page
                </p>
                <ul className="space-y-1 border-l border-black/10 dark:border-white/10">
                  {sections.map((x, i) => (
                    <li key={i}>
                      <a
                        href={`#s-${i}`}
                        className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-black/60 transition-colors hover:border-accent hover:text-accent dark:text-white/60"
                      >
                        {x.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <article>
              {dateLabel && (
                <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent ring-1 ring-accent/20">
                  <Ico d={P.clock} size={13} /> Last updated {dateLabel}
                </span>
              )}
              <div className="space-y-10">
                {sections.map((x, i) => (
                  <section key={i} id={`s-${i}`} className="scroll-mt-24">
                    <div className="mb-4 flex items-center gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 font-head text-sm font-bold text-accent ring-1 ring-accent/20">
                        {i + 1}
                      </span>
                      <h2 className="font-head text-xl font-semibold tracking-tight sm:text-2xl">
                        {x.heading}
                      </h2>
                    </div>
                    <div className="sm:pl-[52px]">
                      <Rich text={x.body || ''} />
                    </div>
                  </section>
                ))}
              </div>
              <Faq faqs={page.faqs || []} />
              <HelpCard s={s} />
            </article>
          </div>
        </div>
      </>
    );
  }

  /* ---------- ABOUT ---------- */
  if (type === 'about') {
    const stats = (page.stats || []).filter((x) => x.value?.trim()).slice(0, 4);
    return (
      <>
        <Hero page={page} />
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {stats.length > 0 && (
            <ul
              style={{ '--n': stats.length } as React.CSSProperties}
              className="relative z-10 -mt-8 grid grid-cols-2 gap-3 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
            >
              {stats.map((x, i) => (
                <li
                  key={i}
                  className={`${card} px-5 py-5 text-center shadow-[0_10px_24px_-12px_rgba(16,24,40,0.25)]`}
                >
                  <div className="font-head text-2xl font-bold text-brand sm:text-3xl dark:text-white">
                    {x.value}
                  </div>
                  <div className="mt-1 text-xs text-black/55 sm:text-sm dark:text-white/55">
                    {x.label}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mx-auto max-w-3xl py-14">
            {sections.map((x, i) => (
              <section key={i} className="mb-10">
                {x.heading && (
                  <h2 className="mb-4 flex items-center gap-3 font-head text-2xl font-semibold tracking-tight">
                    <span className="h-6 w-1 rounded bg-accent" /> {x.heading}
                  </h2>
                )}
                <Rich text={x.body || ''} />
              </section>
            ))}
            <Faq faqs={page.faqs || []} />
            <HelpCard s={s} />
          </div>
        </div>
      </>
    );
  }

  /* ---------- CONTACT ---------- */
  const infos = [
    {
      k: 'phone',
      label: 'Call us',
      v: s?.contact_phone,
      href: s?.contact_phone ? `tel:${s.contact_phone.replace(/\s/g, '')}` : '',
    },
    {
      k: 'mail',
      label: 'Email',
      v: s?.contact_email,
      href: s?.contact_email ? `mailto:${s.contact_email}` : '',
    },
    { k: 'pin', label: 'Visit us', v: s?.contact_address, href: '' },
    { k: 'clock', label: 'Opening hours', v: page.hours, href: '' },
  ].filter((x) => x.v?.trim());
  const wa = s?.social_whatsapp?.trim();

  return (
    <>
      <Hero page={page} />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {infos.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {infos.map((x) => {
              const body = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20 transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                    <Ico d={(P as any)[x.k]} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
                      {x.label}
                    </span>
                    <span className="mt-1 block break-words font-medium">
                      {x.v}
                    </span>
                  </span>
                </>
              );
              const cls = `group flex items-center gap-4 ${card} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_10px_24px_-8px_rgba(16,24,40,0.18)]`;
              return (
                <li key={x.k}>
                  {x.href ? (
                    <a href={x.href} className={cls}>
                      {body}
                    </a>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-4 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <Ico d={P.chat} /> Chat with us on WhatsApp
          </a>
        )}

        <div className="mx-auto mt-14 max-w-3xl">
          {sections.map((x, i) => (
            <section key={i} className="mb-8">
              {x.heading && (
                <h2 className="mb-3 font-head text-2xl font-semibold tracking-tight">
                  {x.heading}
                </h2>
              )}
              <Rich text={x.body || ''} />
            </section>
          ))}
          <Faq faqs={page.faqs || []} />
        </div>
      </div>
    </>
  );
}
