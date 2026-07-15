import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AI_COMMANDER,
  DEFAULT_PLAYER_COMMANDER,
  PLAYER_COMMANDER,
  setPlayerCommander,
  SHIPS,
} from '../lib/constants';
import { createAiMemory, chooseAiShot, updateAiMemory } from '../lib/ai';
import {
  allShipsSunk,
  canPlaceShip,
  createEmptyBoard,
  fireAt,
  placeShipOnBoard,
  placeShips,
  removeShip,
} from '../lib/gameLogic';
import {
  aiHitMessage,
  aiMissMessage,
  aiSunkMessage,
  aiWinMessage,
  createIntroMessages,
  playerHitMessage,
  playerMissMessage,
  playerSunkMessage,
  playerWinMessage,
} from '../lib/storyEngine';
import type { GameState } from '../lib/types';

const STORAGE_NAME_KEY = 'battleshipz-admiral';
const STORAGE_TALLY_KEY = 'battleshipz-tally';

function loadName(): string {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_COMMANDER;
  return localStorage.getItem(STORAGE_NAME_KEY) || DEFAULT_PLAYER_COMMANDER;
}

function loadTally(): { wins: number; losses: number } {
  if (typeof window === 'undefined') return { wins: 0, losses: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_TALLY_KEY);
    return raw ? JSON.parse(raw) : { wins: 0, losses: 0 };
  } catch {
    return { wins: 0, losses: 0 };
  }
}

function saveTally(tally: { wins: number; losses: number }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_TALLY_KEY, JSON.stringify(tally));
}

function createInitialGame(): GameState {
  const admiralName = loadName();
  setPlayerCommander(admiralName);
  const playerBoard = createEmptyBoard();
  const enemyBoard = createEmptyBoard();
  return {
    phase: 'setup',
    playerBoard,
    enemyBoard,
    turn: 'player',
    gameOver: false,
    winner: null,
    chat: createIntroMessages(),
    aiMemory: createAiMemory(),
    status: `Place your fleet, ${admiralName}.`,
    shakeSide: null,
    lastShot: null,
    sinkingShip: null,
    admiralName,
    tally: loadTally(),
  };
}

