import { useEffect, useState } from 'react';
import { AI_COMMANDER } from '../lib/constants';
import { Ship } from './Ship';

type LastShot = {
  x: number;
  y: number;
  side: 'player' | 'ai';
  result: 'miss' | 'hit' | 'sunk';
} | null;

type StatusPanelProps = {
  status: string;
  turn: 'player' | 'ai';
  gameOver: boolean;
  winner: 'player' | 'ai' | null;
  playerName: string;
  lastShot?: LastShot;
};

export function StatusPanel({ status, turn, gameOver, winner, playerName, lastShot }: StatusPanelProps) {
  const [firing, setFiring] = useState<{ key: number; side: 'player' | 'ai' } | null>(null);

  useEffect(() => {
    if (!lastShot || gameOver) return;
    setFiring((prev) => ({ key: (prev?.key ?? 0) + 1, side: lastShot.side }));
    const timer = setTimeout(() => setFiring(null), 1000);
    return () => clearTimeout(timer);
  }, [lastShot, gameOver]);

  const title = gameOver
    ? winner === 'player'
      ? 'Victory'
      : 'Defeat'
    : turn === 'player'
      ? `${playerName}'s Turn`
      : `${AI_COMMANDER} is Firing`;

  const color = gameOver
    ? winner === 'player'
      ? 'text-ship-glow'
      : 'text-sunk-glow'
    : turn === 'player'
      ? 'text-radar-glow'
      : 'text-hit-glow';

  return (
    <div className="text-center py-4">
      <div className="relative flex items-center justify-center gap-4 sm:gap-8 max-w-lg mx-auto">
        <div className="w-12 h-8 sm:w-16 sm:h-10" title={`${playerName}'s ship`}>
          <Ship id="battleship" length={4} orientation="horizontal" state="intact" className="w-full h-full pixel-art" />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-accent mb-1">
            BattleShipz
          </h1>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`text-sm sm:text-base font-bold ${color} ${turn === 'ai' && !gameOver ? 'animate-pulse' : ''}`}
          >
            {title}
          </div>
        </div>

        <div className="w-12 h-8 sm:w-16 sm:h-10 scale-x-[-1]" title={`${AI_COMMANDER}'s ship`}>
          <Ship id="battleship" length={4} orientation="horizontal" state="intact" className="w-full h-full pixel-art" />
        </div>

        {firing && (
          <span
            key={firing.key}
            className={`pointer-events-none absolute top-1/2 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-hit-glow shadow-[0_0_8px_rgba(248,113,113,0.8)] ${
              firing.side === 'player' ? 'animate-cannon-right' : 'animate-cannon-left'
            }`}
            style={{ transform: 'translateY(-50%)' }}
          />
        )}
      </div>
      <p className="text-muted text-xs sm:text-sm mt-1" aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}
