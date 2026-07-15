import { useCallback, useEffect, useState } from 'react';
import { AI_COMMANDER, PLAYER_COMMANDER, SHIPS } from '../lib/constants';
import { createAiMemory, chooseAiShot, updateAiMemory } from '../lib/ai';
import { allShipsSunk, fireAt, placeShips } from '../lib/gameLogic';
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

function createInitialGame(): GameState {
  const playerBoard = placeShips(SHIPS);
  const enemyBoard = placeShips(SHIPS);
  return {
    playerBoard,
    enemyBoard,
    turn: 'player',
    gameOver: false,
    winner: null,
    chat: createIntroMessages(),
    aiMemory: createAiMemory(),
    status: `${PLAYER_COMMANDER}'s turn — fire at the enemy fleet.`,
    shakeSide: null,
  };
}

export function useGame() {
  const [game, setGame] = useState<GameState>(createInitialGame);

  const startGame = useCallback(() => {
    setGame(createInitialGame());
  }, []);

  const playerFire = useCallback((x: number, y: number) => {
    setGame((prev) => {
      if (prev.gameOver || prev.turn !== 'player') return prev;

      const { board: newEnemyBoard, result } = fireAt(prev.enemyBoard, x, y);
      if (result.type === 'miss' && prev.enemyBoard.cells[y][x].state !== 'miss') {
        // Miss
        let chat = playerMissMessage(prev.chat);
        const status = `${AI_COMMANDER} is targeting your fleet...`;
        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          turn: 'ai' as const,
          chat,
          status,
          shakeSide: null,
        };
      }

      if (result.type === 'hit') {
        let chat = playerHitMessage(prev.chat);
        if (allShipsSunk(newEnemyBoard.ships)) {
          chat = playerSunkMessage(chat, result.shipName ?? 'ship');
          chat = playerWinMessage(chat);
          return {
            ...prev,
            enemyBoard: newEnemyBoard,
            gameOver: true,
            winner: 'player' as const,
            chat,
            status: 'Victory! All enemy ships destroyed.',
          };
        }
        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          chat,
          status: `Hit! Fire again, ${PLAYER_COMMANDER}.`,
          shakeSide: 'ai' as const,
        };
      }

      if (result.type === 'sunk') {
        let chat = playerSunkMessage(prev.chat, result.shipName ?? 'ship');
        if (allShipsSunk(newEnemyBoard.ships)) {
          chat = playerWinMessage(chat);
          return {
            ...prev,
            enemyBoard: newEnemyBoard,
            gameOver: true,
            winner: 'player' as const,
            chat,
            status: 'Victory! All enemy ships destroyed.',
          };
        }
        return {
          ...prev,
          enemyBoard: newEnemyBoard,
          chat,
          status: `Sunk! ${result.shipName} destroyed. Fire again.`,
          shakeSide: 'ai' as const,
        };
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (game.turn !== 'ai' || game.gameOver) return;

    const timer = setTimeout(() => {
      setGame((prev) => {
        const { shot, memory: memoryAfterChoose } = chooseAiShot(prev.playerBoard, prev.aiMemory);
        const { board: newPlayerBoard, result } = fireAt(prev.playerBoard, shot.x, shot.y);
        const newAiMemory = updateAiMemory(memoryAfterChoose, shot, result);

        if (result.type === 'miss') {
          const chat = aiMissMessage(prev.chat);
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            aiMemory: newAiMemory,
            turn: 'player' as const,
            chat,
            status: `${PLAYER_COMMANDER}'s turn — fire at the enemy fleet.`,
            shakeSide: null,
          };
        }

        if (result.type === 'hit') {
          let chat = aiHitMessage(prev.chat);
          if (allShipsSunk(newPlayerBoard.ships)) {
            chat = aiSunkMessage(chat, result.shipName ?? 'ship');
            chat = aiWinMessage(chat);
            return {
              ...prev,
              playerBoard: newPlayerBoard,
              aiMemory: newAiMemory,
              gameOver: true,
              winner: 'ai' as const,
              chat,
              status: 'Defeat. Your fleet has been destroyed.',
            };
          }
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            aiMemory: newAiMemory,
            chat,
            status: `${AI_COMMANDER} hit your ship. Re-engaging...`,
            shakeSide: 'player' as const,
          };
        }

        if (result.type === 'sunk') {
          let chat = aiSunkMessage(prev.chat, result.shipName ?? 'ship');
          if (allShipsSunk(newPlayerBoard.ships)) {
            chat = aiWinMessage(chat);
            return {
              ...prev,
              playerBoard: newPlayerBoard,
              aiMemory: newAiMemory,
              gameOver: true,
              winner: 'ai' as const,
              chat,
              status: 'Defeat. Your fleet has been destroyed.',
            };
          }
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            aiMemory: newAiMemory,
            chat,
            status: `${AI_COMMANDER} sunk your ${result.shipName}. Retaliating...`,
            shakeSide: 'player' as const,
          };
        }

        return prev;
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [game.turn, game.gameOver, game.aiMemory]);

  useEffect(() => {
    if (!game.shakeSide) return;
    const timer = setTimeout(() => setGame((prev) => ({ ...prev, shakeSide: null })), 500);
    return () => clearTimeout(timer);
  }, [game.shakeSide]);

  return {
    game,
    playerFire,
    startGame,
  };
}
