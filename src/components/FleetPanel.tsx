import type { ShipStatus } from '../lib/types';
import { ShipSprite } from './ShipSprite';

type FleetPanelProps = {
  ships: ShipStatus[];
  label: string;
};

export function FleetPanel({ ships, label }: FleetPanelProps) {
  return (
    <div className="bg-ocean-light/50 border border-grid rounded-lg p-3">
      <h3 className="text-accent text-sm font-bold tracking-wider mb-2 uppercase">{label}</h3>
      <div className="space-y-3">
        {ships.map((ship) => (
          <div key={ship.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <ShipSprite shipId={ship.id} length={ship.length} sunk={ship.sunk} hitCount={ship.hits} />
            <span className={`text-sm truncate ${ship.sunk ? 'text-sunk-glow' : 'text-text'}`}>
              {ship.name}
            </span>
            <span className={`text-sm whitespace-nowrap ${ship.sunk ? 'text-sunk-glow' : 'text-muted'}`}>
              {ship.sunk ? 'Sunk' : `${ship.hits}/${ship.length}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
