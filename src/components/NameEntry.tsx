import { useEffect, useRef, useState } from 'react';

type NameEntryProps = {
  defaultName?: string;
  onDone: (name: string) => void;
};

const DEFAULT_PLACEHOLDER = 'Admiral';

export function NameEntry({ defaultName = '', onDone }: NameEntryProps) {
  const [name, setName] = useState(defaultName && defaultName !== DEFAULT_PLACEHOLDER ? defaultName : '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter your name to set sail.');
      return;
    }
    onDone(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-4 p-6 rounded-xl border border-radar/30 bg-ocean-light/80 shadow-2xl"
      >
        <h2 id="name-title" className="text-2xl font-black text-accent uppercase tracking-wide mb-2">
          Ahoy, Commander!
        </h2>
        <p className="text-muted text-sm mb-4">What name shall the crew call you?</p>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          maxLength={20}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-lg border border-grid bg-ocean-light text-text text-lg focus:border-radar focus:outline-none"
          aria-describedby={error ? 'name-error' : undefined}
        />

        {error && (
          <p id="name-error" className="text-hit-glow text-sm mt-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-4 min-h-[44px] px-6 py-2 rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 transition-colors font-bold"
        >
          Set Sail
        </button>
      </form>
    </div>
  );
}
