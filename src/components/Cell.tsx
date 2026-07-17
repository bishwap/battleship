import { forwardRef, useEffect, useState } from 'react';
import type { CellState } from '../lib/types';
import {
  CannonballIcon,
  WaterIcon,
  MissIcon,
  WoodHitIcon,
  PlayerSkullIcon,
  EnemyTrophyIcon,
} from './CellIcon';

type CellProps = {
  state: CellState;
  isPlayerBoard: boolean;
  isLastShot: boolean;
  onClick: () => void;
  onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: React.DragEventHandler<HTMLButtonElement>;
  disabled: boolean;
  label: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onDragEnter?: React.DragEventHandler<HTMLButtonElement>;
  isPreview?: boolean;
  isValid?: boolean;
  isSelected?: boolean;
};

function cellContent(state: CellState, isPlayerBoard: boolean, firing: boolean) {
  if (firing && state !== 'ship' && state !== 'empty') {
    return null;
  }

  switch (state) {
    case 'miss':
      return <MissIcon className="pointer-events-none w-3/4 h-3/4 text-miss-glow" />;
    case 'hit':
      return <WoodHitIcon className="pointer-events-none w-3/4 h-3/4 animate-explode" />;
    case 'sunk':
      if (isPlayerBoard) {
        return <PlayerSkullIcon className="pointer-events-none w-3/5 h-3/5 text-sunk-glow drop-shadow animate-sink" />;
      }
      return <EnemyTrophyIcon className="pointer-events-none w-3/5 h-3/5 text-ship-glow drop-shadow animate-sink" />;
    case 'ship':
      if (isPlayerBoard) {
        return null;
      }
      return <WaterIcon className="pointer-events-none w-full h-full p-0.5 sm:p-1 text-radar/40 animate-wave" />;
    default:
      return <WaterIcon className="pointer-events-none w-full h-full p-0.5 sm:p-1 text-radar/40 animate-wave" />;
  }
}

function cellClasses(state: CellState, isPlayerBoard: boolean, disabled: boolean, isPreview?: boolean, isValid?: boolean, isSelected?: boolean) {
  const base =
    'board-cell relative overflow-hidden w-full h-full flex items-center justify-center rounded border border-grid/60 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-radar focus-visible:ring-offset-2 focus-visible:ring-offset-ocean active:scale-95 disabled:opacity-60';
  const cursor = disabled ? ' cursor-default' : ' cursor-pointer hover:border-radar hover:brightness-110';
  const preview = isPreview ? (isValid ? ' bg-ship/20 ring-1 ring-ship-glow' : ' bg-hit/20 ring-1 ring-hit-glow') : '';
  const selected = isSelected ? ' ring-2 ring-radar ring-offset-1 ring-offset-ocean' : '';

  switch (state) {
    case 'miss':
      return `${base} z-20 bg-radar/15 text-miss-glow${cursor}${preview}${selected}`;
    case 'hit':
      return `${base} z-20 bg-hit/20 text-hit-glow${cursor}${preview}${selected}`;
    case 'sunk':
      return `${base} z-20 bg-sunk text-sunk-glow${cursor}${preview}${selected}`;
    case 'ship':
      return `${base} z-0 ${isPlayerBoard ? 'bg-ship/10' : 'bg-ocean'}${cursor}${preview}${selected}`;
    default:
      return `${base} z-0 bg-ocean${cursor}${preview}${selected}`;
  }
}

export const Cell = forwardRef<HTMLButtonElement, CellProps>(
  ({ state, isPlayerBoard, isLastShot, onClick, onDrop, onDragStart, onDragEnd, disabled, label, style, tabIndex, onFocus, onKeyDown, onMouseEnter, onDragEnter, isPreview, isValid, isSelected }, ref) => {
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
        ref={ref}
        type="button"
        aria-label={label}
        disabled={disabled || firing}
        tabIndex={tabIndex}
        draggable={!!onDragStart}
        onClick={onClick}
        onDrop={onDrop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onMouseEnter={onMouseEnter}
        onDragEnter={onDragEnter}
        onDragOver={(e) => {
          if (onDrop || onDragStart) e.preventDefault();
        }}
        className={cellClasses(state, isPlayerBoard, disabled, isPreview, isValid, isSelected)}
        style={style}
      >
        {cellContent(state, isPlayerBoard, firing)}
        {firing && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <CannonballIcon className="w-3/5 h-3/5 animate-drop" />
          </span>
        )}
      </button>
    );
  }
);

Cell.displayName = 'Cell';
