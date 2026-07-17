import type { Difficulty, ShipType } from './types';
export type { Difficulty } from './types';

export const BOARD_SIZE = 10;

export const SHIPS: ShipType[] = [
  { id: 'carrier', name: 'Carrier', length: 5 },
  { id: 'battleship', name: 'Battleship', length: 4 },
  { id: 'cruiser', name: 'Cruiser', length: 3 },
  { id: 'submarine', name: 'Submarine', length: 3 },
  { id: 'destroyer', name: 'Destroyer', length: 2 },
];

export type DifficultyConfig = {
  boardSize: number;
  shipSet: ShipType[];
  ai: Difficulty;
  label: string;
  description: string;
};

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    boardSize: 8,
    shipSet: SHIPS,
    ai: 'easy',
    label: 'Easy',
    description: '8×8 sea. The enemy fires wildly at random.',
  },
  medium: {
    boardSize: 10,
    shipSet: SHIPS,
    ai: 'medium',
    label: 'Medium',
    description: '10×10 sea. The enemy hunts its hits.',
  },
  hard: {
    boardSize: 12,
    shipSet: SHIPS,
    ai: 'hard',
    label: 'Hard',
    description: '12×12 sea. The enemy uses parity and focused hunt.',
  },
};

export const AI_COMMANDER = 'Admiral Intelligence (AI)';
export const DEFAULT_PLAYER_COMMANDER = 'Admiral';
export let PLAYER_COMMANDER = DEFAULT_PLAYER_COMMANDER;

export function setPlayerCommander(name: string) {
  PLAYER_COMMANDER = name;
}
