const STEPS = ['Order placed', 'Packed', 'On the way', 'Delivered'];

export default function OrderTimeline({
  step,
  cancelled,
}: {
  step: number;
  cancelled: boolean;
}) {
  if (cancelled) {
    return (
      <p className="rounded-lg bg-sale/10 px-4 py-3 text-sm font-medium text-sale">
        This order was cancelled.
      </p>
    );
  }

  return (
    <ol className="grid grid-cols-4" aria-label="Order progress">
      {STEPS.map((label, i) => {
        const done = i <= step;
        const current = i === step;
        return (
          <li
            key={label}
            aria-current={current ? 'step' : undefined}
            className="relative flex flex-col items-center gap-1.5 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-3.5 h-0.5 w-full ${
                  i <= step ? 'bg-accent' : 'bg-black/15 dark:bg-white/20'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? 'bg-accent text-white'
                  : 'bg-black/10 text-black/50 dark:bg-white/15 dark:text-white/50'
              } ${current ? 'ring-4 ring-accent/20' : ''}`}
            >
              {done ? (
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={`px-0.5 text-[11px] leading-tight sm:text-xs ${
                done ? 'font-semibold' : 'text-black/50 dark:text-white/50'
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
