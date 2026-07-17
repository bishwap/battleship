import { useEffect, useRef } from 'react';
import { DIFFICULTY_CONFIGS, type Difficulty } from '../lib/constants';

type DifficultySelectorProps = {
  onSelect: (difficulty: Difficulty) => void;
};

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  const easyRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    easyRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="difficulty-title"
    >
      <div className="w-full max-w-md mx-4 p-6 rounded-xl border border-radar/30 bg-ocean-light/80 shadow-2xl">
        <h2
          id="difficulty-title"
          className="text-2xl font-black text-accent uppercase tracking-wide mb-2 text-center"
        >
          Choose the Seas
        </h2>
        <p className="text-muted text-sm mb-6 text-center">
          Select a difficulty before placing your fleet.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((key, i) => {
            const config = DIFFICULTY_CONFIGS[key];
            return (
              <button
                key={key}
                ref={i === 0 ? easyRef : undefined}
                type="button"
                onClick={() => onSelect(key)}
                className="flex flex-col items-start gap-1 p-4 rounded-lg border border-radar/30 bg-radar/10 text-left hover:bg-radar/20 transition-colors focus-visible:ring-2 focus-visible:ring-radar"
              >
                <span className="text-lg font-bold text-radar-glow">{config.label}</span>
                <span className="text-sm text-text">{config.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
