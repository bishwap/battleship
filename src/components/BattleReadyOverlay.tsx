import { useEffect, useRef } from 'react';

type BattleReadyOverlayProps = {
  playerName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const QUOTES = [
  'Ready for battle?',
  'Steady as she goes — all hands prepare for action!',
  'The fleet is formed. Commence the engagement!',
  'All cannons ready. Await your command, Admiral.',
  'The seas are calm, but not for long...',
];

export function BattleReadyOverlay({ playerName, onConfirm, onCancel }: BattleReadyOverlayProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm, onCancel]);

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ocean/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="battle-ready-title"
    >
      <div className="max-w-md w-full mx-4 p-6 sm:p-8 rounded-xl border-2 border-radar/30 bg-ocean-light/80 text-center shadow-2xl animate-pop">
        <h2 id="battle-ready-title" className="text-2xl sm:text-3xl font-black tracking-wide text-accent uppercase mb-4">
          {quote}
        </h2>
        <p className="text-muted mb-6">
          {playerName}, your fleet is positioned. Set sail and engage the enemy?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors w-full sm:w-auto"
          >
            Set Sail
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors w-full sm:w-auto"
          >
            Keep Positioning
          </button>
        </div>
      </div>
    </div>
  );
}
