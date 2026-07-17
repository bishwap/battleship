import { useEffect, useRef, useState } from 'react';
import { canPlaceShip } from '../lib/gameLogic';
import type { Board as BoardType, Position, ShipType, SinkingShip } from '../lib/types';
import { Cell } from './Cell';
import { Ship } from './Ship';

type BoardProps = {
  board: BoardType;
  isPlayerBoard: boolean;
  shipTypes?: ShipType[];
  onCellClick?: (x: number, y: number) => void;
  onCellDrop?: (shipId: string, orientation: 'horizontal' | 'vertical', x: number, y: number) => void;
  onSelectShip?: (shipId: string, orientation: 'horizontal' | 'vertical') => void;
  disabled: boolean;
  lastShot: Position | null;
  title: string;
  sinkingShip?: SinkingShip | null;
  selectedShip?: string | null;
  selectedOrientation?: 'horizontal' | 'vertical';
};

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function Board({
  board,
  isPlayerBoard,
  shipTypes = [],
  onCellClick,
  onCellDrop,
  onSelectShip,
  disabled,
  lastShot,
  title,
  sinkingShip,
  selectedShip,
  selectedOrientation = 'horizontal',
}: BoardProps) {
  const size = board.cells.length;
  const isInteractive = !disabled && !!onCellClick;
  const [activeCell, setActiveCell] = useState<{ x: number; y: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const cellRefs = useRef<(HTMLButtonElement | null)[][]>(
    Array.from({ length: size }, () => Array(size).fill(null))
  );

  useEffect(() => {
    cellRefs.current = Array.from({ length: size }, () => Array(size).fill(null));
    if (isInteractive) setActiveCell({ x: 0, y: 0 });
  }, [size, isInteractive]);

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
    const ship = shipTypes.find((s) => s.id === selectedShip);
    if (!ship) return null;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < ship.length; i++) {
      const x = previewCell.x + (selectedOrientation === 'vertical' ? 0 : i);
      const y = previewCell.y + (selectedOrientation === 'vertical' ? i : 0);
      if (x < size && y < size) {
        positions.push({ x, y });
      }
    }
    const valid = canPlaceShip(board.cells, ship, previewCell.x, previewCell.y, selectedOrientation, selectedShip);
    return { positions, valid };
  })();

  const handleCellClick = (x: number, y: number) => {
    if (draggingRef.current) return;
    onCellClick?.(x, y);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, x: number, y: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCellClick?.(x, y);
      return;
    }

    const moves: Record<string, { dx: number; dy: number }> = {
      ArrowUp: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    let nx = x + move.dx;
    let ny = y + move.dy;
    while (nx >= 0 && nx < size && ny >= 0 && ny < size) {
      const el = cellRefs.current[ny]?.[nx];
      if (el && !el.disabled) break;
      nx += move.dx;
      ny += move.dy;
    }
    nx = Math.max(0, Math.min(size - 1, nx));
    ny = Math.max(0, Math.min(size - 1, ny));
    setActiveCell({ x: nx, y: ny });
  };

  const shipData = (() => {
    const data = new Map<string, { orientation: 'horizontal' | 'vertical'; length: number; positions: { x: number; y: number }[] }>();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
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
              state="intact"
              className="w-full h-full pixel-art"
            />
          </div>
        );
      })
    : [];

  const sinkingOverlay = (() => {
    if (!sinkingShip) return null;
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
    <div className={`flex flex-col items-center w-full max-w-[65vh] mx-auto rounded-lg p-2 sm:p-4 ${themeClass}`}>
      <h3 className={`text-sm sm:text-base font-bold tracking-wider mb-2 sm:mb-3 uppercase ${titleClass}`}>{title}</h3>
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        <div
          className="absolute inset-0 grid w-full h-full min-w-0 gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${size + 1}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size + 1}, minmax(0, 1fr))`,
          }}
          onMouseLeave={() => setHoverCell(null)}
        >
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }} />
        {Array.from({ length: size }, (_, i) => (
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
          row.map((cell, x) => {
            const cellDisabled = disabled || !onCellClick || cell.state === 'hit' || cell.state === 'miss' || cell.state === 'sunk';
            const shipMeta = cell.shipId ? shipData.get(cell.shipId) : null;
            return (
            <Cell
              key={`cell-${x}-${y}`}
              ref={(el) => {
                cellRefs.current[y][x] = el;
              }}
              state={cell.state}
              isPlayerBoard={isPlayerBoard}
              isLastShot={lastShot?.x === x && lastShot?.y === y}
              disabled={cellDisabled}
              isSelected={isPlayerBoard && cell.shipId === selectedShip}
              label={`${ROW_LABELS[y]}${x + 1} ${isPlayerBoard || cell.state !== 'ship' ? cell.state : 'empty'}`}
              tabIndex={activeCell?.x === x && activeCell?.y === y && !cellDisabled ? 0 : -1}
              onClick={() => handleCellClick(x, y)}
              onFocus={() => setActiveCell({ x, y })}
              onKeyDown={(e) => handleCellKeyDown(e, x, y)}
              onMouseEnter={() => setHoverCell({ x, y })}
              onDragEnter={() => setHoverCell({ x, y })}
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
                      setTimeout(() => {
                        draggingRef.current = false;
                        setHoverCell(null);
                      }, 0);
                    }
                  : undefined
              }
              onDragStart={
                isPlayerBoard && isInteractive && cell.shipId && shipMeta
                  ? (e) => {
                      e.dataTransfer.setData(
                        'text/plain',
                        JSON.stringify({ shipId: cell.shipId, orientation: shipMeta.orientation })
                      );
                      e.dataTransfer.effectAllowed = 'move';
                      draggingRef.current = true;
                      onSelectShip?.(cell.shipId!, shipMeta.orientation);
                    }
                  : undefined
              }
              onDragEnd={() => {
                setTimeout(() => {
                  draggingRef.current = false;
                  setHoverCell(null);
                }, 0);
              }}
              style={{ gridColumn: `${x + 2} / ${x + 3}`, gridRow: `${y + 2} / ${y + 3}` }}
            />
          )})
        )}
        {shipOverlays}
        {sinkingOverlay}
        </div>
      </div>
    </div>
  );
}
