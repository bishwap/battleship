type TallyBoardProps = {
  name: string;
  tally: { wins: number; losses: number };
};

export function TallyBoard({ name, tally }: TallyBoardProps) {
  const total = tally.wins + tally.losses;
  const winRate = total > 0 ? Math.round((tally.wins / total) * 100) : 0;

  return (
    <div className="bg-ocean-light/50 border border-grid rounded-lg p-3">
      <h3 className="text-accent text-sm font-bold tracking-wider mb-2 uppercase">Tally Board</h3>
      <div className="text-sm text-text mb-2 truncate">Admiral: <span className="font-bold text-radar-glow">{name}</span></div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-ocean rounded p-2">
          <div className="text-xs text-muted">Wins</div>
          <div className="text-lg font-bold text-ship-glow">{tally.wins}</div>
        </div>
        <div className="bg-ocean rounded p-2">
          <div className="text-xs text-muted">Losses</div>
          <div className="text-lg font-bold text-sunk-glow">{tally.losses}</div>
        </div>
        <div className="bg-ocean rounded p-2">
          <div className="text-xs text-muted">Win Rate</div>
          <div className="text-lg font-bold text-radar-glow">{winRate}%</div>
        </div>
      </div>
    </div>
  );
}
