import { useEffect, useState } from 'react';
import { AI_COMMANDER } from '../lib/constants';
import type { ChatMessage } from '../lib/types';
import { Ship } from './Ship';
import { SpeechBubble } from './SpeechBubble';

type LastShot = {
  x: number;
  y: number;
  side: 'player' | 'ai';
  result: 'miss' | 'hit' | 'sunk';
} | null;

type StatusPanelProps = {
  playerName: string;
  lastShot?: LastShot;
  lastChatMessage?: ChatMessage;
};

export function StatusPanel({ playerName, lastShot, lastChatMessage }: StatusPanelProps) {
  const [firing, setFiring] = useState<{ key: number; side: 'player' | 'ai' } | null>(null);

  useEffect(() => {
    if (!lastShot) return;
    setFiring((prev) => ({ key: (prev?.key ?? 0) + 1, side: lastShot.side }));
    const timer = setTimeout(() => setFiring(null), 900);
    return () => clearTimeout(timer);
  }, [lastShot]);

  return (
    <header className="relative z-20 text-center pt-4 pb-2 pointer-events-none">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-accent uppercase pointer-events-auto">
        BattleShipz
      </h1>

      <div className="relative flex items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto mt-3 pointer-events-auto">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-bold text-radar-glow truncate max-w-[80px] sm:max-w-[120px]">{playerName}</span>
          <div className="w-12 h-8 sm:w-16 sm:h-10" title={`${playerName}'s ship`}>
            <Ship id="battleship" length={4} orientation="horizontal" state="intact" className="w-full h-full pixel-art" />
          </div>
        </div>

        <div className="relative flex-1 h-8 sm:h-10">
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

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-bold text-hit-glow truncate max-w-[80px] sm:max-w-[120px]">{AI_COMMANDER}</span>
          <div className="w-12 h-8 sm:w-16 sm:h-10 scale-x-[-1]" title={`${AI_COMMANDER}'s ship`}>
            <Ship id="battleship" length={4} orientation="horizontal" state="intact" className="w-full h-full pixel-art" />
          </div>
        </div>
      </div>

      {lastChatMessage && (
        <div className="pointer-events-auto">
          <SpeechBubble message={lastChatMessage} playerName={playerName} />
        </div>
      )}
    </header>
  );
}
