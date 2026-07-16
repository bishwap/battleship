import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../lib/types';
import { CommanderAvatar } from './CommanderAvatar';

type CommanderChatProps = {
  messages: ChatMessage[];
};

export function CommanderChat({ messages }: CommanderChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (scrollRef.current && bottomRef.current) {
      scrollRef.current.scrollTo({
        top: bottomRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.text.includes('!')) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const visibleMessages = messages.slice(-2);
  const latestId = messages[messages.length - 1]?.id;

  return (
    <div className={`flex flex-col flex-1 bg-ocean-light/50 border border-grid rounded-lg p-4 max-h-[240px] sm:max-h-[320px] ${shake ? 'animate-shake' : ''}`}>
      <h3 className="text-accent text-base font-bold tracking-wider mb-2 uppercase">Command Channel</h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin space-y-3 max-h-full">
        {visibleMessages.map((msg) => {
          const isPlayer = msg.speaker === 'player';
          const isSystem = msg.speaker === 'system';
          return (
            <div
              key={msg.id}
              className={`flex gap-4 items-start ${isSystem ? 'justify-center' : isPlayer ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {!isSystem && <CommanderAvatar side={isPlayer ? 'player' : 'ai'} size={80} isTalking={msg.id === latestId} />}
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg text-base leading-relaxed ${
                  isSystem
                    ? 'bg-sunk/30 text-sunk-glow text-center font-bold'
                    : isPlayer
                      ? 'bg-radar/10 text-radar-glow border border-radar/30 chat-bubble'
                      : 'bg-hit/10 text-hit-glow border border-hit/30 chat-bubble-right'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
