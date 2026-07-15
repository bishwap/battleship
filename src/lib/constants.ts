import type { ShipType } from './types';

export const BOARD_SIZE = 10;

export const SHIPS: ShipType[] = [
  { id: 'carrier', name: 'Carrier', length: 5 },
  { id: 'battleship', name: 'Battleship', length: 4 },
  { id: 'cruiser', name: 'Cruiser', length: 3 },
  { id: 'submarine', name: 'Submarine', length: 3 },
  { id: 'destroyer', name: 'Destroyer', length: 2 },
];

export const AI_COMMANDER = 'Admiral Intelligence (AI)';
export const DEFAULT_PLAYER_COMMANDER = 'Admiral';
export let PLAYER_COMMANDER = DEFAULT_PLAYER_COMMANDER;

export function setPlayerCommander(name: string) {
  PLAYER_COMMANDER = name;
}
