type CommanderAvatarProps = {
  side: 'player' | 'ai';
  size?: number;
  isTalking?: boolean;
};

export function CommanderAvatar({ side, size = 64, isTalking }: CommanderAvatarProps) {
  const isPlayer = side === 'player';
  const primary = isPlayer ? '#38bdf8' : '#f43f5e';
  const secondary = isPlayer ? '#0ea5e9' : '#e11d48';
  const skin = isPlayer ? '#f8fafc' : '#94a3b8';
  const accent = isPlayer ? '#fbbf24' : '#cbd5e1';
  const dark = '#0f172a';
  const shadow = isPlayer ? '#0284c7' : '#9f1239';
  const hair = isPlayer ? '#0f172a' : '#475569';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="pixel-art"
      aria-hidden="true"
    >
      {/* Background */}
      <rect x="0" y="0" width="24" height="24" fill={dark} />

      {/* Antenna / headgear top for AI */}
      {!isPlayer && (
        <>
          <rect x="11" y="0" width="2" height="2" fill={accent} />
          <rect x="11" y="2" width="2" height="1" fill={secondary} />
        </>
      )}

      {/* Hat brim */}
      <rect x="4" y="5" width="16" height="2" fill={primary} />
      <rect x="6" y="2" width="12" height="4" fill={secondary} />
      <rect x="8" y="1" width="8" height="2" fill={primary} />
      <rect x="6" y="2" width="12" height="1" fill={accent} />

      {/* Hair sides */}
      <rect x="5" y="6" width="2" height="4" fill={hair} />
      <rect x="17" y="6" width="2" height="4" fill={hair} />

      {/* Face */}
      <rect x="7" y="7" width="10" height="9" fill={skin} />
      <rect x="6" y="8" width="1" height="3" fill={skin} />
      <rect x="17" y="8" width="1" height="3" fill={skin} />

      {/* Nose */}
      <rect x="11" y="10" width="2" height="2" fill={shadow} />

      {/* Mouth */}
      <rect
        x="10"
        y="13"
        width="4"
        height="1"
        fill={shadow}
        className={isTalking ? 'avatar-talk' : ''}
      />

      {/* Eyes */}
      <g className="avatar-blink">
        {isPlayer ? (
          <>
            <rect x="8" y="9" width="3" height="3" fill={dark} />
            <rect x="13" y="9" width="3" height="3" fill={dark} />
          </>
        ) : (
          <>
            <rect x="7" y="8" width="10" height="4" fill={shadow} />
            <rect x="8" y="9" width="3" height="2" fill={accent} />
            <rect x="13" y="9" width="3" height="2" fill={accent} />
          </>
        )}
      </g>

      {/* Neck */}
      <rect x="10" y="15" width="4" height="2" fill={skin} />

      {/* Collar */}
      <rect x="9" y="16" width="6" height="2" fill={secondary} />

      {/* Body / shoulders */}
      <rect x="3" y="17" width="18" height="7" fill={primary} />
      <rect x="5" y="19" width="14" height="5" fill={secondary} />
      <rect x="11" y="17" width="2" height="7" fill={shadow} />

      {/* Collar / epaulettes */}
      <rect x="3" y="17" width="4" height="3" fill={accent} />
      <rect x="17" y="17" width="4" height="3" fill={accent} />

      {/* Medal / insignia */}
      <rect x="11" y="20" width="2" height="2" fill={accent} />
      <rect x="11" y="21" width="1" height="1" fill={primary} />
    </svg>
  );
}
