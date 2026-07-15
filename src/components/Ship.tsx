type ShipProps = {
  id?: string;
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

function getShipParts(id: string | undefined): ShipPart[] {
  const hull: ShipPart = {
    kind: 'rect',
    x: 0,
    y: 45,
    w: 100,
    h: 25,
    rx: 8,
    ry: 8,
    fill: 'body',
  };

  switch (id) {
    case 'carrier':
      return [
        hull,
        { kind: 'rect', x: 10, y: 25, w: 80, h: 20, rx: 4, ry: 4, fill: 'body' },
        { kind: 'rect', x: 20, y: 30, w: 60, h: 8, rx: 2, ry: 2, fill: 'dark' },
        { kind: 'rect', x: 55, y: 5, w: 20, h: 22, rx: 3, ry: 3, fill: 'body' },
        { kind: 'circle', cx: 25, cy: 20, r: 5, fill: 'dark' },
        { kind: 'circle', cx: 82, cy: 20, r: 5, fill: 'dark' },
      ];
    case 'submarine':
      return [
        { kind: 'rect', x: 0, y: 42, w: 100, h: 28, rx: 14, ry: 14, fill: 'body' },
        { kind: 'rect', x: 35, y: 10, w: 30, h: 25, rx: 4, ry: 4, fill: 'body' },
        { kind: 'rect', x: 45, y: 0, w: 10, h: 12, rx: 2, ry: 2, fill: 'dark' },
        { kind: 'rect', x: 40, y: 50, w: 20, h: 5, rx: 1, ry: 1, fill: 'dark' },
      ];
    case 'destroyer':
      return [
        hull,
        { kind: 'rect', x: 20, y: 25, w: 60, h: 20, rx: 4, ry: 4, fill: 'body' },
        { kind: 'rect', x: 68, y: 8, w: 18, h: 22, rx: 3, ry: 3, fill: 'body' },
        { kind: 'circle', cx: 30, cy: 20, r: 5, fill: 'dark' },
      ];
    case 'cruiser':
      return [
        hull,
        { kind: 'rect', x: 15, y: 25, w: 70, h: 20, rx: 4, ry: 4, fill: 'body' },
        { kind: 'rect', x: 60, y: 8, w: 18, h: 22, rx: 3, ry: 3, fill: 'body' },
        { kind: 'circle', cx: 30, cy: 20, r: 5, fill: 'dark' },
      ];
    case 'battleship':
    default:
      return [
        hull,
        { kind: 'rect', x: 15, y: 25, w: 70, h: 20, rx: 4, ry: 4, fill: 'body' },
        { kind: 'rect', x: 55, y: 5, w: 20, h: 22, rx: 3, ry: 3, fill: 'body' },
        { kind: 'circle', cx: 25, cy: 20, r: 5, fill: 'dark' },
        { kind: 'circle', cx: 78, cy: 20, r: 5, fill: 'dark' },
      ];
  }
}

export function Ship({ id, orientation = 'horizontal', state = 'intact', className, viewBox = '0 0 100 100' }: ShipProps) {
  const colors = palette[state];
  const parts = getShipParts(id).map((p) => swapPart(p, orientation));

  return (
    <svg
      viewBox={viewBox}
      className={className}
      preserveAspectRatio="none"
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
          <circle cx={30} cy={35} r={4} fill={colors.glow} />
          <circle cx={70} cy={55} r={5} fill={colors.glow} />
          <circle cx={50} cy={70} r={3} fill={colors.glow} />
        </g>
      )}
    </svg>
  );
}
