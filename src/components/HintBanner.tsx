import { useMemo } from 'react';

const HINTS = [
  'Try a checkerboard firing pattern — ships occupy alternating cells.',
  "Once you hit a ship, finish it before hunting another — ships can't touch.",
  'Spread your first few shots across the board to locate the larger vessels.',
  'Sink ships early to narrow where the smaller ones can hide.',
  "Don't bunch shots together — a Carrier is 5 cells long!",
];

type HintBannerProps = {
  text?: string;
  onClose: () => void;
};

export function HintBanner({ text, onClose }: HintBannerProps) {
  const hintText = useMemo(() => text ?? HINTS[Math.floor(Math.random() * HINTS.length)], [text]);

  return (
    <div className="px-4 py-2 bg-radar/10 border-b border-radar/30">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        <span className="text-xs sm:text-sm text-radar-glow flex-1">{hintText}</span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs text-text hover:text-radar-glow underline"
          aria-label="Dismiss tip"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
