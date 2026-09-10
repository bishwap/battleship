import { getAudioContext, getMasterGain } from './context';

type Voice = { osc: OscillatorNode; gain: GainNode };

/**
 * Tanpura-style drone: continuously sustained Sa (lower octave and middle) and Pa,
 * each with slow amplitude "plucks" to imitate the cyclic strumming of a tanpura.
 */
export class Drone {
  private voices: Voice[] = [];
  private bus: GainNode | null = null;
  private lfoNodes: AudioNode[] = [];

  get isRunning(): boolean {
    return this.voices.length > 0;
  }

  start(tonicHz: number, volume = 0.25): void {
    const ctx = getAudioContext();
    const out = getMasterGain();
    if (!ctx || !out) return;
    this.stop();

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 1.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    bus.connect(filter);
    filter.connect(out);
    this.bus = bus;

    const strings: { freq: number; level: number; period: number; phase: number }[] = [
      { freq: (tonicHz / 2) * 1.5, level: 0.5, period: 4, phase: 0 }, // low Pa
      { freq: tonicHz, level: 0.7, period: 4, phase: 1 }, // Sa
      { freq: tonicHz, level: 0.5, period: 4, phase: 2 }, // Sa (second string, slightly detuned)
      { freq: tonicHz / 2, level: 0.8, period: 4, phase: 3 }, // low Sa
    ];

    strings.forEach((s, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = s.freq * (i === 2 ? 1.003 : 1);

      const gain = ctx.createGain();
      gain.gain.value = s.level * 0.5;

      // Slow tremolo to imitate the strum cycle.
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1 / s.period;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = s.level * 0.3;
      lfo.connect(lfoDepth);
      lfoDepth.connect(gain.gain);
      lfo.start(ctx.currentTime + (s.phase * s.period) / strings.length);
      this.lfoNodes.push(lfo);

      osc.connect(gain);
      gain.connect(bus);
      osc.start();
      this.voices.push({ osc, gain });
    });
  }

  setTonic(tonicHz: number): void {
    if (!this.isRunning) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const targets = [(tonicHz / 2) * 1.5, tonicHz, tonicHz * 1.003, tonicHz / 2];
    this.voices.forEach((v, i) => {
      v.osc.frequency.setTargetAtTime(targets[i], ctx.currentTime, 0.05);
    });
  }

  stop(): void {
    const ctx = getAudioContext();
    if (this.bus && ctx) {
      const bus = this.bus;
      bus.gain.cancelScheduledValues(ctx.currentTime);
      bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
      bus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      const voices = this.voices;
      const lfos = this.lfoNodes;
      setTimeout(() => {
        voices.forEach((v) => {
          try {
            v.osc.stop();
          } catch {
            // already stopped
          }
        });
        lfos.forEach((n) => {
          try {
            (n as OscillatorNode).stop();
          } catch {
            // already stopped
          }
        });
        bus.disconnect();
      }, 700);
    }
    this.voices = [];
    this.lfoNodes = [];
    this.bus = null;
  }
}
