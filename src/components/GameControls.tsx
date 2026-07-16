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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[18px] h-[18px]"
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
        <path d="M3 3v9h9" />
      </svg>
      <span>New Game</span>
    </button>
  );
}
