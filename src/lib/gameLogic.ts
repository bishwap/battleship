import { BOARD_SIZE, SHIPS } from './constants';
import type { Board, Cell, Position, ShipStatus, ShipType, ShotResult } from './types';

export function createEmptyCells(size = BOARD_SIZE): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ state: 'empty' } as Cell))
  );
}

export function createEmptyBoard(size = BOARD_SIZE): Board {
  return { cells: createEmptyCells(size), ships: [] };
}

export function canPlaceShip(
  cells: Cell[][],
  ship: ShipType,
  x: number,
  y: number,
  orientation: 'horizontal' | 'vertical',
  ignoreShipId?: string
): boolean {
  const size = cells.length;
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < ship.length; i++) {
    const cx = orientation === 'horizontal' ? x + i : x;
    const cy = orientation === 'horizontal' ? y : y + i;

    if (cx < 0 || cx >= size || cy < 0 || cy >= size) {
      return false;
    }

    const cell = cells[cy][cx];
    if (cell.state !== 'empty' && cell.shipId !== ignoreShipId) {
      return false;
    }
    positions.push({ x: cx, y: cy });
  }

  // Standard Battleship rule: ships cannot touch, not even diagonally.
  for (const { x: cx, y: cy } of positions) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
        const neighbor = cells[ny][nx];
        if (neighbor.state === 'ship' && neighbor.shipId !== ignoreShipId) {
          return false;
        }
      }
    }
  }

  return true;
}

export function placeShip(
  cells: Cell[][],
  ship: ShipType,
  x: number,
  y: number,
  orientation: 'horizontal' | 'vertical'
): void {
  for (let i = 0; i < ship.length; i++) {
    const cx = orientation === 'horizontal' ? x + i : x;
    const cy = orientation === 'horizontal' ? y : y + i;
    cells[cy][cx] = { state: 'ship', shipId: ship.id };
  }
}

export function cloneBoard(board: Board): Board {
  return {
    cells: board.cells.map((row) => row.map((c) => ({ ...c }))),
    ships: board.ships.map((s) => ({ ...s })),
  };
}

export function removeShip(board: Board, shipId: string): Board {
  const newBoard = cloneBoard(board);
  newBoard.cells = newBoard.cells.map((row) =>
    row.map((c) => (c.shipId === shipId ? { state: 'empty' as const } : c))
  );
  newBoard.ships = newBoard.ships.filter((s) => s.id !== shipId);
  return newBoard;
}

export function placeShipOnBoard(
  board: Board,
  ship: ShipType,
  x: number,
  y: number,
  orientation: 'horizontal' | 'vertical'
): Board {
  let newBoard = removeShip(board, ship.id);
  newBoard = cloneBoard(newBoard);
  placeShip(newBoard.cells, ship, x, y, orientation);
  newBoard.ships.push({ id: ship.id, name: ship.name, length: ship.length, hits: 0, sunk: false });
  return newBoard;
}

export function placeShips(ships: ShipType[] = SHIPS, size = BOARD_SIZE): Board {
  let attempts = 0;
  while (attempts < 1000) {
    const cells = createEmptyCells(size);
    const placedShips: ShipStatus[] = [];
    let success = true;

    for (const ship of ships) {
      let placed = false;
      let inner = 0;
      while (inner < 1000) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const maxX = orientation === 'horizontal' ? size - ship.length : size;
        const maxY = orientation === 'horizontal' ? size : size - ship.length;
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);

        if (canPlaceShip(cells, ship, x, y, orientation)) {
          placeShip(cells, ship, x, y, orientation);
          placedShips.push({ id: ship.id, name: ship.name, length: ship.length, hits: 0, sunk: false });
          placed = true;
          break;
        }
        inner++;
      }

      if (!placed) {
        success = false;
        break;
      }
    }

    if (success) {
      return { cells, ships: placedShips };
    }
    attempts++;
  }

  throw new Error('Failed to place ships after many attempts');
}

export function getShip(board: Board, shipId: string): ShipStatus | undefined {
  return board.ships.find((s) => s.id === shipId);
}

export function getShipBounds(
  board: Board,
  shipId: string
): { x: number; y: number; length: number; orientation: 'horizontal' | 'vertical' } | null {
  const positions: Position[] = [];
  const size = board.cells.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board.cells[y][x].shipId === shipId) {
        positions.push({ x, y });
      }
    }
  }
  if (positions.length === 0) return null;
  const minX = Math.min(...positions.map((p) => p.x));
  const maxX = Math.max(...positions.map((p) => p.x));
  const minY = Math.min(...positions.map((p) => p.y));
  const orientation = maxX > minX ? 'horizontal' : 'vertical';
  return { x: minX, y: minY, length: positions.length, orientation };
}

export function getShipOrientation(board: Board, shipId: string): 'horizontal' | 'vertical' {
  const bounds = getShipBounds(board, shipId);
  return bounds?.orientation ?? 'horizontal';
}

export function allShipsSunk(ships: ShipStatus[]): boolean {
  return ships.length > 0 && ships.every((s) => s.sunk);
}

export function isValidTarget(board: Board, x: number, y: number): boolean {
  const size = board.cells.length;
  if (x < 0 || x >= size || y < 0 || y >= size) return false;
  const state = board.cells[y][x].state;
  return state !== 'hit' && state !== 'miss' && state !== 'sunk';
}

export function fireAt(board: Board, x: number, y: number): { board: Board; result: ShotResult } {
  if (!isValidTarget(board, x, y)) {
    return { board, result: { type: 'miss' } };
  }

  const cell = board.cells[y][x];
  const newCells = board.cells.map((row) => row.map((c) => ({ ...c })));
  const newShips = board.ships.map((s) => ({ ...s }));

  if (cell.state === 'empty') {
    newCells[y][x].state = 'miss';
    return { board: { ...board, cells: newCells, ships: newShips }, result: { type: 'miss' } };
  }

  const ship = newShips.find((s) => s.id === cell.shipId);
  if (!ship) {
    newCells[y][x].state = 'miss';
    return { board: { ...board, cells: newCells, ships: newShips }, result: { type: 'miss' } };
  }

  ship.hits += 1;
  newCells[y][x].state = 'hit';

  const boardSize = newCells.length;
  if (ship.hits === ship.length) {
    ship.sunk = true;
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (newCells[row][col].shipId === ship.id) {
          newCells[row][col].state = 'sunk';
        }
      }
    }
    return {
      board: { ...board, cells: newCells, ships: newShips },
      result: { type: 'sunk', shipId: ship.id, shipName: ship.name },
    };
  }

  return {
    board: { ...board, cells: newCells, ships: newShips },
    result: { type: 'hit', shipId: ship.id, shipName: ship.name },
  };
}

export function getAvailableShots(board: Board): Position[] {
  const positions: Position[] = [];
  const size = board.cells.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isValidTarget(board, x, y)) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}
