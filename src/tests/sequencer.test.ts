import { describe, expect, it } from 'vitest';
import {
  MAX_BEATS,
  MAX_BPM,
  MIN_BEATS,
  MIN_BPM,
  clearGrid,
  countNotes,
  createComposition,
  deserializeComposition,
  notesAtBeat,
  pruneToRaga,
  serializeComposition,
  setBeats,
  setBpm,
  swaraIndex,
  toggleCell,
} from '../lib/sequencer';
import { SWARAS } from '../lib/ragas';

describe('sequencer state', () => {
  it('creates an empty grid with one row per swara', () => {
    const comp = createComposition({ beats: 8 });
    expect(comp.grid).toHaveLength(SWARAS.length);
    expect(comp.grid.every((row) => row.length === 8 && row.every((v) => v === false))).toBe(true);
    expect(countNotes(comp)).toBe(0);
  });

  it('toggles a cell on and off immutably', () => {
    const comp = createComposition();
    const row = swaraIndex('P');
    const on = toggleCell(comp, row, 3);
    expect(on).not.toBe(comp);
    expect(on.grid[row][3]).toBe(true);
    expect(comp.grid[row][3]).toBe(false);
    expect(notesAtBeat(on, 3)).toEqual(['P']);
    const off = toggleCell(on, row, 3);
    expect(off.grid[row][3]).toBe(false);
  });

  it('ignores out-of-range toggles', () => {
    const comp = createComposition({ beats: 4 });
    expect(toggleCell(comp, 0, 4)).toBe(comp);
    expect(toggleCell(comp, -1, 0)).toBe(comp);
    expect(toggleCell(comp, SWARAS.length, 0)).toBe(comp);
  });

  it('notesAtBeat lists swaras low to high', () => {
    let comp = createComposition();
    comp = toggleCell(comp, swaraIndex("S'"), 0);
    comp = toggleCell(comp, swaraIndex('S'), 0);
    comp = toggleCell(comp, swaraIndex('G'), 0);
    expect(notesAtBeat(comp, 0)).toEqual(['S', 'G', "S'"]);
  });

  it('resizing preserves notes that still fit and clamps to limits', () => {
    let comp = createComposition({ beats: 8 });
    comp = toggleCell(comp, 0, 2);
    comp = toggleCell(comp, 0, 7);
    const shorter = setBeats(comp, 4);
    expect(shorter.beats).toBe(4);
    expect(shorter.grid[0]).toEqual([false, false, true, false]);
    const longer = setBeats(shorter, 6);
    expect(longer.grid[0]).toEqual([false, false, true, false, false, false]);
    expect(setBeats(comp, 1).beats).toBe(MIN_BEATS);
    expect(setBeats(comp, 999).beats).toBe(MAX_BEATS);
  });

  it('clamps bpm', () => {
    const comp = createComposition();
    expect(setBpm(comp, 10).bpm).toBe(MIN_BPM);
    expect(setBpm(comp, 500).bpm).toBe(MAX_BPM);
    expect(setBpm(comp, 120.4).bpm).toBe(120);
  });

  it('pruneToRaga removes notes outside the new raga', () => {
    let comp = createComposition({ ragaId: 'bilawal' });
    comp = toggleCell(comp, swaraIndex('M'), 0); // shuddha Ma — not in Yaman
    comp = toggleCell(comp, swaraIndex('G'), 1); // Ga — in both
    const yaman = pruneToRaga(comp, 'yaman');
    expect(yaman.ragaId).toBe('yaman');
    expect(notesAtBeat(yaman, 0)).toEqual([]);
    expect(notesAtBeat(yaman, 1)).toEqual(['G']);
  });

  it('clearGrid removes every note', () => {
    let comp = createComposition();
    comp = toggleCell(comp, 0, 0);
    comp = toggleCell(comp, 5, 5);
    expect(countNotes(clearGrid(comp))).toBe(0);
  });

  it('round-trips through serialization', () => {
    let comp = createComposition({ beats: 12, bpm: 110, tonicId: 'D4', ragaId: 'bhairav', taalId: 'keherwa' });
    comp = toggleCell(comp, swaraIndex('r'), 5);
    const restored = deserializeComposition(serializeComposition(comp));
    expect(restored).toEqual(comp);
  });

  it('rejects malformed saved data', () => {
    expect(deserializeComposition('not json')).toBeNull();
    expect(deserializeComposition('{"beats":"x"}')).toBeNull();
  });
});
