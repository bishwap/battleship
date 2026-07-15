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
  const shipMeta = (() => {
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
      meta.orientation = Math.max(...xs) > Math.min(...xs) ? 'horizontal' : 'vertical';
    }
    const segmentMap = new Map<string, { orientation: 'horizontal' | 'vertical'; length: number; map: Map<string, number> }>();
    for (const [shipId, meta] of data) {
      const key = meta.orientation === 'horizontal' ? 'x' : 'y';
      const sorted = [...meta.positions].sort((a, b) => a[key] - b[key]);
      const map = new Map<string, number>();
      sorted.forEach((pos, idx) => map.set(`${pos.x},${pos.y}`, idx));
      segmentMap.set(shipId, { orientation: meta.orientation, length: meta.length, map });
    }
    return segmentMap;
  })();

  const shipOverlay = (() => {
    if (!isPlayerBoard || !sinkingShip) return null;
    const positions: { x: number; y: number }[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board.cells[y][x].shipId === sinkingShip.shipId) {
          positions.push({ x, y });
        }
      }
    }
    if (positions.length === 0) return null;

    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));
    const orientation = maxX > minX ? 'horizontal' : 'vertical';

    return (
      <div
        key={`sink-${sinkingShip.shipId}`}
        className="pointer-events-none z-20 animate-sink"
        style={{
          gridColumn: `${minX + 2} / ${maxX + 3}`,
          gridRow: `${minY + 2} / ${maxY + 3}`,
        }}
      >
        <Ship id={sinkingShip.shipId} orientation={orientation} state="sunk" className="w-full h-full" />
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
          row.map((cell, x) => {
            const meta = cell.shipId ? shipMeta.get(cell.shipId) : null;
            return (
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
                shipId={cell.shipId}
                orientation={meta?.orientation}
                segment={meta?.map.get(`${x},${y}`)}
                length={meta?.length}
              />
            );
          })
        )}
        {shipOverlay}
      </div>
    </div>
  );
}
