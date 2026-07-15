type SetupControlsProps = {
  onRandomize: () => void;
  onStartBattle: () => void;
};

export function SetupControls({ onRandomize, onStartBattle }: SetupControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onRandomize}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
      >
        Randomize Fleet
      </button>
      <button
        type="button"
        onClick={onStartBattle}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors"
      >
        Start Battle
      </button>
    </div>
  );
}
