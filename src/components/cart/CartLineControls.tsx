'use client';

import { useState, useTransition } from 'react';
import { removeLine, updateLine, type ActionResult } from '@/lib/cart-actions';

export default function CartLineControls({
  lineId,
  quantity,
}: {
  lineId: string;
  quantity: number;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const run = (action: () => Promise<ActionResult>) => {
    setError('');
    start(async () => {
      try {
        const r = await action();
        if (!r.ok) setError(r.error);
      } catch {
        setError('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div
          role="group"
          aria-label="Quantity"
          className="flex items-center rounded-lg border border-black/20 dark:border-white/25"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={pending || quantity <= 1}
            onClick={() => run(() => updateLine(lineId, quantity - 1))}
            className="h-9 w-9 text-lg disabled:opacity-40"
          >
            −
          </button>
          <span
            className="w-8 text-center text-sm font-semibold tabular-nums"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={pending || quantity >= 99}
            onClick={() => run(() => updateLine(lineId, quantity + 1))}
            className="h-9 w-9 text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => removeLine(lineId))}
          className="text-sm text-black/60 underline hover:text-sale disabled:opacity-40 dark:text-white/60"
        >
          Remove
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
