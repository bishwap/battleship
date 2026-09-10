export type SwaraId =
  | 'S'
  | 'r'
  | 'R'
  | 'g'
  | 'G'
  | 'M'
  | 'm'
  | 'P'
  | 'd'
  | 'D'
  | 'n'
  | 'N'
  | "S'";

export type Swara = {
  id: SwaraId;
  /** Display name (sargam syllable). */
  name: string;
  /** Semitones above the tonic Sa. */
  semitones: number;
  /** Just-intonation ratio relative to Sa. */
  ratio: number;
  /** Short description for beginners. */
  label: string;
};

/**
 * The twelve swaras of one octave plus the upper Sa, ordered from low to high.
 * Lowercase ids are komal (flat) variants; `m` is tivra (sharp) Ma.
 */
export const SWARAS: Swara[] = [
  { id: 'S', name: 'Sa', semitones: 0, ratio: 1, label: 'Shadja (tonic)' },
  { id: 'r', name: 'Re♭', semitones: 1, ratio: 16 / 15, label: 'Komal Rishabh' },
  { id: 'R', name: 'Re', semitones: 2, ratio: 9 / 8, label: 'Shuddha Rishabh' },
  { id: 'g', name: 'Ga♭', semitones: 3, ratio: 6 / 5, label: 'Komal Gandhar' },
  { id: 'G', name: 'Ga', semitones: 4, ratio: 5 / 4, label: 'Shuddha Gandhar' },
  { id: 'M', name: 'Ma', semitones: 5, ratio: 4 / 3, label: 'Shuddha Madhyam' },
  { id: 'm', name: 'Ma♯', semitones: 6, ratio: 45 / 32, label: 'Tivra Madhyam' },
  { id: 'P', name: 'Pa', semitones: 7, ratio: 3 / 2, label: 'Pancham' },
  { id: 'd', name: 'Dha♭', semitones: 8, ratio: 8 / 5, label: 'Komal Dhaivat' },
  { id: 'D', name: 'Dha', semitones: 9, ratio: 5 / 3, label: 'Shuddha Dhaivat' },
  { id: 'n', name: 'Ni♭', semitones: 10, ratio: 9 / 5, label: 'Komal Nishad' },
  { id: 'N', name: 'Ni', semitones: 11, ratio: 15 / 8, label: 'Shuddha Nishad' },
  { id: "S'", name: "Sa'", semitones: 12, ratio: 2, label: 'Upper Sa (octave)' },
];

export const SWARA_BY_ID: Record<SwaraId, Swara> = SWARAS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SwaraId, Swara>
);

export type Raga = {
  id: string;
  name: string;
  /** Swaras used in the raga (ascending). Always includes S and S'. */
  swaras: SwaraId[];
  /** Vadi (most important) swara. */
  vadi: SwaraId;
  /** Time of day traditionally associated with the raga. */
  time: string;
  mood: string;
};

export const RAGAS: Raga[] = [
  {
    id: 'bilawal',
    name: 'Bilawal',
    swaras: ['S', 'R', 'G', 'M', 'P', 'D', 'N', "S'"],
    vadi: 'D',
    time: 'Morning',
    mood: 'Bright and cheerful (like the Western major scale)',
  },
  {
    id: 'yaman',
    name: 'Yaman',
    swaras: ['S', 'R', 'G', 'm', 'P', 'D', 'N', "S'"],
    vadi: 'G',
    time: 'Evening',
    mood: 'Romantic and serene',
  },
  {
    id: 'bhairav',
    name: 'Bhairav',
    swaras: ['S', 'r', 'G', 'M', 'P', 'd', 'N', "S'"],
    vadi: 'd',
    time: 'Dawn',
    mood: 'Solemn and devotional',
  },
  {
    id: 'kafi',
    name: 'Kafi',
    swaras: ['S', 'R', 'g', 'M', 'P', 'D', 'n', "S'"],
    vadi: 'P',
    time: 'Late evening',
    mood: 'Playful and folk-like',
  },
  {
    id: 'bhupali',
    name: 'Bhupali',
    swaras: ['S', 'R', 'G', 'P', 'D', "S'"],
    vadi: 'G',
    time: 'Night',
    mood: 'Peaceful and meditative (pentatonic)',
  },
  {
    id: 'khamaj',
    name: 'Khamaj',
    swaras: ['S', 'R', 'G', 'M', 'P', 'D', 'n', "S'"],
    vadi: 'G',
    time: 'Night',
    mood: 'Light and sweet',
  },
];

export const RAGA_BY_ID: Record<string, Raga> = RAGAS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<string, Raga>
);

export type Tonic = {
  id: string;
  name: string;
  /** Frequency of Sa in Hz. */
  frequency: number;
};

/** Common tonic choices (Sa) with their Western note names, from low to high. */
export const TONICS: Tonic[] = [
  { id: 'A3', name: 'A (low)', frequency: 220 },
  { id: 'Bb3', name: 'B♭', frequency: 233.08 },
  { id: 'B3', name: 'B', frequency: 246.94 },
  { id: 'C4', name: 'C', frequency: 261.63 },
  { id: 'C#4', name: 'C♯ (harmonium)', frequency: 277.18 },
  { id: 'D4', name: 'D', frequency: 293.66 },
  { id: 'Eb4', name: 'E♭', frequency: 311.13 },
  { id: 'E4', name: 'E', frequency: 329.63 },
  { id: 'F4', name: 'F', frequency: 349.23 },
  { id: 'G4', name: 'G (high)', frequency: 392.0 },
];

export const DEFAULT_TONIC_ID = 'C4';
export const DEFAULT_RAGA_ID = 'yaman';

/** Frequency in Hz of a swara for a given tonic (Sa) frequency, using just intonation. */
export function swaraFrequency(swara: SwaraId, tonicHz: number): number {
  return tonicHz * SWARA_BY_ID[swara].ratio;
}

/** Equal-tempered frequency, useful for comparison/tests. */
export function swaraFrequencyEqualTempered(swara: SwaraId, tonicHz: number): number {
  return tonicHz * Math.pow(2, SWARA_BY_ID[swara].semitones / 12);
}

export function isSwaraInRaga(swara: SwaraId, raga: Raga): boolean {
  return raga.swaras.includes(swara);
}

/** Swaras of a raga as full objects, ascending. */
export function ragaSwaras(raga: Raga): Swara[] {
  return SWARAS.filter((s) => raga.swaras.includes(s.id));
}
