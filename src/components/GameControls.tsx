import { RotateCcw } from 'lucide-react';

type GameControlsProps = {
  onNewGame: () => void;
};

export function GameControls({ onNewGame }: GameControlsProps) {
  return (
    <button
      type="button"
      onClick={onNewGame}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
    >
      <RotateCcw size={18} />
      <span>New Game</span>
    </button>
  );
}
