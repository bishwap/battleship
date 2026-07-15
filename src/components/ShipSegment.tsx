type ShipSegmentProps = {
  state?: 'intact' | 'hit' | 'sunk';
};

export function ShipSegment({ state = 'intact' }: ShipSegmentProps) {
  const palette = {
    intact: { body: '#22c55e', glow: '#86efac', dark: '#14532d' },
    hit: { body: '#ef4444', glow: '#fca5a5', dark: '#7f1d1d' },
    sunk: { body: '#7f1d1d', glow: '#f87171', dark: '#450a0a' },
  }[state];

  return (
    <svg
      viewBox="0 0 16 16"
      className="pointer-events-none w-full h-full p-1 pixel-art"
      aria-hidden="true"
    >
      <rect x="0" y="6" width="16" height="8" rx="1" fill={palette.body} stroke={palette.glow} strokeWidth="1" />
      <rect x="2" y="2" width="4" height="5" fill={palette.body} stroke={palette.glow} strokeWidth="1" />
      <rect x="5" y="0" width="3" height="2" fill={palette.dark} />
      <rect x="3" y="7" width="3" height="2" fill={palette.dark} />
      <rect x="10" y="7" width="3" height="2" fill={palette.dark} />
    </svg>
  );
}
