import { ShipSegment } from './ShipSegment';

type ShipSpriteProps = {
  length: number;
  sunk?: boolean;
  hitCount?: number;
};

export function ShipSprite({ length, sunk, hitCount = 0 }: ShipSpriteProps) {
  const cells = Array.from({ length }, (_, i) => i);
  return (
    <div className={`flex gap-1 ${sunk ? 'animate-sink' : ''}`}>
      {cells.map((i) => {
        const state = sunk ? 'sunk' : i < hitCount ? 'hit' : 'intact';
        return (
          <div key={i} className="w-6 h-6">
            <ShipSegment state={state} />
          </div>
        );
      })}
    </div>
  );
}
