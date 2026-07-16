import { useEffect, useRef, useState } from 'react';
import { BOARD_SIZE, SHIPS } from '../lib/constants';
import { canPlaceShip } from '../lib/gameLogic';
import type { Board as BoardType, Position, SinkingShip } from '../lib/types';
import { Cell } from './Cell';
import { Ship } from './Ship';

type BoardProps = {
  board: BoardType;
  isPlayerBoard: boolean;
  onCellClick?: (x: number, y: number) => void;
  onCellDrop?: (shipId: string, orientation: 'horizontal' | 'vertical', x: number, y: number) => void;
  disabled: boolean;
  lastShot: Position | null;
  title: string;
  sinkingShip?: SinkingShip | null;
  selectedShip?: string | null;
  selectedOrientation?: 'horizontal' | 'vertical';
};

const ROW_LABELS = 'ABCDEFGHIJ'.split('');

export function Board({
  board,
  isPlayerBoard,
  onCellClick,
  onCellDrop,
  disabled,
  lastShot,
  title,
  sinkingShip,
  selectedShip,
  selectedOrientation = 'horizontal',
}: BoardProps) {
  const isInteractive = !disabled && !!onCellClick;
  const [activeCell, setActiveCell] = useState<{ x: number; y: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[][]>(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );

  useEffect(() => {
    if (isInteractive && !activeCell) {
      setActiveCell({ x: 0, y: 0 });
    }
    if (!isInteractive) {
      setActiveCell(null);
    }
  }, [isInteractive, activeCell]);

  useEffect(() => {
    if (!activeCell) return;
    const el = cellRefs.current[activeCell.y]?.[activeCell.x];
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
  }, [activeCell]);

  const previewCell = hoverCell || activeCell;

  const preview = (() => {
    if (!selectedShip || !previewCell || !isInteractive) return null;
    const ship = SHIPS.find((s) => s.id === selectedShip);
    if (!ship) return null;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < ship.length; i++) {
      const x = previewCell.x + (selectedOrientation === 'vertical' ? 0 : i);
      const y = previewCell.y + (selectedOrientation === 'vertical' ? i : 0);
      if (x < BOARD_SIZE && y < BOARD_SIZE) {
        positions.push({ x, y });
      }
    }
    const valid = canPlaceShip(board.cells, ship, previewCell.x, previewCell.y, selectedOrientation);
    return { positions, valid };
  })();

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, x: number, y: number) => {
    const moves: Record<string, { dx: number; dy: number }> = {
      ArrowUp: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setActiveCell({
      x: Math.max(0, Math.min(BOARD_SIZE - 1, x + move.dx)),
      y: Math.max(0, Math.min(BOARD_SIZE - 1, y + move.dy)),
    });
  };

  const shipData = (() => {
    const data = new Map<string, { orientation: 'horizontal' | 'vertical'; length: number; positions: { x: number; y: number }[] }>();
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const shipId = board.cells[y][x].shipId;
        if (!shipId) continue;
        if (!data.has(shipId)) {
          const ship = board.ships.find((s) => s.id === shipId);
          data.set(shipId, { orientation: 'horizontal', length: ship?.length ?? 1, positions: [] });
        }
        data.get(shipId)!.positions.push({ x, y });
      }
    }
    for (const [, meta] of data) {
      const xs = meta.positions.map((p) => p.x);
      const ys = meta.positions.map((p) => p.y);
      meta.orientation = Math.max(...xs) > Math.min(...xs) ? 'horizontal' : 'vertical';
      if (meta.orientation === 'vertical' && Math.max(...ys) === Math.min(...ys)) {
        meta.orientation = 'horizontal';
      }
    }
    return data;
  })();

  const shipOverlays = isPlayerBoard
    ? Array.from(shipData.entries()).map(([shipId, meta]) => {
        const ship = board.ships.find((s) => s.id === shipId);
        if (!ship || ship.sunk) return null;
        const minX = Math.min(...meta.positions.map((p) => p.x));
        const maxX = Math.max(...meta.positions.map((p) => p.x));
        const minY = Math.min(...meta.positions.map((p) => p.y));
        const maxY = Math.max(...meta.positions.map((p) => p.y));
        return (
          <div
            key={`ship-${shipId}`}
            className="pointer-events-none z-10"
            style={{
              gridColumn: `${minX + 2} / ${maxX + 3}`,
              gridRow: `${minY + 2} / ${maxY + 3}`,
            }}
          >
            <Ship
              id={shipId}
              length={ship.length}
              orientation={meta.orientation}
              state={ship.hits > 0 ? 'hit' : 'intact'}
              className="w-full h-full pixel-art"
            />
          </div>
        );
      })
    : [];

  const sinkingOverlay = (() => {
    if (!isPlayerBoard || !sinkingShip) return null;
    const meta = shipData.get(sinkingShip.shipId);
    if (!meta) return null;
    const minX = Math.min(...meta.positions.map((p) => p.x));
    const maxX = Math.max(...meta.positions.map((p) => p.x));
    const minY = Math.min(...meta.positions.map((p) => p.y));
    const maxY = Math.max(...meta.positions.map((p) => p.y));
    const ship = board.ships.find((s) => s.id === sinkingShip.shipId);
    return (
      <div
        key={`sink-${sinkingShip.shipId}`}
        className="pointer-events-none z-30 animate-sink"
        style={{
          gridColumn: `${minX + 2} / ${maxX + 3}`,
          gridRow: `${minY + 2} / ${maxY + 3}`,
        }}
      >
        <Ship
          id={sinkingShip.shipId}
          length={ship?.length}
          orientation={meta.orientation}
          state="sunk"
          className="w-full h-full pixel-art"
        />
      </div>
    );
  })();

  const themeClass = isPlayerBoard
    ? 'bg-ocean-light/40 border-grid'
    : 'bg-red-900/15 border-red-900/50';
  const titleClass = isPlayerBoard ? 'text-accent' : 'text-hit-glow';

  return (
    <div className={`flex flex-col items-center w-full rounded-lg p-2 sm:p-4 ${themeClass}`}>
      <h3 className={`text-sm sm:text-base font-bold tracking-wider mb-2 sm:mb-3 uppercase ${titleClass}`}>{title}</h3>
      <div className="w-full overflow-x-auto">
        <div
          className="grid w-full min-w-max gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: 'auto repeat(10, minmax(44px, 1fr))',
            gridTemplateRows: 'auto repeat(10, auto)',
          }}
          onMouseLeave={() => setHoverCell(null)}
        >
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }} />
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div
            key={`col-${i}`}
            style={{ gridColumn: `${i + 2} / ${i + 3}`, gridRow: '1 / 2' }}
            className="text-center text-radar-glow text-[10px] sm:text-xs font-bold"
          >
            {i + 1}
          </div>
        ))}
        {board.cells.map((_, y) => (
          <div
            key={`row-label-${y}`}
            style={{ gridColumn: '1 / 2', gridRow: `${y + 2} / ${y + 3}` }}
            className="flex items-center justify-center w-5 sm:w-6 text-radar-glow text-[10px] sm:text-xs font-bold"
          >
            {ROW_LABELS[y]}
          </div>
        ))}
        {board.cells.map((row, y) =>
          row.map((cell, x) => (
            <Cell
              key={`cell-${x}-${y}`}
              ref={(el) => {
                cellRefs.current[y][x] = el;
              }}
              state={cell.state}
              isPlayerBoard={isPlayerBoard}
              isLastShot={lastShot?.x === x && lastShot?.y === y}
              disabled={disabled || !onCellClick}
              label={`${ROW_LABELS[y]}${x + 1} ${isPlayerBoard || cell.state !== 'ship' ? cell.state : 'empty'}`}
              tabIndex={activeCell?.x === x && activeCell?.y === y ? 0 : -1}
              onClick={() => onCellClick && onCellClick(x, y)}
              onFocus={() => setActiveCell({ x, y })}
              onKeyDown={(e) => handleCellKeyDown(e, x, y)}
              onMouseEnter={() => setHoverCell({ x, y })}
              isPreview={preview?.positions.some((p) => p.x === x && p.y === y) ?? false}
              isValid={preview?.valid ?? false}
              onDrop={
                onCellDrop
                  ? (e) => {
                      const data = e.dataTransfer.getData('text/plain');
                      if (!data) return;
                      try {
                        const parsed = JSON.parse(data) as { shipId?: string; orientation?: 'horizontal' | 'vertical' };
                        if (parsed.shipId && parsed.orientation) {
                          onCellDrop(parsed.shipId, parsed.orientation, x, y);
                        }
                      } catch {
                        // ignore bad drag data
                      }
                    }
                  : undefined
              }
              style={{ gridColumn: `${x + 2} / ${x + 3}`, gridRow: `${y + 2} / ${y + 3}` }}
            />
          ))
        )}
        {shipOverlays}
        {sinkingOverlay}
        </div>
      </div>
    </div>
  );
}
