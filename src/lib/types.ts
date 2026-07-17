export type Position = { x: number; y: number };

export type ShipType = {
  id: string;
  name: string;
  length: number;
};

export type ShipStatus = {
  id: string;
  name: string;
  length: number;
  hits: number;
  sunk: boolean;
};

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export type Cell = {
  state: CellState;
  shipId?: string;
};

export type Board = {
  cells: Cell[][];
  ships: ShipStatus[];
};

export type ShotResult = {
  type: 'miss' | 'hit' | 'sunk';
  shipId?: string;
  shipName?: string;
};

export type AiMemory = {
  hits: (Position & { shipId: string })[];
  huntQueue: Position[];
};

export type ChatMessage = {
  id: string;
  speaker: 'player' | 'ai' | 'system';
  text: string;
  type: 'intro' | 'miss' | 'hit' | 'sunk' | 'win' | 'lose' | 'start';
};

export type SinkingShip = {
  side: 'player' | 'ai';
  shipId: string;
};

export type SideStats = {
  shots: number;
  hits: number;
  misses: number;
  sunk: number;
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = {
  phase: 'setup' | 'playing';
  playerBoard: Board;
  enemyBoard: Board;
  turn: 'player' | 'ai';
  gameOver: boolean;
  winner: 'player' | 'ai' | null;
  chat: ChatMessage[];
  aiMemory: AiMemory;
  status: string;
  shakeSide: 'player' | 'ai' | null;
  lastShot: { x: number; y: number; side: 'player' | 'ai'; result: 'miss' | 'hit' | 'sunk' } | null;
  sinkingShip: SinkingShip | null;
  admiralName: string;
  tally: { wins: number; losses: number };
  placementHistory: string[];
  stats: { player: SideStats; ai: SideStats };
  consecutiveMisses: number;
  difficulty: Difficulty;
  shipSet: ShipType[];
};
