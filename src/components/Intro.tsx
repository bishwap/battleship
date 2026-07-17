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
        BattleShipz
      </h1>
    </button>
  );
}
