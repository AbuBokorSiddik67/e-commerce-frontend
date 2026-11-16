import type { Metadata } from 'next';
import Link from 'next/link';
import TrackForm from '../../components/track-orders/TrackForm';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description:
    'Check the status of your order with your order number and phone number.',
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <>
      <header className="relative overflow-hidden bg-brand text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/60">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/90">Track order</span>
          </nav>
          <h1 className="font-head text-3xl font-bold tracking-tight sm:text-5xl">
            Track your order
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/75 sm:text-lg">
            No account needed. Enter your order number and phone number.
          </p>
          <div className="mt-6 h-1 w-14 rounded bg-accent" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <TrackForm defaultOrder={order?.replace(/\D/g, '') || ''} />
        <p className="mt-8 text-center text-sm text-black/55 dark:text-white/55">
          Need help with an order?{' '}
          <Link
            href="/pages/contact"
            className="font-medium text-accent hover:underline"
          >
            Contact us
          </Link>
        </p>
      </div>
    </>
  );
}
