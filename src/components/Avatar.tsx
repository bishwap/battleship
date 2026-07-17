type AvatarProps = {
  side: 'player' | 'ai' | 'system';
  className?: string;
};

export function Avatar({ side, className = 'w-10 h-10' }: AvatarProps) {
  if (side === 'system') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="22" className="fill-muted" />
        <circle cx="16" cy="18" r="3" className="fill-ocean" />
        <circle cx="32" cy="18" r="3" className="fill-ocean" />
        <path d="M15 32 Q24 38 33 32" stroke="#020617" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  if (side === 'ai') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="22" className="fill-hit-glow" />
        <path d="M14 16 L22 23" stroke="#020617" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="19" r="3" className="fill-ocean" />
        <path d="M15 33 Q24 39 33 33" stroke="#020617" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" className="fill-radar-glow" />
      <circle cx="16" cy="18" r="3" className="fill-ocean" />
      <circle cx="32" cy="18" r="3" className="fill-ocean" />
      <path d="M15 31 Q24 39 33 31" stroke="#020617" strokeWidth="3" fill="none" />
    </svg>
  );
}
