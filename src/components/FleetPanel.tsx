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
      <div className="space-y-2">
        {ships.map((ship) => (
          <div key={ship.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShipSprite length={ship.length} sunk={ship.sunk} hitCount={ship.hits} />
              <span className={`text-xs ${ship.sunk ? 'text-sunk-glow line-through' : 'text-text'}`}>
                {ship.name}
              </span>
            </div>
            <span className={`text-xs ${ship.sunk ? 'text-sunk-glow' : 'text-muted'}`}>
              {ship.sunk ? 'Sunk' : `${ship.hits}/${ship.length}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
