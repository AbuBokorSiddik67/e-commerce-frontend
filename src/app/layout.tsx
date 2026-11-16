import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import { getStoreSettings } from '@/lib/settings';
import './globals.css';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import Footer from '../components/footer/Footer';
import Navbar from '../components/navbar/Navbar';
import CategoryBar from '../components/category-bar/CategoryBar';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-head',
  weight: ['400', '600', '700'],
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});
type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export async function generateMetadata(): Promise<Metadata> {
  const s = (await getStoreSettings()) as {
    store_name?: string;
    tagline?: string;
  } | null;
  const name = s?.store_name || 'Online Shop';
  const description =
    s?.tagline || `Shop ${name} online. Cash on delivery across Bangladesh.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    ...(site ? { metadataBase: new URL(site) } : {}),
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: { title: name, description, type: 'website' },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <html lang={settings?.default_language || 'en'}>
      <body
        className={`${sora.variable} ${inter.variable} font-body`}
        style={
          {
            '--brand': settings?.brand_color || '#16324F',
            '--accent': settings?.accent_color || '#1F8A70',
            '--sale': settings?.sale_color || '#D64545',
          } as CSSVars
        }
      >
        <Navbar />
        <CategoryBar />
        {children}
        <Footer />
        <BottomTabBar />
      </body>
    </html>
  );
}
