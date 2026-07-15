import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../lib/types';
import { CommanderAvatar } from './CommanderAvatar';

type CommanderChatProps = {
  messages: ChatMessage[];
};

export function CommanderChat({ messages }: CommanderChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.text.includes('!')) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div className={`flex flex-col h-full bg-ocean-light/50 border border-grid rounded-lg p-3 ${shake ? 'animate-shake' : ''}`}>
      <h3 className="text-accent text-sm font-bold tracking-wider mb-2 uppercase">Command Channel</h3>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 min-h-[200px] max-h-[320px]">
        {messages.map((msg) => {
          const isPlayer = msg.speaker === 'player';
          const isSystem = msg.speaker === 'system';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 items-start ${isSystem ? 'justify-center' : isPlayer ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {!isSystem && <CommanderAvatar side={isPlayer ? 'player' : 'ai'} size={64} />}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
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
