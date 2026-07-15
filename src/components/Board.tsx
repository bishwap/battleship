import { BOARD_SIZE } from '../lib/constants';
import type { Board as BoardType, Position } from '../lib/types';
import { Cell } from './Cell';

type BoardProps = {
  board: BoardType;
  isPlayerBoard: boolean;
  onCellClick?: (x: number, y: number) => void;
  disabled: boolean;
  lastShot: Position | null;
  title: string;
};

const ROW_LABELS = 'ABCDEFGHIJ'.split('');

export function Board({ board, isPlayerBoard, onCellClick, disabled, lastShot, title }: BoardProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-full sm:max-w-[600px] bg-ocean-light/40 border border-grid rounded-lg p-2 sm:p-4">
      <h3 className="text-accent text-sm sm:text-base font-bold tracking-wider mb-2 sm:mb-3 uppercase">{title}</h3>
      <div className="grid grid-cols-[auto_1fr] gap-1 sm:gap-2 w-full">
        <div className="w-5 sm:w-6" />
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={`col-${i}`} className="text-center text-radar-glow text-[10px] sm:text-xs font-bold">
              {i + 1}
            </div>
          ))}
        </div>
        {board.cells.map((row, y) => (
          <div key={`row-${y}`} className="grid grid-cols-[auto_1fr] gap-1 sm:gap-2">
            <div className="flex items-center justify-center w-5 sm:w-6 text-radar-glow text-[10px] sm:text-xs font-bold">
              {ROW_LABELS[y]}
            </div>
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {row.map((cell, x) => (
                <Cell
                  key={`cell-${x}-${y}`}
                  state={cell.state}
                  isPlayerBoard={isPlayerBoard}
                  isLastShot={lastShot?.x === x && lastShot?.y === y}
                  disabled={disabled || !onCellClick}
                  label={`${ROW_LABELS[y]}${x + 1} ${cell.state}`}
                  onClick={() => onCellClick && onCellClick(x, y)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
