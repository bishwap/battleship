import { describe, expect, it } from 'vitest';
import { BOARD_SIZE } from '../lib/constants';
import { createAiMemory, chooseAiShot, updateAiMemory } from '../lib/ai';
import { createEmptyBoard, fireAt, placeShip } from '../lib/gameLogic';
import type { ShipType } from '../lib/types';

describe('ai', () => {
  it('does not fire the same cell twice', () => {
    const board = createEmptyBoard();
    const memory = createAiMemory();
    const shots = new Set<string>();

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      const { shot } = chooseAiShot(board, memory);
      const key = `${shot.x},${shot.y}`;
      expect(shots.has(key)).toBe(false);
      shots.add(key);
      const { board: newBoard } = fireAt(board, shot.x, shot.y);
      board.cells = newBoard.cells;
      board.ships = newBoard.ships;
    }
  });

  it('targets adjacent cells after a hit', () => {
    const board = createEmptyBoard();
    const ship: ShipType = { id: 'destroyer', name: 'Destroyer', length: 2 };
    placeShip(board.cells, ship, 0, 0, 'horizontal');
    board.ships.push({ id: 'destroyer', name: 'Destroyer', length: 2, hits: 0, sunk: false });

    let memory = createAiMemory();
    // Force the AI to hit (0,0) by placing the first shot there
    const { result: firstResult, board: boardAfterFirst } = fireAt(board, 0, 0);
    expect(firstResult.type).toBe('hit');
    memory = updateAiMemory(memory, { x: 0, y: 0 }, firstResult);

    const { shot: secondShot } = chooseAiShot(boardAfterFirst, memory);
    const adjacentToHit =
      (Math.abs(secondShot.x - 0) + Math.abs(secondShot.y - 0) === 1);
    expect(adjacentToHit).toBe(true);
  });

  it('clears hits for a sunk ship', () => {
    const board = createEmptyBoard();
    const ship: ShipType = { id: 'destroyer', name: 'Destroyer', length: 2 };
    placeShip(board.cells, ship, 0, 0, 'horizontal');
    board.ships.push({ id: 'destroyer', name: 'Destroyer', length: 2, hits: 0, sunk: false });

    let memory = createAiMemory();
    const { result: r1, board: b1 } = fireAt(board, 0, 0);
    memory = updateAiMemory(memory, { x: 0, y: 0 }, r1);
    const { result: r2, board: b2 } = fireAt(b1, 1, 0);
    memory = updateAiMemory(memory, { x: 1, y: 0 }, r2);

    expect(r2.type).toBe('sunk');
    expect(memory.hits.length).toBe(0);
    expect(b2.cells[0][0].state).toBe('sunk');
    expect(b2.cells[0][1].state).toBe('sunk');
  });
});
