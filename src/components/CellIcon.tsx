type IconProps = {
  className?: string;
};

export function WaterIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M2 10 C4 8,6 8,8 10 C10 12,12 12,14 10 L14 12 C12 14,10 14,8 12 C6 10,4 10,2 12 Z" />
      <circle cx="4" cy="5" r="1.5" opacity="0.5" />
      <circle cx="12" cy="4" r="1" opacity="0.4" />
    </svg>
  );
}

export function SplashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M8 2 C6 5,4 7,4 9 a4 4 0 1 0 8 0 C12 7,10 5,8 2 Z" />
      <circle cx="3" cy="4" r="1" opacity="0.7" />
      <circle cx="13" cy="4" r="1" opacity="0.7" />
      <circle cx="2" cy="8" r="1" opacity="0.5" />
      <circle cx="14" cy="8" r="1" opacity="0.5" />
    </svg>
  );
}

export function ExplosionIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M8 1 L9 5 L13 4 L10 7 L14 10 L9 9 L8 14 L7 9 L2 10 L6 7 L3 4 L7 5 Z" />
    </svg>
  );
}

export function FireBurst({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M8 0 L9 5 L14 5 L10 8 L13 13 L8 10 L3 13 L6 8 L2 5 L7 5 Z"
        fill="#f97316"
        stroke="#fbbf24"
        strokeWidth="0.5"
      />
      <circle cx="8" cy="8" r="2.5" fill="#fbbf24" />
    </svg>
  );
}
