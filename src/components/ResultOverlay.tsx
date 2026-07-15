import { PlayerSkullIcon, EnemyTrophyIcon } from './CellIcon';

type ResultOverlayProps = {
  winner: 'player' | 'ai';
  playerName: string;
  tally: { wins: number; losses: number };
  onPlayAgain: () => void;
};

export function ResultOverlay({ winner, playerName, tally, onPlayAgain }: ResultOverlayProps) {
  const isWin = winner === 'player';
  const total = tally.wins + tally.losses;
  const winRate = total > 0 ? Math.round((tally.wins / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/95 animate-fade-in">
      <div className="text-center animate-pop">
        {isWin ? (
          <>
            <EnemyTrophyIcon className="w-24 h-24 mx-auto text-ship-glow mb-4" />
            <h2 className="text-5xl sm:text-7xl font-black text-ship-glow uppercase tracking-wider">Victory</h2>
            <p className="text-radar-glow text-lg sm:text-2xl mt-2">{playerName} wins the battle!</p>
          </>
        ) : (
          <>
            <PlayerSkullIcon className="w-24 h-24 mx-auto text-sunk-glow mb-4" />
            <h2 className="text-5xl sm:text-7xl font-black text-sunk-glow uppercase tracking-wider">Defeat</h2>
            <p className="text-hit-glow text-lg sm:text-2xl mt-2">The machines have bested {playerName}.</p>
          </>
        )}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-text">
          <span className="text-ship-glow font-bold">Wins: {tally.wins}</span>
          <span className="text-sunk-glow font-bold">Losses: {tally.losses}</span>
          <span className="text-radar-glow font-bold">Win %: {winRate}</span>
        </div>
        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-8 px-8 py-3 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors text-lg font-bold"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
