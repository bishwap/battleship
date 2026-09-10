import { useRagaStudio } from '../hooks/useRagaStudio';
import { SWARAS } from '../lib/ragas';

export function SequencerGrid() {
  const { composition, raga, taal, currentBeat, toggleCell, previewRow } = useRagaStudio();
  const beats = Array.from({ length: composition.beats }, (_, i) => i);
  // Show highest note at the top, like a piano roll.
  const rows = SWARAS.map((s, i) => ({ swara: s, index: i })).reverse();

  return (
    <div className="bg-ocean-light/50 border border-grid rounded-lg p-2 sm:p-3 overflow-x-auto">
      <div
        className="grid gap-[3px] min-w-max"
        style={{ gridTemplateColumns: `minmax(72px, auto) repeat(${composition.beats}, minmax(28px, 1fr))` }}
        role="grid"
        aria-label="Sargam step sequencer"
      >
        <div />
        {beats.map((b) => {
          const isSam = b % taal.beats === 0;
          const isVibhag = taal.vibhags.includes(b % taal.beats);
          return (
            <div
              key={`h-${b}`}
              className={`text-center text-[10px] sm:text-xs pb-1 ${
                b === currentBeat ? 'text-amber-300 font-bold' : isSam ? 'text-accent' : isVibhag ? 'text-muted' : 'text-muted/60'
              }`}
              aria-hidden
            >
              {isSam ? '✕' : b + 1}
            </div>
          );
        })}

        {rows.map(({ swara, index }) => {
          const inRaga = raga.swaras.includes(swara.id);
          const isVadi = raga.vadi === swara.id;
          const isSa = swara.id === 'S' || swara.id === "S'";
          return (
            <div key={swara.id} className="contents" role="row">
              <button
                type="button"
                onClick={() => previewRow(index)}
                title={`${swara.label} — click to hear`}
                className={`flex items-center justify-between gap-1 px-2 rounded text-left text-xs sm:text-sm font-bold min-h-[32px] transition-colors ${
                  inRaga
                    ? 'text-text bg-radar/10 hover:bg-radar/25 border border-radar/30'
                    : 'text-muted/40 hover:text-muted border border-transparent'
                }`}
                aria-label={`Preview ${swara.name}`}
              >
                <span>{swara.name}</span>
                {isVadi && <span className="text-[9px] uppercase text-amber-300" title="Vadi (main note)">vadi</span>}
              </button>
              {beats.map((b) => {
                const on = composition.grid[index]?.[b] ?? false;
                const playing = b === currentBeat;
                const isVibhag = taal.vibhags.includes(b % taal.beats) && b !== 0;
                return (
                  <button
                    key={`${swara.id}-${b}`}
                    type="button"
                    role="gridcell"
                    aria-pressed={on}
                    aria-label={`${swara.name}, beat ${b + 1}${on ? ', on' : ''}`}
                    onClick={() => toggleCell(index, b)}
                    className={[
                      'min-h-[32px] rounded-sm transition-colors border',
                      isVibhag ? 'ml-[3px]' : '',
                      on
                        ? inRaga
                          ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'bg-rose-500/80 border-rose-300'
                        : inRaga
                          ? isSa
                            ? 'bg-radar/20 border-radar/30 hover:bg-radar/40'
                            : 'bg-radar/10 border-grid hover:bg-radar/30'
                          : 'bg-ocean/40 border-grid/50 hover:bg-ocean-light',
                      playing ? 'ring-2 ring-amber-300/80' : '',
                    ].join(' ')}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted mt-2">
        Blue rows are notes in <span className="text-accent">{raga.name}</span>. Click a cell to place a note; click a
        note name to hear it. ✕ marks the <em>sam</em> (first beat of the taal cycle).
      </p>
    </div>
  );
}
