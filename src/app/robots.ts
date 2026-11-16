import type { MetadataRoute } from 'next';

// ডেমোতে বন্ধ, ক্লায়েন্টের আসল সাইটে frontend.env-এ ALLOW_INDEXING=true দিন
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  if (process.env.ALLOW_INDEXING !== 'true') {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/cart', '/checkout', '/order-confirmation'],
      },
    ],
    ...(site ? { sitemap: `${site}/sitemap.xml` } : {}),
  };
}
