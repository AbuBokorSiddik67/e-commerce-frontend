'use client';

import { useState, useTransition } from 'react';
import { applyPromo, removePromo } from '@/lib/cart-actions';

export default function PromoForm({ applied }: { applied: string[] }) {
  const [code, setCode] = useState('');
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      try {
        const r = await applyPromo(code);
        if (r.ok) {
          setCode('');
          setMsg({ type: 'ok', text: 'Promo code applied.' });
        } else {
          setMsg({ type: 'err', text: r.error });
        }
      } catch {
        setMsg({
          type: 'err',
          text: 'Something went wrong. Please try again.',
        });
      }
    });
  };

  const remove = (c: string) => {
    setMsg(null);
    start(async () => {
      const r = await removePromo(c);
      if (!r.ok) setMsg({ type: 'err', text: r.error });
    });
  };

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Promo code"
          aria-label="Promo code"
          className="h-10 min-w-0 flex-1 rounded-lg border border-black/20 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/25"
        />
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="h-10 rounded-lg border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-50"
        >
          {pending ? '...' : 'Apply'}
        </button>
      </form>

      {applied.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {applied.map((c) => (
            <li
              key={c}
              className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
            >
              {c}
              <button
                type="button"
                onClick={() => remove(c)}
                aria-label={`Remove code ${c}`}
                className="text-base leading-none hover:text-sale"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {msg && (
        <p
          role="status"
          className={`mt-2 text-xs font-medium ${msg.type === 'ok' ? 'text-accent' : 'text-sale'}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
