type CommanderAvatarProps = {
  side: 'player' | 'ai';
  size?: number;
};

export function CommanderAvatar({ side, size = 64 }: CommanderAvatarProps) {
  const isPlayer = side === 'player';
  const primary = isPlayer ? '#38bdf8' : '#f43f5e';
  const secondary = isPlayer ? '#0ea5e9' : '#e11d48';
  const skin = isPlayer ? '#e2e8f0' : '#94a3b8';
  const accent = isPlayer ? '#fbbf24' : '#cbd5e1';
  const dark = '#0f172a';
  const shadow = isPlayer ? '#0284c7' : '#9f1239';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className="pixel-art"
      aria-hidden="true"
    >
      {/* Background */}
      <rect x="0" y="0" width="16" height="16" fill={dark} />

      {/* Hat brim */}
      <rect x="2" y="3" width="12" height="2" fill={primary} />
      <rect x="3" y="1" width="10" height="3" fill={secondary} />
      <rect x="5" y="0" width="6" height="1" fill={primary} />

      {/* Face */}
      <rect x="4" y="5" width="8" height="5" fill={skin} />
      <rect x="5" y="5" width="1" height="1" fill={shadow} />
      <rect x="10" y="5" width="1" height="1" fill={shadow} />

      {/* Eyes */}
      <rect x="5" y="7" width="2" height="2" fill={dark} />
      <rect x="9" y="7" width="2" height="2" fill={dark} />

      {/* Mouth */}
      <rect x="7" y="9" width="2" height="1" fill={shadow} />

      {/* Body / shoulders */}
      <rect x="1" y="10" width="14" height="6" fill={primary} />
      <rect x="2" y="11" width="12" height="4" fill={secondary} />
      <rect x="7" y="10" width="2" height="6" fill={shadow} />

      {/* Collar / epaulettes */}
      <rect x="1" y="10" width="3" height="2" fill={accent} />
      <rect x="12" y="10" width="3" height="2" fill={accent} />

      {/* Medal / insignia */}
      <rect x="7" y="12" width="2" height="2" fill={accent} />
      <rect x="8" y="12" width="1" height="1" fill={primary} />
    </svg>
  );
}
