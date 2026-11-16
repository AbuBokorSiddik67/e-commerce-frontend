const ICONS: Record<string, string[]> = {
  truck: [
    'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2',
    'M15 18H9',
    'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
    'M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
    'M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  ],
  shield: [
    'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    'm9 12 2 2 4-4',
  ],
  return: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  support: [
    'M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z',
    'M21 16v2a4 4 0 0 1-4 4h-5',
  ],
  tag: [
    'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z',
    'M7.5 7.5h.01',
  ],
  card: ['M3 6h18v12H3z', 'M3 10h18', 'M7 15h3'],
  gift: [
    'M20 12v9H4v-9',
    'M2 7h20v5H2z',
    'M12 21V7',
    'M12 7H8.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z',
    'M12 7h3.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z',
  ],
  star: [
    'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  ],
};

export function TrustIcon({
  name,
  size = 18,
}: {
  name?: string;
  size?: number;
}) {
  const paths = ICONS[name ?? ''] ?? ICONS.shield;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, k) => (
        <path key={k} d={d} />
      ))}
    </svg>
  );
}
