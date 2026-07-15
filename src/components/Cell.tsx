import { useEffect, useState } from 'react';
import type { CellState } from '../lib/types';
import { ShipSegment } from './ShipSegment';
import { WaterIcon, SplashIcon, ExplosionIcon, FireBurst } from './CellIcon';

type CellProps = {
  state: CellState;
  isPlayerBoard: boolean;
  isLastShot: boolean;
  onClick: () => void;
  disabled: boolean;
  label: string;
};

function cellContent(state: CellState, isPlayerBoard: boolean) {
  switch (state) {
    case 'miss':
      return (
        <SplashIcon className="pointer-events-none w-3/4 h-3/4 text-radar-glow animate-splash" />
      );
    case 'hit':
      if (isPlayerBoard) {
        return (
          <span className="pointer-events-none block w-full h-full relative">
            <ShipSegment state="hit" />
            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold drop-shadow animate-explode">
              ✕
            </span>
          </span>
        );
      }
      return (
        <span className="pointer-events-none relative flex items-center justify-center w-full h-full">
          <ExplosionIcon className="w-3/4 h-3/4 text-hit-glow animate-explode" />
          <span className="absolute text-white text-[10px] sm:text-xs font-bold drop-shadow">✕</span>
        </span>
      );
    case 'sunk':
      return (
        <span className="pointer-events-none block w-full h-full animate-sink">
          <ShipSegment state="sunk" />
        </span>
      );
    case 'ship':
      if (isPlayerBoard) {
        return (
          <span className="pointer-events-none block w-full h-full">
            <ShipSegment state="intact" />
          </span>
        );
      }
      return <WaterIcon className="pointer-events-none w-full h-full p-0.5 sm:p-1 text-radar/40 animate-wave" />;
    default:
      return <WaterIcon className="pointer-events-none w-full h-full p-0.5 sm:p-1 text-radar/40 animate-wave" />;
  }
}

function cellClasses(state: CellState, disabled: boolean) {
  const base =
    'board-cell relative overflow-hidden w-full flex items-center justify-center rounded border border-grid/60 transition-colors duration-200';
  const cursor = disabled ? ' cursor-default' : ' cursor-pointer hover:border-radar hover:brightness-110';

  switch (state) {
    case 'miss':
      return `${base} bg-radar/15 text-radar-glow${cursor}`;
    case 'hit':
      return `${base} bg-hit/20 text-hit-glow${cursor}`;
    case 'sunk':
      return `${base} bg-sunk text-sunk-glow${cursor}`;
    case 'ship':
      return `${base} bg-ship/10${cursor}`;
    default:
      return `${base} bg-ocean${cursor}`;
  }
}

export function Cell({ state, isPlayerBoard, isLastShot, onClick, disabled, label }: CellProps) {
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    if (isLastShot) {
      setFiring(true);
      const timer = setTimeout(() => setFiring(false), 600);
      return () => clearTimeout(timer);
    }
    setFiring(false);
  }, [isLastShot]);

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled || firing}
      onClick={onClick}
      className={cellClasses(state, disabled)}
    >
      {cellContent(state, isPlayerBoard)}
      {firing && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <FireBurst className="w-5/6 h-5/6 animate-fire" />
        </span>
      )}
    </button>
  );
}
