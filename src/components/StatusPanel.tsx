import { AI_COMMANDER, PLAYER_COMMANDER } from '../lib/constants';

type StatusPanelProps = {
  status: string;
  turn: 'player' | 'ai';
  gameOver: boolean;
  winner: 'player' | 'ai' | null;
};

export function StatusPanel({ status, turn, gameOver, winner }: StatusPanelProps) {
  const title = gameOver
    ? winner === 'player'
      ? 'Victory'
      : 'Defeat'
    : turn === 'player'
      ? `${PLAYER_COMMANDER}'s Turn`
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
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-accent mb-1">
        Battleship vs AI
      </h1>
      <div className={`text-sm sm:text-base font-bold ${color} ${turn === 'ai' && !gameOver ? 'animate-pulse' : ''}`}>
        {title}
      </div>
      <p className="text-muted text-xs sm:text-sm mt-1">{status}</p>
    </div>
  );
}
