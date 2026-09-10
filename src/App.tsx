import { useEffect, useState } from 'react';
import { BattleshipApp } from './BattleshipApp';
import { RagaStudio } from './components/RagaStudio';

type AppMode = 'battleship' | 'raga';

const MODE_KEY = 'app-mode';

function loadMode(): AppMode {
  if (typeof window === 'undefined') return 'battleship';
  if (window.location.hash === '#raga') return 'raga';
  if (window.location.hash === '#battleship') return 'battleship';
  return localStorage.getItem(MODE_KEY) === 'raga' ? 'raga' : 'battleship';
}

function AppNav({ mode, onChange }: { mode: AppMode; onChange: (m: AppMode) => void }) {
  const tab = (m: AppMode, label: string) => (
    <button
      type="button"
      onClick={() => onChange(m)}
      aria-current={mode === m ? 'page' : undefined}
      className={`min-h-[36px] px-3 rounded-md text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors ${
        mode === m ? 'bg-radar/20 text-radar-glow border border-radar/50' : 'text-muted hover:text-text border border-transparent'
      }`}
    >
      {label}
    </button>
  );
  return (
    <nav className="safe-area flex items-center justify-center gap-2 py-2" aria-label="Apps">
      {tab('battleship', 'BattleShipz')}
      {tab('raga', 'Raga Studio')}
    </nav>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>(loadMode);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    window.history.replaceState(null, '', `#${mode}`);
  }, [mode]);

  return (
    <>
      <AppNav mode={mode} onChange={setMode} />
      {mode === 'battleship' ? (
        <BattleshipApp />
      ) : (
        <div className="safe-area min-h-screen min-h-[100dvh] pb-8">
          <RagaStudio />
        </div>
      )}
    </>
  );
}

export default App;
