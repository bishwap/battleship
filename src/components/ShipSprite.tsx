import { Ship } from './Ship';

type ShipSpriteProps = {
  shipId?: string;
  length: number;
  sunk?: boolean;
  hitCount?: number;
};

export function ShipSprite({ shipId, length, sunk, hitCount = 0 }: ShipSpriteProps) {
  const state = sunk ? 'sunk' : hitCount > 0 ? 'hit' : 'intact';
  return (
    <div
      className={`relative ${sunk ? 'animate-sink' : ''}`}
      style={{ width: `${length * 1.5}rem`, height: '2rem' }}
    >
      <Ship id={shipId} orientation="horizontal" state={state} className="w-full h-full" />
      {!sunk && hitCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-ocean-light border border-hit rounded-full text-[10px] text-hit-glow font-bold">
          {hitCount}
        </span>
      )}
    </div>
  );
}
