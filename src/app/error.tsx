'use client';

import Link from 'next/dist/client/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-sale/10 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sale/10 text-sale ring-1 ring-sale/20">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </span>

        <h1 className="mt-6 font-head text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-black/60 dark:text-white/60">
          We could not load this page right now. Please try again, and if the
          problem continues, come back in a few minutes.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:bg-accent"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent dark:border-white/20"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-black/40 dark:text-white/40">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
