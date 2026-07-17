import { useEffect, useState } from 'react';
import { AI_COMMANDER } from '../lib/constants';
import type { ChatMessage } from '../lib/types';
import { Avatar } from './Avatar';

type SpeechBubbleProps = {
  message: ChatMessage;
  playerName: string;
  onDismiss?: () => void;
};

export function SpeechBubble({ message, playerName, onDismiss }: SpeechBubbleProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const isPlayer = message.speaker === 'player';
  const isAi = message.speaker === 'ai';
  const speaker = isPlayer ? playerName : isAi ? AI_COMMANDER : 'Command';
  const color = isPlayer ? 'text-radar-glow' : isAi ? 'text-hit-glow' : 'text-muted';

  if (!visible) return null;

  return (
    <div
      className="relative mt-2 max-w-md mx-auto animate-fade-in"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3 rounded-xl border border-grid bg-ocean-light/90 p-3 shadow-xl">
        <Avatar side={message.speaker} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
        <div className="text-left min-w-0">
          <p className={`text-xs font-bold uppercase tracking-wider ${color}`}>{speaker}</p>
          <p className="text-sm sm:text-base text-text leading-snug break-words">{message.text}</p>
        </div>
      </div>
    </div>
  );
}
