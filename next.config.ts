import type { NextConfig } from 'next';

const BACKEND = (
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
).replace(/\/$/, '');

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/media/:path*', destination: `${BACKEND}/static/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: CLOUD ? `/${CLOUD}/**` : '/**',
      },
    ],
  },
  experimental: {
    // টানেলের হোস্টনাম আর অনুরোধের Origin না মিললে Server Action (Add to cart, Place order) আটকে যায়
    serverActions: { allowedOrigins: ['*.trycloudflare.com'] },
  },
};

export default nextConfig;
