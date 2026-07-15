type IconProps = {
  className?: string;
};

export function WaterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M2 10 C4 8,6 8,8 10 C10 12,12 12,14 10 L14 12 C12 14,10 14,8 12 C6 10,4 10,2 12 Z" />
      <circle cx="4" cy="5" r="1.5" opacity="0.5" />
      <circle cx="12" cy="4" r="1" opacity="0.4" />
    </svg>
  );
}

export function SplashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M8 2 C6 5,4 7,4 9 a4 4 0 1 0 8 0 C12 7,10 5,8 2 Z" />
      <circle cx="3" cy="4" r="1.2" opacity="0.7" />
      <circle cx="13" cy="4" r="1.2" opacity="0.7" />
      <circle cx="2" cy="8" r="1" opacity="0.5" />
      <circle cx="14" cy="8" r="1" opacity="0.5" />
      <circle cx="5" cy="2" r="1" opacity="0.6" />
      <circle cx="11" cy="2" r="1" opacity="0.6" />
    </svg>
  );
}

export function CannonballIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="5" cy="4" r="2" fill="#94a3b8" opacity="0.6" />
      <circle cx="7" cy="2" r="2.5" fill="#94a3b8" opacity="0.5" />
      <circle cx="11" cy="3" r="1.5" fill="#94a3b8" opacity="0.4" />
      <circle cx="8" cy="10" r="3.5" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
      <circle cx="6.5" cy="8.5" r="1" fill="#6b7280" opacity="0.8" />
    </svg>
  );
}

export function WoodHitIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="1" y="9" width="14" height="6" rx="1" fill="#78350f" stroke="#92400e" strokeWidth="1" />
      <path d="M2 11 L14 11" stroke="#92400e" strokeWidth="0.5" opacity="0.7" />
      <path d="M2 13 L14 13" stroke="#92400e" strokeWidth="0.5" opacity="0.7" />
      <circle cx="8" cy="9" r="3" fill="#111827" stroke="#374151" strokeWidth="1" />
      <path d="M4 6 L5 3 L6 6 Z" fill="#a16207" />
      <path d="M10 5 L11 2 L12 5 Z" fill="#a16207" />
      <path d="M7 4 L8 1 L9 4 Z" fill="#a16207" />
      <path d="M13 7 L14 5 L15 7 Z" fill="#a16207" />
    </svg>
  );
}

export function MissIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <g className="animate-wave">
        <path d="M2 10 C4 8,6 8,8 10 C10 12,12 12,14 10 L14 12 C12 14,10 14,8 12 C6 10,4 10,2 12 Z" />
        <circle cx="4" cy="5" r="1.5" opacity="0.5" />
        <circle cx="12" cy="4" r="1" opacity="0.4" />
      </g>
      <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlayerSkullIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <rect x="4" y="3" width="8" height="9" rx="2" />
      <circle cx="6.5" cy="7" r="1.5" fill={className ? 'currentColor' : '#0f172a'} />
      <circle cx="9.5" cy="7" r="1.5" fill={className ? 'currentColor' : '#0f172a'} />
      <rect x="6" y="10" width="4" height="2" fill={className ? 'currentColor' : '#0f172a'} />
      <path d="M3 13 L13 13" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function EnemyTrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M3 4 L13 4 L13 6 C13 9,11 11,9 12 L9 14 L7 14 L7 12 C5 11,3 9,3 6 Z" />
      <rect x="2" y="3" width="12" height="2" />
      <rect x="6" y="13" width="4" height="2" />
    </svg>
  );
}

