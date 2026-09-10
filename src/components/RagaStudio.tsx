import { RagaStudioProvider } from '../contexts/RagaStudioProvider';
import { useRagaStudio } from '../hooks/useRagaStudio';
import { SequencerGrid } from './SequencerGrid';
import { StudioControls } from './StudioControls';

function StudioHeader() {
  const { raga, tonic, taal, composition, isPlaying, currentBeat } = useRagaStudio();
  return (
    <header className="flex flex-wrap items-end justify-between gap-2 mb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-wide">Raga Studio</h1>
        <p className="text-sm text-muted">Compose Indian classical melodies by painting notes on a grid — no training needed.</p>
      </div>
      <div className="text-xs sm:text-sm text-muted font-mono text-right">
        <div>
          <span className="text-accent">{raga.name}</span> · Sa = {tonic.name} · {taal.name} · {composition.bpm} BPM
        </div>
        <div aria-live="polite">{isPlaying ? `Beat ${currentBeat + 1} / ${composition.beats}` : 'Stopped'}</div>
      </div>
    </header>
  );
}

function QuickGuide() {
  return (
    <details className="bg-ocean-light/50 border border-grid rounded-lg p-3 text-sm text-muted">
      <summary className="cursor-pointer text-accent font-bold uppercase tracking-wider text-xs">How it works</summary>
      <ol className="list-decimal pl-5 mt-2 space-y-1">
        <li>
          Pick a <strong className="text-text">Raga</strong>. Its notes are highlighted in blue — stick to those and everything you
          play will sound in tune.
        </li>
        <li>
          Click cells to place notes. Rows are the sargam (Sa Re Ga Ma Pa Dha Ni Sa'), columns are beats.
        </li>
        <li>
          Press <strong className="text-text">Play</strong>. The tanpura hums Sa and Pa underneath while the tabla keeps the taal.
        </li>
        <li>Try ending phrases on Sa or Pa, and linger on the raga's <em>vadi</em> note for an authentic feel.</li>
      </ol>
    </details>
  );
}

export function RagaStudio() {
  return (
    <RagaStudioProvider>
      <div className="max-w-[1400px] mx-auto w-full">
        <StudioHeader />
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className="lg:col-span-9 flex flex-col gap-4">
            <SequencerGrid />
            <QuickGuide />
          </section>
          <aside className="lg:col-span-3">
            <StudioControls />
          </aside>
        </main>
      </div>
    </RagaStudioProvider>
  );
}
