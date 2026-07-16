import { BOARD_SIZE } from '../lib/constants';
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
}: BoardProps) {
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
      <div
        className="grid w-full gap-1 sm:gap-1.5"
        style={{
          gridTemplateColumns: 'auto repeat(10, minmax(0, 1fr))',
          gridTemplateRows: 'auto repeat(10, auto)',
        }}
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
              state={cell.state}
              isPlayerBoard={isPlayerBoard}
              isLastShot={lastShot?.x === x && lastShot?.y === y}
              disabled={disabled || !onCellClick}
              label={`${ROW_LABELS[y]}${x + 1} ${cell.state}`}
              onClick={() => onCellClick && onCellClick(x, y)}
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
  );
}
