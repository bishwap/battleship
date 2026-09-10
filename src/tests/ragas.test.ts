import { describe, expect, it } from 'vitest';
import {
  RAGAS,
  RAGA_BY_ID,
  SWARAS,
  TONICS,
  isSwaraInRaga,
  ragaSwaras,
  swaraFrequency,
  swaraFrequencyEqualTempered,
} from '../lib/ragas';
import { TAALS, strokeForBeat } from '../lib/audio/tabla';

describe('swara frequencies', () => {
  it('Sa equals the tonic and upper Sa is one octave higher', () => {
    expect(swaraFrequency('S', 261.63)).toBeCloseTo(261.63);
    expect(swaraFrequency("S'", 261.63)).toBeCloseTo(523.26);
  });

  it('Pa is a perfect fifth (3:2) above Sa', () => {
    expect(swaraFrequency('P', 200)).toBeCloseTo(300);
  });

  it('just-intonation frequencies stay within ~1.2% of equal temperament', () => {
    for (const s of SWARAS) {
      const just = swaraFrequency(s.id, 440);
      const et = swaraFrequencyEqualTempered(s.id, 440);
      expect(Math.abs(just - et) / et).toBeLessThan(0.012);
    }
  });

  it('frequencies are strictly ascending across the octave', () => {
    const freqs = SWARAS.map((s) => swaraFrequency(s.id, 261.63));
    for (let i = 1; i < freqs.length; i++) expect(freqs[i]).toBeGreaterThan(freqs[i - 1]);
  });

  it('scales with the selected tonic', () => {
    const low = TONICS.find((t) => t.id === 'A3')!;
    const high = TONICS.find((t) => t.id === 'G4')!;
    expect(swaraFrequency('G', high.frequency) / swaraFrequency('G', low.frequency)).toBeCloseTo(
      high.frequency / low.frequency
    );
  });
});

describe('raga definitions', () => {
  it('every raga starts on Sa and ends on upper Sa', () => {
    for (const r of RAGAS) {
      expect(r.swaras[0]).toBe('S');
      expect(r.swaras[r.swaras.length - 1]).toBe("S'");
      expect(r.swaras).toContain(r.vadi);
    }
  });

  it('Yaman uses tivra Ma, Bilawal uses shuddha Ma, Bhairav uses komal Re and Dha', () => {
    expect(isSwaraInRaga('m', RAGA_BY_ID.yaman)).toBe(true);
    expect(isSwaraInRaga('M', RAGA_BY_ID.yaman)).toBe(false);
    expect(isSwaraInRaga('M', RAGA_BY_ID.bilawal)).toBe(true);
    expect(isSwaraInRaga('r', RAGA_BY_ID.bhairav)).toBe(true);
    expect(isSwaraInRaga('d', RAGA_BY_ID.bhairav)).toBe(true);
    expect(isSwaraInRaga('R', RAGA_BY_ID.bhairav)).toBe(false);
  });

  it('ragaSwaras returns full swara objects in ascending order', () => {
    const names = ragaSwaras(RAGA_BY_ID.bhupali).map((s) => s.name);
    expect(names).toEqual(['Sa', 'Re', 'Ga', 'Pa', 'Dha', "Sa'"]);
  });
});

describe('taals', () => {
  it('each taal has one bol per beat and starts its vibhags at the sam', () => {
    for (const t of TAALS) {
      expect(t.bols).toHaveLength(t.beats);
      expect(t.vibhags[0]).toBe(0);
    }
  });

  it('strokeForBeat wraps around the cycle', () => {
    const teentaal = TAALS.find((t) => t.id === 'teentaal')!;
    expect(strokeForBeat(teentaal, 0)).toBe('dha');
    expect(strokeForBeat(teentaal, 16)).toBe('dha');
    expect(strokeForBeat(teentaal, 9)).toBe('tin');
  });
});
