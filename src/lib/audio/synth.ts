import { getAudioContext, getMasterGain } from './context';

/**
 * Plays a plucked, sitar-ish note: a bright sawtooth through a low-pass filter
 * with a quick attack and exponential decay, plus a soft sine body.
 */
export function playSwara(frequency: number, when: number, duration: number, velocity = 0.6): void {
  const ctx = getAudioContext();
  const out = getMasterGain();
  if (!ctx || !out) return;

  const t = Math.max(when, ctx.currentTime);
  const end = t + duration;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(frequency * 6, t);
  filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, end);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(velocity * 0.35, t + 0.008);
  env.gain.exponentialRampToValueAtTime(velocity * 0.15, t + Math.min(0.12, duration * 0.4));
  env.gain.exponentialRampToValueAtTime(0.0001, end);

  const bright = ctx.createOscillator();
  bright.type = 'sawtooth';
  bright.frequency.setValueAtTime(frequency, t);

  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(frequency, t);
  const bodyGain = ctx.createGain();
  bodyGain.gain.value = 0.6;

  bright.connect(filter);
  body.connect(bodyGain);
  bodyGain.connect(filter);
  filter.connect(env);
  env.connect(out);

  bright.start(t);
  body.start(t);
  bright.stop(end + 0.05);
  body.stop(end + 0.05);
}
