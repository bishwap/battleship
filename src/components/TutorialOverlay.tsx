import { useEffect, useRef, useState } from 'react';

type Step = {
  title: (name: string) => string;
  body: string;
};

const STEPS: Step[] = [
  {
    title: (name) => `Welcome aboard, ${name}!`,
    body: 'Your goal is simple: sink all five enemy ships before they sink yours.',
  },
  {
    title: () => 'Place your ships',
    body: 'Drag a ship from the dock to your board, or tap a ship then tap a cell. Tap a placed ship to move or rotate it.',
  },
  {
    title: () => 'Start the battle',
    body: 'When your fleet is ready, tap Start Battle, then Set Sail. Tap enemy cells to fire. A hit lets you shoot again; a miss gives the AI a turn.',
  },
  {
    title: () => 'Zoom & settings',
    body: 'Tap Your Fleet in the side panel to zoom in. Try a checkerboard firing pattern to find ships faster.',
  },
];

type TutorialOverlayProps = {
  playerName: string;
  onDone: () => void;
  onSkip: () => void;
};

export function TutorialOverlay({ playerName, onDone, onSkip }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/90 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="max-w-md w-full max-h-[85dvh] sm:min-h-[420px] flex flex-col rounded-xl border-2 border-radar/30 bg-ocean-light/80 shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 min-h-0">
          <h2
            id="tutorial-title"
            className="text-2xl sm:text-3xl font-black tracking-wide text-accent uppercase mb-4"
          >
            {current.title(playerName)}
          </h2>
          <p className="text-text text-base leading-relaxed min-h-[160px] sm:min-h-[200px]">{current.body}</p>
        </div>

        <div className="shrink-0 p-6 sm:p-8 pt-0 sm:pt-0 border-t border-grid/40">
          <div className="flex items-center justify-center gap-2 mt-2 mb-4">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${i === step ? 'bg-radar' : 'bg-grid'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onSkip}
              className="text-muted hover:text-text text-sm transition-colors"
            >
              Skip tutorial
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className={`min-h-[44px] min-w-[80px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors ${
                  step === 0 ? 'invisible' : ''
                }`}
              >
                Back
              </button>
              <button
                ref={nextRef}
                type="button"
                onClick={() => {
                  if (isLast) onDone();
                  else setStep((s) => s + 1);
                }}
                className="min-h-[44px] min-w-[110px] px-6 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors"
              >
                {isLast ? 'Set Sail' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
