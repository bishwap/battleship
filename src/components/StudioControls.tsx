import { useRagaStudio } from '../hooks/useRagaStudio';
import { RAGAS, TONICS } from '../lib/ragas';
import { TAALS } from '../lib/audio/tabla';
import { MAX_BEATS, MAX_BPM, MIN_BEATS, MIN_BPM } from '../lib/sequencer';

const selectClass =
  'w-full min-h-[40px] px-2 rounded-lg bg-ocean border border-grid text-text text-sm focus:outline-none focus:border-radar';
const labelClass = 'flex flex-col gap-1 text-xs uppercase tracking-wider text-muted';

export function StudioControls() {
  const {
    composition,
    raga,
    isPlaying,
    hasSaved,
    play,
    stop,
    clear,
    setBpm,
    setBeats,
    setTonic,
    setRaga,
    setTaal,
    setDroneOn,
    setTablaOn,
    save,
    load,
    reset,
  } = useRagaStudio();

  return (
    <div className="bg-ocean-light/50 border border-grid rounded-lg p-3 flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={isPlaying ? stop : play}
          className={`flex-1 min-h-[48px] rounded-lg font-bold text-base transition-colors ${
            isPlaying
              ? 'bg-hit/20 border border-hit text-hit-glow hover:bg-hit/30'
              : 'bg-amber-400/20 border border-amber-400 text-amber-200 hover:bg-amber-400/30'
          }`}
        >
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>
        <button
          type="button"
          onClick={clear}
          className="min-h-[48px] px-4 rounded-lg border border-grid text-muted hover:text-text hover:border-muted transition-colors"
          title="Remove all notes"
        >
          Clear
        </button>
      </div>

      <label className={labelClass}>
        <span className="flex justify-between">
          Tempo <span className="text-text normal-case">{composition.bpm} BPM</span>
        </span>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={composition.bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
      </label>

      <label className={labelClass}>
        <span className="flex justify-between">
          Beats <span className="text-text normal-case">{composition.beats}</span>
        </span>
        <input
          type="range"
          min={MIN_BEATS}
          max={MAX_BEATS}
          step={1}
          value={composition.beats}
          onChange={(e) => setBeats(Number(e.target.value))}
          className="w-full accent-radar"
        />
      </label>

      <label className={labelClass}>
        Raga (scale)
        <select value={composition.ragaId} onChange={(e) => setRaga(e.target.value)} className={selectClass}>
          {RAGAS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.time}
            </option>
          ))}
        </select>
        <span className="text-[11px] normal-case tracking-normal text-muted">{raga.mood}</span>
      </label>

      <label className={labelClass}>
        Sa (tonic pitch)
        <select value={composition.tonicId} onChange={(e) => setTonic(e.target.value)} className={selectClass}>
          {TONICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.frequency.toFixed(0)} Hz
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Taal (rhythm)
        <select value={composition.taalId} onChange={(e) => setTaal(e.target.value)} className={selectClass}>
          {TAALS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
          <span>Tanpura drone</span>
          <input
            type="checkbox"
            checked={composition.droneOn}
            onChange={(e) => setDroneOn(e.target.checked)}
            className="w-5 h-5 accent-amber-400 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
          <span>Tabla</span>
          <input
            type="checkbox"
            checked={composition.tablaOn}
            onChange={(e) => setTablaOn(e.target.checked)}
            className="w-5 h-5 accent-amber-400 cursor-pointer"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-grid">
        <button
          type="button"
          onClick={save}
          className="min-h-[40px] rounded-lg border border-ship/50 bg-ship/10 text-ship-glow hover:bg-ship/20 text-sm transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={load}
          disabled={!hasSaved}
          className="min-h-[40px] rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Load
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-h-[40px] rounded-lg border border-grid text-muted hover:text-text text-sm transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