export function useGame() {
  const [game, setGame] = useState<GameState>(createInitialGame);
  const tallyProcessed = useRef<'player' | 'ai' | null>(null);

  const startGame = useCallback(() => {
    tallyProcessed.current = null;
    setGame((prev) => ({
      ...prev,
      phase: 'setup',
      playerBoard: createEmptyBoard(),
      enemyBoard: createEmptyBoard(),
      turn: 'player',
      gameOver: false,
      winner: null,
      chat: createIntroMessages(),
      aiMemory: createAiMemory(),
      status: `Place your fleet, ${prev.admiralName}.`,
      shakeSide: null,
      lastShot: null,
      sinkingShip: null,
    }));
  }, []);

  const setAdmiralName = useCallback((name: string) => {
    const trimmed = name.trim() || DEFAULT_PLAYER_COMMANDER;
    setPlayerCommander(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_NAME_KEY, trimmed);
    }
    setGame((prev) => ({
      ...prev,
      admiralName: trimmed,
      status: prev.phase === 'setup' ? `Place your fleet, ${trimmed}.` : prev.status,
      chat: prev.chat.map((m) =>
        m.speaker === 'player' ? { ...m, text: m.text.replace(prev.admiralName, trimmed) } : m
      ),
    }));
  }, []);

  const placeShip = useCallback(
    (shipId: string, x: number, y: number, orientation: 'horizontal' | 'vertical') => {
      setGame((prev) => {
        if (prev.phase !== 'setup') return prev;
        const ship = SHIPS.find((s) => s.id === shipId);
        if (!ship) return prev;
        if (canPlaceShip(prev.playerBoard.cells, ship, x, y, orientation)) {
          const playerBoard = placeShipOnBoard(prev.playerBoard, ship, x, y, orientation);
          const allPlaced = playerBoard.ships.length === SHIPS.length;
          return {
            ...prev,
            playerBoard,
            status: allPlaced ? 'Fleet ready. Press Start Battle.' : `Place your fleet, ${prev.admiralName}.`,
          };
        }
        return prev;
      });
    },
    []
  );

  const removeShipFromBoard = useCallback((x: number, y: number) => {
    setGame((prev) => {
      if (prev.phase !== 'setup') return prev;
      const shipId = prev.playerBoard.cells[y]?.[x]?.shipId;
      if (!shipId) return prev;
      const playerBoard = removeShip(prev.playerBoard, shipId);
      return {
        ...prev,
        playerBoard,
        status: `Place your fleet, ${prev.admiralName}.`,
      };
    });
  }, []);

  const randomizePlacement = useCallback(() => {
    setGame((prev) => {
      if (prev.phase !== 'setup') return prev;
      return {
        ...prev,
        playerBoard: placeShips(SHIPS),
        status: 'Fleet ready. Press Start Battle.',
      };
    });
  }, []);

  const beginBattle = useCallback(() => {
    setGame((prev) => {
      if (prev.phase !== 'setup' || prev.playerBoard.ships.length !== SHIPS.length) {
        return { ...prev, status: 'Place all ships first, Admiral.' };
      }
      return {
        ...prev,
        phase: 'playing',
        enemyBoard: placeShips(SHIPS),
        status: `${prev.admiralName}'s turn — fire at the enemy fleet.`,
      };
    });
  }, []);

  const playerFire = useCallback((x: number, y: number) => {
    setGame((prev) => {
      if (prev.phase !== 'playing' || prev.gameOver || prev.turn !== 'player') return prev;

      const { board: newEnemyBoard, result } = fireAt(prev.enemyBoard, x, y);
      if (result.type === 'miss' && prev.enemyBoard.cells[y][x].state !== 'miss') {
        const playerShips = prev.playerBoard.ships;
        const aiShips = newEnemyBoard.ships;
        let chat = playerMissMessage(prev.chat, playerShips, aiShips);
        const status = `${AI_COMMANDER} is targeting your fleet...`;
        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          turn: 'ai' as const,
          chat,
          status,
          shakeSide: null,
          lastShot: { x, y, side: 'player' as const },
        };
      }

      if (result.type === 'hit') {
        const playerShips = prev.playerBoard.ships;
        const aiShips = newEnemyBoard.ships;
        let chat = playerHitMessage(prev.chat, playerShips, aiShips);
        if (allShipsSunk(aiShips)) {
          chat = playerSunkMessage(chat, playerShips, aiShips, result.shipName ?? 'ship');
          chat = playerWinMessage(chat);
          return {
            ...prev,
            enemyBoard: newEnemyBoard,
            gameOver: true,
            winner: 'player' as const,
            chat,
            status: 'Victory! All enemy ships destroyed.',
            lastShot: { x, y, side: 'player' as const },
          };
        }
        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          chat,
          status: `Hit! Fire again, ${PLAYER_COMMANDER}.`,
          shakeSide: 'ai' as const,
          lastShot: { x, y, side: 'player' as const },
        };
      }

      if (result.type === 'sunk') {
        const playerShips = prev.playerBoard.ships;
        const aiShips = newEnemyBoard.ships;
        let chat = playerSunkMessage(prev.chat, playerShips, aiShips, result.shipName ?? 'ship');
        const sinkingShip = result.shipId ? { side: 'ai' as const, shipId: result.shipId } : null;
        if (allShipsSunk(aiShips)) {
          chat = playerWinMessage(chat);
          return {
            ...prev,
            enemyBoard: newEnemyBoard,
            gameOver: true,
            winner: 'player' as const,
            chat,
            status: 'Victory! All enemy ships destroyed.',
            lastShot: { x, y, side: 'player' as const },
            sinkingShip,
          };
        }
        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          chat,
          status: `Sunk! ${result.shipName} destroyed. Fire again.`,
          shakeSide: 'ai' as const,
          lastShot: { x, y, side: 'player' as const },
          sinkingShip,
        };
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (game.phase !== 'playing' || game.turn !== 'ai' || game.gameOver) return;

    const timer = setTimeout(() => {
      setGame((prev) => {
        const { shot, memory: memoryAfterChoose } = chooseAiShot(prev.playerBoard, prev.aiMemory);
        const { board: newPlayerBoard, result } = fireAt(prev.playerBoard, shot.x, shot.y);
        const newAiMemory = updateAiMemory(memoryAfterChoose, shot, result);

        if (result.type === 'miss') {
          const playerShips = newPlayerBoard.ships;
          const aiShips = prev.enemyBoard.ships;
          const chat = aiMissMessage(prev.chat, playerShips, aiShips);
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            aiMemory: newAiMemory,
            turn: 'player' as const,
            chat,
            status: `${PLAYER_COMMANDER}'s turn — fire at the enemy fleet.`,
            shakeSide: null,
            lastShot: { x: shot.x, y: shot.y, side: 'ai' as const },
          };
        }

        if (result.type === 'hit') {
          const playerShips = newPlayerBoard.ships;
          const aiShips = prev.enemyBoard.ships;
          let chat = aiHitMessage(prev.chat, playerShips, aiShips);
          if (allShipsSunk(playerShips)) {
            chat = aiSunkMessage(chat, playerShips, aiShips, result.shipName ?? 'ship');
            chat = aiWinMessage(chat);
            return {
              ...prev,
              playerBoard: newPlayerBoard,
              aiMemory: newAiMemory,
              gameOver: true,
              winner: 'ai' as const,
              chat,
              status: 'Defeat. Your fleet has been destroyed.',
              lastShot: { x: shot.x, y: shot.y, side: 'ai' as const },
            };
          }
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            aiMemory: newAiMemory,
            chat,
            status: `${AI_COMMANDER} hit your ship. Re-engaging...`,
            shakeSide: 'player' as const,
            lastShot: { x: shot.x, y: shot.y, side: 'ai' as const },
          };
        }

        if (result.type === 'sunk') {
          const playerShips = newPlayerBoard.ships;
          const aiShips = prev.enemyBoard.ships;
          let chat = aiSunkMessage(prev.chat, playerShips, aiShips, result.shipName ?? 'ship');
          const sinkingShip = result.shipId ? { side: 'player' as const, shipId: result.shipId } : null;
          if (allShipsSunk(playerShips)) {
            chat = aiWinMessage(chat);
            return {
              ...prev,
              playerBoard: newPlayerBoard,
              aiMemory: newAiMemory,
              gameOver: true,
              winner: 'ai' as const,
              chat,
              status: 'Defeat. Your fleet has been destroyed.',
              lastShot: { x: shot.x, y: shot.y, side: 'ai' as const },
              sinkingShip,
            };
          }
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            aiMemory: newAiMemory,
            chat,
            status: `${AI_COMMANDER} sunk your ${result.shipName}. Retaliating...`,
            shakeSide: 'player' as const,
            lastShot: { x: shot.x, y: shot.y, side: 'ai' as const },
            sinkingShip,
          };
        }

        return prev;
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [game.phase, game.turn, game.gameOver, game.aiMemory]);

  useEffect(() => {
    if (!game.gameOver || !game.winner || tallyProcessed.current === game.winner) return;
    const key = game.winner === 'player' ? 'wins' : 'losses';
    const newTally = { ...game.tally, [key]: game.tally[key] + 1 };
    saveTally(newTally);
    setGame((prev) => ({ ...prev, tally: newTally }));
    tallyProcessed.current = game.winner;
  }, [game.gameOver, game.winner]);

  useEffect(() => {
    if (!game.shakeSide) return;
    const timer = setTimeout(() => setGame((prev) => ({ ...prev, shakeSide: null })), 500);
    return () => clearTimeout(timer);
  }, [game.shakeSide]);

  useEffect(() => {
    if (!game.lastShot) return;
    const timer = setTimeout(() => setGame((prev) => ({ ...prev, lastShot: null })), 900);
    return () => clearTimeout(timer);
  }, [game.lastShot]);

  useEffect(() => {
    if (!game.sinkingShip) return;
    const timer = setTimeout(() => setGame((prev) => ({ ...prev, sinkingShip: null })), 1200);
    return () => clearTimeout(timer);
  }, [game.sinkingShip]);

  return {
    game,
    playerFire,
    startGame,
    setAdmiralName,
    placeShip,
    removeShipFromBoard,
    randomizePlacement,
    beginBattle,
  };
}
