type ShipProps = {
  id?: string;
  length?: number;
  orientation?: 'horizontal' | 'vertical';
  state?: 'intact' | 'hit' | 'sunk';
  className?: string;
  viewBox?: string;
};

type ShipPart =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number; ry: number; fill: 'body' | 'dark' | 'glow' }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: 'body' | 'dark' | 'glow' };

const palette = {
  intact: { body: '#22c55e', glow: '#86efac', dark: '#14532d' },
  hit: { body: '#f97316', glow: '#fdba74', dark: '#7c2d12' },
  sunk: { body: '#7f1d1d', glow: '#f87171', dark: '#450a0a' },
};

const shipLengths: Record<string, number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

function swapPart(part: ShipPart, orientation: 'horizontal' | 'vertical'): ShipPart {
  if (orientation === 'horizontal') return part;
  if (part.kind === 'rect') {
    return {
      ...part,
      x: part.y,
      y: part.x,
      w: part.h,
      h: part.w,
      rx: part.ry,
      ry: part.rx,
    };
  }
  return { ...part, cx: part.cy, cy: part.cx };
}

function getShipParts(id: string | undefined, shipWidth: number): ShipPart[] {
  const w = shipWidth;
  const hull: ShipPart = { kind: 'rect', x: 0, y: 45, w, h: 25, rx: 12, ry: 12, fill: 'body' };

  switch (id) {
    case 'carrier':
      return [
        hull,
        { kind: 'rect', x: w * 0.05, y: 40, w: w * 0.9, h: 5, rx: 2, ry: 2, fill: 'body' },
        { kind: 'rect', x: w * 0.55, y: 12, w: w * 0.12, h: 35, rx: 3, ry: 3, fill: 'body' },
        { kind: 'rect', x: w * 0.1, y: 55, w: w * 0.8, h: 8, rx: 2, ry: 2, fill: 'dark' },
        { kind: 'circle', cx: w * 0.25, cy: 20, r: Math.max(12, w * 0.02), fill: 'dark' },
        { kind: 'circle', cx: w * 0.75, cy: 20, r: Math.max(12, w * 0.02), fill: 'dark' },
      ];
    case 'submarine':
      return [
        { kind: 'rect', x: 0, y: 42, w, h: 28, rx: 14, ry: 14, fill: 'body' },
        { kind: 'rect', x: w * 0.35, y: 10, w: w * 0.3, h: 35, rx: 4, ry: 4, fill: 'body' },
        { kind: 'rect', x: w * 0.48, y: 0, w: w * 0.04, h: 12, rx: 2, ry: 2, fill: 'dark' },
        { kind: 'rect', x: w * 0.1, y: 50, w: w * 0.8, h: 5, rx: 1, ry: 1, fill: 'dark' },
      ];
    case 'destroyer':
      return [
        hull,
        { kind: 'rect', x: w * 0.35, y: 25, w: w * 0.25, h: 15, rx: 3, ry: 3, fill: 'body' },
        { kind: 'rect', x: w * 0.7, y: 20, w: w * 0.15, h: 15, rx: 2, ry: 2, fill: 'body' },
        { kind: 'circle', cx: w * 0.5, cy: 20, r: Math.max(12, w * 0.02), fill: 'dark' },
      ];
    case 'cruiser':
      return [
        hull,
        { kind: 'rect', x: w * 0.2, y: 25, w: w * 0.12, h: 15, rx: 2, ry: 2, fill: 'body' },
        { kind: 'rect', x: w * 0.68, y: 25, w: w * 0.12, h: 15, rx: 2, ry: 2, fill: 'body' },
        { kind: 'rect', x: w * 0.44, y: 15, w: w * 0.08, h: 25, rx: 2, ry: 2, fill: 'dark' },
        { kind: 'circle', cx: w * 0.45, cy: 20, r: Math.max(12, w * 0.02), fill: 'dark' },
      ];
    case 'battleship':
    default:
      return [
        hull,
        { kind: 'rect', x: w * 0.12, y: 25, w: w * 0.12, h: 15, rx: 2, ry: 2, fill: 'body' },
        { kind: 'rect', x: w * 0.76, y: 25, w: w * 0.12, h: 15, rx: 2, ry: 2, fill: 'body' },
        { kind: 'rect', x: w * 0.44, y: 8, w: w * 0.08, h: 35, rx: 2, ry: 2, fill: 'dark' },
        { kind: 'circle', cx: w * 0.25, cy: 20, r: Math.max(12, w * 0.02), fill: 'dark' },
        { kind: 'circle', cx: w * 0.75, cy: 20, r: Math.max(12, w * 0.02), fill: 'dark' },
      ];
  }
}

export function Ship({
  id,
  length,
  orientation = 'horizontal',
  state = 'intact',
  className,
  viewBox,
}: ShipProps) {
  const colors = palette[state];
  const shipLength = length ?? shipLengths[id || 'battleship'] ?? 1;
  const shipWidth = shipLength * 100;
  const computedViewBox =
    orientation === 'horizontal' ? `0 0 ${shipWidth} 100` : `0 0 100 ${shipWidth}`;

  const parts = getShipParts(id, shipWidth).map((p) => swapPart(p, orientation));

  return (
    <svg
      viewBox={viewBox ?? computedViewBox}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {parts.map((part, i) => {
        if (part.kind === 'rect') {
          return (
            <rect
              key={i}
              x={part.x}
              y={part.y}
              width={part.w}
              height={part.h}
              rx={part.rx}
              ry={part.ry}
              fill={colors[part.fill]}
              stroke={colors.glow}
              strokeWidth={1}
            />
          );
        }
        return (
          <circle
            key={i}
            cx={part.cx}
            cy={part.cy}
            r={part.r}
            fill={colors[part.fill]}
            stroke={colors.glow}
            strokeWidth={1}
          />
        );
      })}
      {state === 'sunk' && (
        <g opacity={0.6}>
          <circle cx={shipWidth * 0.25} cy={35} r={Math.max(3, shipWidth * 0.015)} fill={colors.glow} />
          <circle cx={shipWidth * 0.75} cy={55} r={Math.max(4, shipWidth * 0.02)} fill={colors.glow} />
          <circle cx={shipWidth * 0.5} cy={70} r={Math.max(2, shipWidth * 0.01)} fill={colors.glow} />
        </g>
      )}
    </svg>
  );
}
