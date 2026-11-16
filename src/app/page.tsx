import Hero from '@/components/hero/Hero';
import QuickLinks from '@/components/quick-links/QuickLinks';
import MidBanner from '@/components/mid-banner/MidBanner';
import FlashSale from '@/components/flash-sale/FlashSale';
import CategoryGrid from '@/components/category-grid/CategoryGrid';
import JustForYou from '@/components/just-for-you/JustForYou';
import { getStoreSettings } from '@/lib/settings';
import TrustStrip from '../components/trust-strip/TrustStrip';

type Q = { label?: string };

export default async function Home() {
  const s = await getStoreSettings();
  const hasQuick = !!(
    s?.quick_links_enabled &&
    (s.quick_links || []).some((q: Q) => q.label?.trim())
  );

  const o = hasQuick
    ? {
        mid: 'order-3 lg:order-4',
        trust: 'order-4 lg:order-3',
        flash: 'order-5',
        cat: 'order-6',
        jfy: 'order-7',
      }
    : {
        mid: 'order-3',
        trust: 'order-4 lg:order-2',
        flash: 'order-5 lg:order-4',
        cat: 'order-2 lg:order-5',
        jfy: 'order-7 lg:order-6',
      };

  return (
    <main className="flex flex-col">
      <div className="order-1">
        <Hero />
      </div>
      <div className="order-2">
        <QuickLinks />
      </div>
      <div className={o.mid}>
        <MidBanner />
      </div>
      <div className={o.trust}>
        <TrustStrip />
      </div>
      <div className={o.flash}>
        <FlashSale />
      </div>
      <div className={o.cat}>
        <CategoryGrid />
      </div>
      <div className={o.jfy}>
        <JustForYou />
      </div>
    </main>
  );
}
