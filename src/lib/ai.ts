import { DIFFICULTY_CONFIGS, type Difficulty } from './constants';
import { getAvailableShots, isValidTarget } from './gameLogic';
import type { AiMemory, Board, Position } from './types';

function posKey(p: Position): string {
  return `${p.x},${p.y}`;
}

function inBounds(p: Position, size: number): boolean {
  return p.x >= 0 && p.x < size && p.y >= 0 && p.y < size;
}

function getNeighbors(p: Position, size: number): Position[] {
  return [
    { x: p.x, y: p.y - 1 },
    { x: p.x, y: p.y + 1 },
    { x: p.x - 1, y: p.y },
    { x: p.x + 1, y: p.y },
  ].filter((n) => inBounds(n, size));
}

function getAiDifficulty(difficulty: Difficulty): Difficulty {
  return DIFFICULTY_CONFIGS[difficulty]?.ai ?? difficulty;
}

function filterHuntQueue(queue: Position[], board: Board): Position[] {
  const seen = new Set<string>();
  return queue.filter((p) => {
    if (seen.has(posKey(p))) return false;
    seen.add(posKey(p));
    return isValidTarget(board, p.x, p.y);
  });
}

function addNeighborsToQueue(queue: Position[], position: Position, board: Board): Position[] {
  const size = board.cells.length;
  const next = [...queue];
  for (const neighbor of getNeighbors(position, size)) {
    if (isValidTarget(board, neighbor.x, neighbor.y)) {
      next.push(neighbor);
    }
  }
  return next;
}

export function createAiMemory(): AiMemory {
  return { hits: [], huntQueue: [] };
}

function smallestUnsunkShip(board: Board): number {
  return board.ships
    .filter((s) => !s.sunk)
    .reduce((min, s) => Math.min(min, s.length), Infinity);
}

export function chooseAiShot(
  board: Board,
  memory: AiMemory,
  difficulty: Difficulty = 'medium'
): { shot: Position; memory: AiMemory } {
  const aiDifficulty = getAiDifficulty(difficulty);
  let huntQueue = filterHuntQueue(memory.huntQueue, board);

  if (aiDifficulty !== 'easy' && huntQueue.length === 0 && memory.hits.length > 0) {
    for (const hit of memory.hits) {
      huntQueue = addNeighborsToQueue(huntQueue, hit, board);
    }
    huntQueue = filterHuntQueue(huntQueue, board);

    if (memory.hits.length >= 2) {
      const last = memory.hits[memory.hits.length - 1];
      const prev = memory.hits[memory.hits.length - 2];
      const dx = last.x - prev.x;
      const dy = last.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        const priority = { x: last.x + dx, y: last.y + dy };
        if (isValidTarget(board, priority.x, priority.y)) {
          huntQueue = huntQueue.filter((p) => posKey(p) !== posKey(priority));
          huntQueue.unshift(priority);
        }
      }
    }
  }

  let shot: Position;
  if (huntQueue.length > 0) {
    shot = huntQueue.shift()!;
  } else {
    const available = getAvailableShots(board);
    if (aiDifficulty === 'hard') {
      const smallest = smallestUnsunkShip(board);
      const parityShots =
        smallest >= 2
          ? available.filter((p) => (p.x + p.y) % 2 === 0)
          : available;
      shot = parityShots[Math.floor(Math.random() * parityShots.length)] ?? available[0];
    } else {
      shot = available[Math.floor(Math.random() * available.length)];
    }
  }

  return { shot, memory: { ...memory, huntQueue } };
}

export function updateAiMemory(
  memory: AiMemory,
  shot: Position,
  result: { type: 'miss' | 'hit' | 'sunk'; shipId?: string }
): AiMemory {
  if (result.type === 'miss') {
    return { ...memory };
  }

  if (result.type === 'hit' && result.shipId) {
    return {
      ...memory,
      hits: [...memory.hits, { x: shot.x, y: shot.y, shipId: result.shipId }],
    };
  }

  if (result.type === 'sunk' && result.shipId) {
    const remainingHits = memory.hits.filter((h) => h.shipId !== result.shipId);
    return { ...memory, hits: remainingHits };
  }

  return memory;
}
