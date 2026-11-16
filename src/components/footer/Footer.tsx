import { getStoreSettings } from '@/lib/settings';
import { getCategoryTree } from '@/lib/categories';

type L = { label?: string; url?: string };

const head =
  'mb-3 font-head text-sm font-semibold uppercase tracking-wide text-white';
const link = 'text-sm text-white/70 hover:text-white';
const pill =
  'rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white hover:text-brand';

export default async function Footer() {
  const s = await getStoreSettings();
  const tree = await getCategoryTree();
  if (!s) return null;

  const links = (s.footer_links || []).filter(
    (l: L) => l.label?.trim() && l.url?.trim(),
  );
  const payments: string[] = s.footer_payments || [];
  const socials = (
    [
      ['Facebook', s.social_facebook],
      ['Instagram', s.social_instagram],
      ['YouTube', s.social_youtube],
      ['TikTok', s.social_tiktok],
    ] as [string, string | null][]
  ).filter(([, url]) => url) as [string, string][];

  const wa = (s.footer_whatsapp || '').replace(/\D/g, '');
  const hasContact = s.footer_phone || s.footer_email || s.footer_address || wa;
  const hasApp =
    s.app_card_enabled && (s.app_card_play_url || s.app_card_ios_url);
  const copyright =
    s.footer_copyright ||
    `© ${new Date().getFullYear()} ${s.store_name}. All rights reserved.`;

  return (
    <footer className="mt-8 mb-14 md:mb-0 bg-[color-mix(in_srgb,var(--brand)_88%,black)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          {/* {s.logo_url ? (
            <img
              src={s.logo_url}
              alt={s.store_name}
              className="h-10 w-fit rounded bg-white p-1.5 object-contain"
            />
          ) : (
            <span className="font-head text-xl font-bold">{s.store_name}</span>
          )} */}
          {s.footer_about && (
            <p className="max-w-xs text-sm leading-6 text-white/70">
              {s.footer_about}
            </p>
          )}
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {socials.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pill}
                >
                  {name}
                </a>
              ))}
            </div>
          )}
        </div>

        {links.length > 0 && (
          <nav aria-label="Footer">
            <h2 className={head}>Quick links</h2>
            <ul className="flex flex-col gap-2">
              {links.map((l: L, i: number) => (
                <li key={i}>
                  <a href={l.url} className={link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {tree.length > 0 && (
          <nav aria-label="Categories">
            <h2 className={head}>Categories</h2>
            <ul className="flex flex-col gap-2">
              {tree.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <a href={`/category/${c.handle}`} className={link}>
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {(hasContact || hasApp) && (
          <div>
            {hasContact && (
              <>
                <h2 className={head}>Contact</h2>
                <ul className="flex flex-col gap-2 text-sm text-white/70">
                  {s.footer_phone && (
                    <li>
                      <a
                        href={`tel:${s.footer_phone.replace(/\s/g, '')}`}
                        className={link}
                      >
                        {s.footer_phone}
                      </a>
                    </li>
                  )}
                  {wa && (
                    <li>
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={link}
                      >
                        WhatsApp chat
                      </a>
                    </li>
                  )}
                  {s.footer_email && (
                    <li>
                      <a href={`mailto:${s.footer_email}`} className={link}>
                        {s.footer_email}
                      </a>
                    </li>
                  )}
                  {s.footer_address && <li>{s.footer_address}</li>}
                </ul>
              </>
            )}
            {hasApp && (
              <div className={hasContact ? 'mt-5' : ''}>
                <h2 className={head}>Get our app</h2>
                <div className="flex flex-wrap gap-2">
                  {s.app_card_play_url && (
                    <a href={s.app_card_play_url} className={pill}>
                      Google Play
                    </a>
                  )}
                  {s.app_card_ios_url && (
                    <a href={s.app_card_ios_url} className={pill}>
                      App Store
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-white/60 sm:px-6 md:flex-row">
          <p>{copyright}</p>
          {payments.length > 0 && (
            <ul
              className="flex flex-wrap justify-center gap-1.5"
              aria-label="Accepted payments"
            >
              {payments.map((p) => (
                <li
                  key={p}
                  className="rounded border border-white/25 px-2 py-0.5 text-[11px] text-white/80"
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
