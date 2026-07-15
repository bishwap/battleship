import { useEffect } from 'react';

type IntroProps = {
  onDone: () => void;
};

export function Intro({ onDone }: IntroProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <button
      type="button"
      onClick={onDone}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ocean animate-fade-out cursor-pointer"
    >
      <h1 className="text-5xl sm:text-7xl font-black tracking-widest text-accent uppercase animate-pulse">
        Battleshipz
      </h1>
      <p className="text-muted text-sm sm:text-base mt-4 animate-pulse">Click or wait to start</p>
    </button>
  );
}
