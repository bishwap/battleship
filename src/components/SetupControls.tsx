import { useState } from 'react';

type SetupControlsProps = {
  onRandomize: () => void;
  onStartBattle: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  canStartBattle?: boolean;
};

export function SetupControls({ onRandomize, onStartBattle, onUndo, canUndo, canStartBattle = false }: SetupControlsProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          onRandomize();
        }}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
      >
        Randomize Fleet
      </button>

      {onUndo && (
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            onUndo();
          }}
          disabled={!canUndo}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Undo Placement
        </button>
      )}

      {confirming ? (
        <>
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              onStartBattle();
            }}
            disabled={!canStartBattle}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Start Battle
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-miss/50 bg-miss/10 text-miss-glow hover:bg-miss/20 transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!canStartBattle}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Battle
        </button>
      )}
    </div>
  );
}
