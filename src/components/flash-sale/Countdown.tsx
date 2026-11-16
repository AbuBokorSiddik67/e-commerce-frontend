'use client';

import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
}
const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => 0;

export default function Countdown({ endsAt }: { endsAt: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!now) return <div aria-hidden className="h-9" />;

  const left = Math.max(0, Math.floor(new Date(endsAt).getTime() / 1000) - now);
  if (left === 0) {
    return (
      <span className="text-sm font-medium text-black/60 dark:text-white/60">
        Sale ended
      </span>
    );
  }

  const d = Math.floor(left / 86400);
  const parts: [string, number][] = [
    ...(d > 0 ? ([['d', d]] as [string, number][]) : []),
    ['h', Math.floor((left % 86400) / 3600)],
    ['m', Math.floor((left % 3600) / 60)],
    ['s', left % 60],
  ];

  return (
    <div role="timer" className="flex items-center gap-1.5">
      <span className="text-xs text-black/60 dark:text-white/60">Ends in</span>
      {parts.map(([unit, v]) => (
        <span
          key={unit}
          className="min-w-9 rounded bg-brand px-1.5 py-1 text-center text-sm font-semibold tabular-nums text-white"
        >
          {String(v).padStart(2, '0')}
          <span className="ml-0.5 text-[10px] font-normal text-white/70">
            {unit}
          </span>
        </span>
      ))}
    </div>
  );
}
