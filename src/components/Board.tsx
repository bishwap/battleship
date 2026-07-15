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
    <div className="flex flex-col items-center w-full min-w-[360px] sm:min-w-[420px] md:min-w-[480px] max-w-[560px] bg-ocean-light/40 border border-grid rounded-lg p-3 sm:p-4">
      <h3 className="text-accent text-base font-bold tracking-wider mb-3 uppercase">{title}</h3>
      <div className="grid grid-cols-[auto_1fr] gap-2 w-full">
        <div className="w-6" />
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={`col-${i}`} className="text-center text-muted text-xs">
              {i + 1}
            </div>
          ))}
        </div>
        {board.cells.map((row, y) => (
          <div key={`row-${y}`} className="grid grid-cols-[auto_1fr] gap-2">
            <div className="flex items-center justify-center w-6 text-muted text-xs">
              {ROW_LABELS[y]}
            </div>
            <div className="grid grid-cols-10 gap-1.5">
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
