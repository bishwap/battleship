import { getAudioContext, getMasterGain } from './context';

export type TablaStroke = 'dha' | 'dhin' | 'na' | 'tin' | 'ge' | 'ke' | 'rest';

export type Taal = {
  id: string;
  name: string;
  beats: number;
  /** One stroke per beat (matra). */
  bols: TablaStroke[];
  /** Beat indices (0-based) that begin a vibhag (section); index 0 is the sam. */
  vibhags: number[];
};

export const TAALS: Taal[] = [
  {
    id: 'teentaal',
    name: 'Teentaal (16)',
    beats: 16,
    bols: ['dha', 'dhin', 'dhin', 'dha', 'dha', 'dhin', 'dhin', 'dha', 'dha', 'tin', 'tin', 'na', 'na', 'dhin', 'dhin', 'dha'],
    vibhags: [0, 4, 8, 12],
  },
  {
    id: 'keherwa',
    name: 'Keherwa (8)',
    beats: 8,
    bols: ['dha', 'ge', 'na', 'tin', 'na', 'ke', 'dhin', 'na'],
    vibhags: [0, 4],
  },
  {
    id: 'dadra',
    name: 'Dadra (6)',
    beats: 6,
    bols: ['dha', 'dhin', 'na', 'dha', 'tin', 'na'],
    vibhags: [0, 3],
  },
  {
    id: 'rupak',
    name: 'Rupak (7)',
    beats: 7,
    bols: ['tin', 'tin', 'na', 'dhin', 'na', 'dhin', 'na'],
    vibhags: [0, 3, 5],
  },
];

export const TAAL_BY_ID: Record<string, Taal> = TAALS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<string, Taal>
);

/** Stroke for a given beat index of a taal, cycling if the sequence is longer than the taal. */
export function strokeForBeat(taal: Taal, beat: number): TablaStroke {
  return taal.bols[beat % taal.beats];
}

let noiseBuffer: AudioBuffer | null = null;

function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Bayan (bass drum) hit with a pitch bend, used for "ge" and the low part of "dha"/"dhin". */
function bayan(ctx: AudioContext, out: AudioNode, t: number, tonicHz: number, level: number, bend: boolean) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const base = tonicHz / 2;
  osc.frequency.setValueAtTime(base * (bend ? 0.8 : 1), t);
  if (bend) osc.frequency.exponentialRampToValueAtTime(base * 1.3, t + 0.25);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + 0.45);
}

/** Dayan (treble drum) resonant hit tuned to the tonic, used for "na"/"tin"/"dhin". */
function dayan(ctx: AudioContext, out: AudioNode, t: number, tonicHz: number, level: number, open: boolean) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(tonicHz * 2, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.35 : 0.12));
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + 0.4);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoise(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3000;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(level * 0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  noise.connect(hp);
  hp.connect(ng);
  ng.connect(out);
  noise.start(t);
  noise.stop(t + 0.06);
}

/** Closed slap ("ke"). */
function slap(ctx: AudioContext, out: AudioNode, t: number, level: number) {
  const noise = ctx.createBufferSource();
  noise.buffer = getNoise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1200;
  bp.Q.value = 1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(level, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  noise.connect(bp);
  bp.connect(g);
  g.connect(out);
  noise.start(t);
  noise.stop(t + 0.1);
}

export function playTablaStroke(stroke: TablaStroke, when: number, tonicHz: number, volume = 0.5): void {
  const ctx = getAudioContext();
  const out = getMasterGain();
  if (!ctx || !out || stroke === 'rest') return;
  const t = Math.max(when, ctx.currentTime);
  switch (stroke) {
    case 'dha':
      bayan(ctx, out, t, tonicHz, volume * 0.9, true);
      dayan(ctx, out, t, tonicHz, volume * 0.5, true);
      break;
    case 'dhin':
      bayan(ctx, out, t, tonicHz, volume * 0.6, false);
      dayan(ctx, out, t, tonicHz, volume * 0.5, true);
      break;
    case 'na':
      dayan(ctx, out, t, tonicHz, volume * 0.6, true);
      break;
    case 'tin':
      dayan(ctx, out, t, tonicHz, volume * 0.45, false);
      break;
    case 'ge':
      bayan(ctx, out, t, tonicHz, volume * 0.9, true);
      break;
    case 'ke':
      slap(ctx, out, t, volume * 0.5);
      break;
  }
}
