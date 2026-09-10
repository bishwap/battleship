import { DEFAULT_RAGA_ID, DEFAULT_TONIC_ID, RAGA_BY_ID, SWARAS, type SwaraId } from './ragas';

export const MIN_BEATS = 4;
export const MAX_BEATS = 32;
export const MIN_BPM = 40;
export const MAX_BPM = 200;

export type Composition = {
  /** grid[swaraIndex][beat] — swaraIndex follows SWARAS order (low to high). */
  grid: boolean[][];
  beats: number;
  bpm: number;
  tonicId: string;
  ragaId: string;
  taalId: string;
  droneOn: boolean;
  tablaOn: boolean;
};

export const STORAGE_KEY = 'raga-studio-composition';

export function emptyGrid(beats: number): boolean[][] {
  return SWARAS.map(() => Array.from({ length: beats }, () => false));
}

export function createComposition(overrides: Partial<Composition> = {}): Composition {
  const beats = overrides.beats ?? 16;
  return {
    grid: emptyGrid(beats),
    beats,
    bpm: 90,
    tonicId: DEFAULT_TONIC_ID,
    ragaId: DEFAULT_RAGA_ID,
    taalId: 'teentaal',
    droneOn: true,
    tablaOn: true,
    ...overrides,
  };
}

export function swaraIndex(swara: SwaraId): number {
  return SWARAS.findIndex((s) => s.id === swara);
}

/** Toggle a single cell; returns a new composition. */
export function toggleCell(comp: Composition, row: number, beat: number): Composition {
  if (row < 0 || row >= comp.grid.length || beat < 0 || beat >= comp.beats) return comp;
  const grid = comp.grid.map((r, i) => (i === row ? r.map((v, b) => (b === beat ? !v : v)) : r));
  return { ...comp, grid };
}

export function clearGrid(comp: Composition): Composition {
  return { ...comp, grid: emptyGrid(comp.beats) };
}

/** Change the number of beats, preserving existing notes that still fit. */
export function setBeats(comp: Composition, beats: number): Composition {
  const clamped = Math.max(MIN_BEATS, Math.min(MAX_BEATS, Math.round(beats)));
  if (clamped === comp.beats) return comp;
  const grid = comp.grid.map((row) => Array.from({ length: clamped }, (_, b) => row[b] ?? false));
  return { ...comp, beats: clamped, grid };
}

export function setBpm(comp: Composition, bpm: number): Composition {
  return { ...comp, bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm))) };
}

/** Swaras (by row index) that are active on a given beat. */
export function notesAtBeat(comp: Composition, beat: number): SwaraId[] {
  return SWARAS.filter((_, row) => comp.grid[row]?.[beat]).map((s) => s.id);
}

/** Remove any active notes that are not part of the given raga. */
export function pruneToRaga(comp: Composition, ragaId: string): Composition {
  const raga = RAGA_BY_ID[ragaId];
  if (!raga) return comp;
  const grid = comp.grid.map((row, i) => (raga.swaras.includes(SWARAS[i].id) ? row : row.map(() => false)));
  return { ...comp, ragaId, grid };
}

export function countNotes(comp: Composition): number {
  return comp.grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
}

export function serializeComposition(comp: Composition): string {
  return JSON.stringify(comp);
}

export function deserializeComposition(raw: string): Composition | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Composition>;
    if (!parsed || !Array.isArray(parsed.grid) || typeof parsed.beats !== 'number') return null;
    const base = createComposition({ ...parsed, beats: parsed.beats });
    // Normalise grid shape in case swara list changed between versions.
    const grid = SWARAS.map((_, row) =>
      Array.from({ length: base.beats }, (_, b) => Boolean(parsed.grid?.[row]?.[b]))
    );
    return { ...base, grid };
  } catch {
    return null;
  }
}

export function loadComposition(): Composition | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? deserializeComposition(raw) : null;
  } catch {
    return null;
  }
}

export function saveComposition(comp: Composition): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, serializeComposition(comp));
  } catch {
    // ignore storage errors
  }
}

export function clearSavedComposition(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
