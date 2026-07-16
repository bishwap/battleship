import { BOARD_SIZE, SHIPS } from './constants';
import type { Board, Cell, Position, ShipStatus, ShipType, ShotResult } from './types';

export function createEmptyCells(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ state: 'empty' } as Cell))
  );
}

export function createEmptyBoard(): Board {
  return { cells: createEmptyCells(), ships: [] };
}

export function canPlaceShip(
  cells: Cell[][],
  ship: ShipType,
  x: number,
  y: number,
  orientation: 'horizontal' | 'vertical',
  ignoreShipId?: string
): boolean {
  for (let i = 0; i < ship.length; i++) {
    const cx = orientation === 'horizontal' ? x + i : x;
    const cy = orientation === 'horizontal' ? y : y + i;

    if (cx < 0 || cx >= BOARD_SIZE || cy < 0 || cy >= BOARD_SIZE) {
      return false;
    }

    const cell = cells[cy][cx];
    if (cell.state !== 'empty' && cell.shipId !== ignoreShipId) {
      return false;
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

export function placeShips(ships: ShipType[] = SHIPS): Board {
  let attempts = 0;
  while (attempts < 1000) {
    const cells = createEmptyCells();
    const placedShips: ShipStatus[] = [];
    let success = true;

    for (const ship of ships) {
      let placed = false;
      let inner = 0;
      while (inner < 1000) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const maxX = orientation === 'horizontal' ? BOARD_SIZE - ship.length : BOARD_SIZE;
        const maxY = orientation === 'horizontal' ? BOARD_SIZE : BOARD_SIZE - ship.length;
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

export function allShipsSunk(ships: ShipStatus[]): boolean {
  return ships.length > 0 && ships.every((s) => s.sunk);
}

export function isValidTarget(board: Board, x: number, y: number): boolean {
  if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return false;
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

  if (ship.hits === ship.length) {
    ship.sunk = true;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
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
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (isValidTarget(board, x, y)) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}
