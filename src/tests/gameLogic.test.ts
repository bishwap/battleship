import { describe, expect, it } from 'vitest';
import { BOARD_SIZE } from '../lib/constants';
import { canPlaceShip, createEmptyBoard, fireAt, placeShip, placeShips } from '../lib/gameLogic';
import type { ShipType } from '../lib/types';

const testShip: ShipType = { id: 'destroyer', name: 'Destroyer', length: 2 };

describe('gameLogic', () => {
  it('creates an empty board', () => {
    const board = createEmptyBoard();
    expect(board.cells.length).toBe(BOARD_SIZE);
    expect(board.cells.every((row) => row.every((cell) => cell.state === 'empty'))).toBe(true);
  });

  it('can place a ship horizontally', () => {
    const board = createEmptyBoard();
    expect(canPlaceShip(board.cells, testShip, 0, 0, 'horizontal')).toBe(true);
    placeShip(board.cells, testShip, 0, 0, 'horizontal');
    expect(board.cells[0][0].state).toBe('ship');
    expect(board.cells[0][1].state).toBe('ship');
    expect(board.cells[0][0].shipId).toBe('destroyer');
  });

  it('can place a ship vertically', () => {
    const board = createEmptyBoard();
    expect(canPlaceShip(board.cells, testShip, 0, 0, 'vertical')).toBe(true);
    placeShip(board.cells, testShip, 0, 0, 'vertical');
    expect(board.cells[0][0].state).toBe('ship');
    expect(board.cells[1][0].state).toBe('ship');
  });

  it('rejects overlapping ships', () => {
    const board = createEmptyBoard();
    placeShip(board.cells, testShip, 0, 0, 'horizontal');
    expect(canPlaceShip(board.cells, testShip, 1, 0, 'horizontal')).toBe(false);
  });

  it('rejects out-of-bounds placement', () => {
    const board = createEmptyBoard();
    expect(canPlaceShip(board.cells, testShip, 9, 0, 'horizontal')).toBe(false);
    expect(canPlaceShip(board.cells, testShip, 0, 9, 'vertical')).toBe(false);
  });

  it('places all ships randomly without overlap', () => {
    const board = placeShips();
    const shipCells = board.cells.flat().filter((cell) => cell.state === 'ship');
    const totalShipLength = [5, 4, 3, 3, 2].reduce((a, b) => a + b, 0);
    expect(shipCells.length).toBe(totalShipLength);
    expect(board.ships.length).toBe(5);
    expect(board.ships.every((s) => !s.sunk)).toBe(true);
  });

  it('reports a miss', () => {
    const board = createEmptyBoard();
    const { result, board: newBoard } = fireAt(board, 0, 0);
    expect(result.type).toBe('miss');
    expect(newBoard.cells[0][0].state).toBe('miss');
  });

  it('reports a hit', () => {
    const board = createEmptyBoard();
    placeShip(board.cells, testShip, 0, 0, 'horizontal');
    board.ships.push({ id: 'destroyer', name: 'Destroyer', length: 2, hits: 0, sunk: false });
    const { result, board: newBoard } = fireAt(board, 0, 0);
    expect(result.type).toBe('hit');
    expect(newBoard.cells[0][0].state).toBe('hit');
    expect(newBoard.ships[0].hits).toBe(1);
  });

  it('reports a sunk ship and marks all its cells', () => {
    let board = createEmptyBoard();
    placeShip(board.cells, testShip, 0, 0, 'horizontal');
    board.ships.push({ id: 'destroyer', name: 'Destroyer', length: 2, hits: 0, sunk: false });
    const { board: boardAfterFirst } = fireAt(board, 0, 0);
    const { result, board: newBoard } = fireAt(boardAfterFirst, 1, 0);
    expect(result.type).toBe('sunk');
    expect(newBoard.ships[0].sunk).toBe(true);
    expect(newBoard.cells[0][0].state).toBe('sunk');
    expect(newBoard.cells[0][1].state).toBe('sunk');
  });
});
