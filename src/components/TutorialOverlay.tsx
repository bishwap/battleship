import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    title: 'Welcome aboard, Admiral!',
    body: 'BattleShipz is a tactical naval duel. Your mission: place your fleet, hunt the enemy, and sink every ship before they sink yours.',
  },
  {
    title: 'Place & rotate your fleet',
    body: 'Drag a ship from the dock to your board, or click a ship then click a cell. Click a placed ship to select it, then click again or press R / Rotate Ship to spin it. You can still move and rotate ships after pressing Randomize Fleet.',
  },
  {
    title: 'Ready for battle',
    body: 'When your fleet is set, press Start Battle and confirm Set Sail. Your shot is fired by clicking an enemy cell. A hit lets you fire again; a miss hands the turn to the enemy.',
  },
  {
    title: 'Zoom your fleet',
    body: 'The "Your Fleet" panel in the side bar can be clicked to zoom in for a closer look, and clicked again to shrink back down.',
  },
  {
    title: 'Tactical hint',
    body: 'Try a checkerboard firing pattern — every other cell covers all ship sizes efficiently. When you hit, keep shooting around that spot until the ship sinks.',
  },
];

type TutorialOverlayProps = {
  onDone: () => void;
  onSkip: () => void;
};

export function TutorialOverlay({ onDone, onSkip }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    nextRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else onDone();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onDone, onSkip]);

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="max-w-md w-full mx-4 p-6 sm:p-8 rounded-xl border-2 border-radar/30 bg-ocean-light/80 shadow-2xl">
        <h2 id="tutorial-title" className="text-2xl sm:text-3xl font-black tracking-wide text-accent uppercase mb-3">
          {current.title}
        </h2>
        <p className="text-text mb-6 leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === step ? 'bg-radar' : 'bg-grid'}`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-muted hover:text-text text-sm transition-colors"
          >
            Skip tutorial
          </button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
              >
                Back
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={() => {
                if (step < STEPS.length - 1) setStep((s) => s + 1);
                else onDone();
              }}
              className="min-h-[44px] px-6 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors"
            >
              {step === STEPS.length - 1 ? 'Set Sail' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
