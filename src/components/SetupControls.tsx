type SetupControlsProps = {
  onRandomize: () => void;
  onStartBattle: () => void;
  onUndo?: () => void;
  onRotate?: () => void;
  canUndo?: boolean;
  canStartBattle?: boolean;
  selectedShip?: string | null;
  selectedShipName?: string;
};

export function SetupControls({
  onRandomize,
  onStartBattle,
  onUndo,
  onRotate,
  canUndo,
  canStartBattle = false,
  selectedShip,
  selectedShipName,
}: SetupControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onRandomize}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
      >
        Randomize Fleet
      </button>

      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Undo Placement
        </button>
      )}

      {selectedShip && onRotate && (
        <button
          type="button"
          onClick={onRotate}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-hit/50 bg-hit/10 text-hit-glow hover:bg-hit/20 transition-colors"
        >
          Rotate {selectedShipName ?? 'Ship'}
        </button>
      )}

      <button
        type="button"
        onClick={onStartBattle}
        disabled={!canStartBattle}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Battle
      </button>
    </div>
  );
}
