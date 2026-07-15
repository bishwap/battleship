import type { CellState } from '../lib/types';
import { ShipSegment } from './ShipSegment';

type CellProps = {
  state: CellState;
  isPlayerBoard: boolean;
  isLastShot: boolean;
  onClick: () => void;
  disabled: boolean;
  label: string;
};

function PixelWater() {
  return (
    <span className="pointer-events-none block w-full h-full rounded pixel-water opacity-60 animate-wave" />
  );
}

function cellContent(state: CellState, isPlayerBoard: boolean) {
  switch (state) {
    case 'miss':
      return (
        <span className="pointer-events-none text-miss-glow text-lg sm:text-xl font-bold animate-splash">
          ○
        </span>
      );
    case 'hit':
      return (
        <span className="pointer-events-none text-hit-glow text-lg sm:text-xl font-bold animate-explode">
          ✕
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
      return <PixelWater />;
    default:
      return <PixelWater />;
  }
}

function cellClasses(state: CellState, isLastShot: boolean, disabled: boolean) {
  const base =
    'board-cell w-full flex items-center justify-center rounded border border-grid/60 transition-colors duration-200';
  const cursor = disabled ? ' cursor-default' : ' cursor-pointer hover:border-radar hover:brightness-110';

  if (isLastShot) {
    return `${base} animate-pulse-ring${cursor}`;
  }

  switch (state) {
    case 'miss':
      return `${base} bg-miss/20 text-miss-glow${cursor}`;
    case 'hit':
      return `${base} bg-hit/20 text-hit-glow${cursor}`;
    case 'sunk':
      return `${base} bg-sunk text-sunk-glow${cursor}`;
    case 'ship':
      return `${base} bg-ocean-light${cursor}`;
    default:
      return `${base} bg-ocean-light${cursor}`;
  }
}

export function Cell({ state, isPlayerBoard, isLastShot, onClick, disabled, label }: CellProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cellClasses(state, isLastShot, disabled)}
    >
      {cellContent(state, isPlayerBoard)}
    </button>
  );
}
