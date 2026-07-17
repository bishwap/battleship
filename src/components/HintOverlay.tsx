import { useEffect, useRef } from 'react';

const HINTS = [
  'Try a checkerboard firing pattern — every other cell covers every ship length.',
  "Aim near your last hit: once you've found a ship, finish it before hunting elsewhere.",
  "Don't cluster shots; ships can't overlap, so spread your salvoes across open water.",
  "The smallest ship is only 2 cells long. A tight checkerboard guarantees you'll find it.",
  'Pay attention to rows and columns that still have room to hide a 5-cell Carrier.',
];

type HintOverlayProps = {
  onDismiss: () => void;
};

export function HintOverlay({ onDismiss }: HintOverlayProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hint = HINTS[Math.floor(Math.random() * HINTS.length)];

  useEffect(() => {
    buttonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ocean/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-title"
    >
      <div className="max-w-sm w-full mx-4 p-5 rounded-xl border-2 border-hit/30 bg-ocean-light/90 shadow-2xl text-center">
        <h2 id="hint-title" className="text-xl font-black text-hit-glow uppercase tracking-wide mb-2">
          Admiral's Tip
        </h2>
        <p className="text-text mb-4">{hint}</p>
        <button
          ref={buttonRef}
          type="button"
          onClick={onDismiss}
          className="min-h-[44px] px-6 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
        >
          Aye aye, Captain
        </button>
      </div>
    </div>
  );
}
