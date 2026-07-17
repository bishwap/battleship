import { useEffect, useRef } from 'react';
import type { SideStats } from '../lib/types';
import { PlayerSkullIcon, EnemyTrophyIcon } from './CellIcon';

type ResultOverlayProps = {
  winner: 'player' | 'ai';
  playerName: string;
  tally: { wins: number; losses: number };
  stats: { player: SideStats; ai: SideStats };
  onPlayAgain: () => void;
};

function accuracy(stats: SideStats) {
  return stats.shots > 0 ? Math.round((stats.hits / stats.shots) * 100) : 0;
}

function commanderRating(playerStats: SideStats, isWin: boolean) {
  const acc = accuracy(playerStats);
  if (isWin && acc >= 80 && playerStats.shots >= 15) return 'Legendary Fleet Admiral';
  if (isWin && acc >= 60) return 'Sea Dog Captain';
  if (isWin) return 'Battle-Tested Commander';
  if (acc >= 50) return 'Honorable Captain';
  if (acc >= 30) return 'Cabin Boy';
  return 'Deck Scrubber';
}

export function ResultOverlay({ winner, playerName, tally, stats, onPlayAgain }: ResultOverlayProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const isWin = winner === 'player';
  const total = tally.wins + tally.losses;
  const winRate = total > 0 ? Math.round((tally.wins / total) * 100) : 0;
  const playerAcc = accuracy(stats.player);
  const aiAcc = accuracy(stats.ai);
  const rating = commanderRating(stats.player, isWin);

  useEffect(() => {
    playAgainRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPlayAgain();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/95 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div className="max-w-md w-full mx-4 text-center animate-pop">
        {isWin ? (
          <>
            <EnemyTrophyIcon className="w-24 h-24 mx-auto text-ship-glow mb-4" />
            <h2 id="result-title" className="text-5xl sm:text-7xl font-black text-ship-glow uppercase tracking-wider">Victory</h2>
            <p className="text-radar-glow text-lg sm:text-2xl mt-2">{playerName} wins the battle!</p>
          </>
        ) : (
          <>
            <PlayerSkullIcon className="w-24 h-24 mx-auto text-sunk-glow mb-4" />
            <h2 id="result-title" className="text-5xl sm:text-7xl font-black text-sunk-glow uppercase tracking-wider">Defeat</h2>
            <p className="text-hit-glow text-lg sm:text-2xl mt-2">The machines have bested {playerName}.</p>
          </>
        )}

        <p className="text-accent text-base sm:text-lg font-bold mt-2">Rank: {rating}</p>

        <div className="grid grid-cols-2 gap-3 mt-6 text-sm text-text">
          <div className="rounded-lg border border-grid bg-ocean-light/50 p-3">
            <p className="text-muted text-xs uppercase tracking-wider">Salvoes Fired</p>
            <p className="text-radar-glow font-bold text-lg">{stats.player.shots}</p>
          </div>
          <div className="rounded-lg border border-grid bg-ocean-light/50 p-3">
            <p className="text-muted text-xs uppercase tracking-wider">Hit Ratio</p>
            <p className="text-ship-glow font-bold text-lg">{playerAcc}%</p>
            <p className="text-muted text-xs">{stats.player.hits} hits / {stats.player.misses} misses</p>
          </div>
          <div className="rounded-lg border border-grid bg-ocean-light/50 p-3">
            <p className="text-muted text-xs uppercase tracking-wider">Ships Sunk</p>
            <p className="text-ship-glow font-bold text-lg">{stats.player.sunk}</p>
          </div>
          <div className="rounded-lg border border-grid bg-ocean-light/50 p-3">
            <p className="text-muted text-xs uppercase tracking-wider">Enemy Accuracy</p>
            <p className="text-hit-glow font-bold text-lg">{aiAcc}%</p>
            <p className="text-muted text-xs">{stats.ai.sunk} of your ships sunk</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-text">
          <span className="text-ship-glow font-bold">Wins: {tally.wins}</span>
          <span className="text-sunk-glow font-bold">Losses: {tally.losses}</span>
          <span className="text-radar-glow font-bold">Win %: {winRate}</span>
        </div>
        <button
          ref={playAgainRef}
          type="button"
          onClick={onPlayAgain}
          className="mt-6 px-8 py-3 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors text-lg font-bold"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
