import { useState } from 'react';
import type { ShipType } from '../lib/types';
import { Ship } from './Ship';

type ShipTrayProps = {
  ships: ShipType[];
  className?: string;
};

export function ShipTray({ ships, className = '' }: ShipTrayProps) {
  const [orientations, setOrientations] = useState<Record<string, 'horizontal' | 'vertical'>>({});

  const rotate = (shipId: string) => {
    setOrientations((prev) => ({
      ...prev,
      [shipId]: prev[shipId] === 'vertical' ? 'horizontal' : 'vertical',
    }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, ship: ShipType) => {
    const orientation = orientations[ship.id] || 'horizontal';
    e.dataTransfer.setData('text/plain', JSON.stringify({ shipId: ship.id, orientation }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`bg-ocean-light/50 border border-grid rounded-lg p-3 ${className}`}>
      <h3 className="text-accent text-sm font-bold tracking-wider mb-3 uppercase">Ship Dock</h3>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {ships.length === 0 && (
          <span className="text-muted text-sm">All ships placed. Ready to battle!</span>
        )}
        {ships.map((ship) => {
          const orientation = orientations[ship.id] || 'horizontal';
          const width = orientation === 'horizontal' ? `${ship.length * 1.5}rem` : '2rem';
          const height = orientation === 'horizontal' ? '2rem' : `${ship.length * 1.5}rem`;
          return (
            <div key={ship.id} className="flex flex-col items-center gap-2">
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, ship)}
                style={{ width, height }}
                className="cursor-move"
                title={`Drag ${ship.name} to your board`}
              >
                <Ship id={ship.id} length={ship.length} orientation={orientation} state="intact" className="w-full h-full pixel-art" />
              </div>
              <span className="text-muted text-xs">{ship.name}</span>
              <button
                type="button"
                onClick={() => rotate(ship.id)}
                className="text-[10px] px-2 py-1 rounded border border-radar/30 text-radar-glow hover:bg-radar/10"
              >
                Rotate
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
