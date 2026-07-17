export type FeedbackEvent = 'tap' | 'miss' | 'hit' | 'sunk' | 'win' | 'lose';

interface FeedbackState {
  sound: boolean;
  haptics: boolean;
}

const state: FeedbackState = {
  sound: true,
  haptics: true,
};

let audioCtx: AudioContext | null = null;

async function ensureAudioContext(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null;

  const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext | undefined;
  if (!Ctx) return null;

  if (!audioCtx) {
    audioCtx = new Ctx();
  }

  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      // Ignore autoplay restrictions; audio will simply not play this time.
    }
  }

  return audioCtx;
}

async function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', startOffset = 0, endOffset = 0, when?: number) {
  const ctx = await ensureAudioContext();
  if (!ctx) return;

  const t = when ?? ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, t);
  if (startOffset !== 0 || endOffset !== 0) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, frequency + endOffset), t + duration);
  }

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(t);
  oscillator.stop(t + duration);
}

function hapticPattern(event: Exclude<FeedbackEvent, 'win' | 'lose'>) {
  switch (event) {
    case 'tap':
      return [10];
    case 'miss':
      return [20];
    case 'hit':
      return [50];
    case 'sunk':
      return [80, 30, 80];
    default:
      return [10];
  }
}

export const feedback = {
  init(settings: Partial<FeedbackState>) {
    state.sound = settings.sound ?? true;
    state.haptics = settings.haptics ?? true;
  },

  setSoundEnabled(enabled: boolean) {
    state.sound = enabled;
  },

  setHapticsEnabled(enabled: boolean) {
    state.haptics = enabled;
  },

  async playSound(event: FeedbackEvent) {
    if (!state.sound) return;
    switch (event) {
      case 'tap':
        await playTone(800, 0.06);
        break;
      case 'miss':
        await playTone(300, 0.12, 'sine');
        break;
      case 'hit':
        await playTone(600, 0.12, 'square');
        break;
      case 'sunk':
        await playTone(300, 0.35, 'sawtooth', 0, -200);
        break;
      case 'win':
        await playTone(523, 0.2, 'sine');
        setTimeout(() => playTone(659, 0.2, 'sine'), 120);
        setTimeout(() => playTone(784, 0.3, 'sine'), 240);
        break;
      case 'lose':
        await playTone(300, 0.3, 'sawtooth', 0, -100);
        setTimeout(() => playTone(200, 0.4, 'sawtooth', 0, -100), 250);
        break;
    }
  },

  triggerHaptic(event: Exclude<FeedbackEvent, 'win' | 'lose'>) {
    if (!state.haptics || typeof navigator === 'undefined' || !navigator.vibrate) return;
    navigator.vibrate(hapticPattern(event));
  },

  async playIntro() {
    if (!state.sound) return;
    const ctx = await ensureAudioContext();
    if (!ctx) return;

    // Short pirate-flavored fanfare (approximation of a famous sea-faring theme)
    const now = ctx.currentTime;
    const notes = [
      { freq: 293.66, dur: 0.18 }, // D4
      { freq: 329.63, dur: 0.18 }, // E4
      { freq: 369.99, dur: 0.18 }, // F#4
      { freq: 392.0, dur: 0.18 },  // G4
      { freq: 440.0, dur: 0.36 },  // A4
      { freq: 392.0, dur: 0.18 },  // G4
      { freq: 369.99, dur: 0.18 }, // F#4
      { freq: 329.63, dur: 0.18 }, // E4
      { freq: 293.66, dur: 0.54 }, // D4
    ];
    let offset = 0;
    notes.forEach(({ freq, dur }) => {
      playTone(freq, dur, 'triangle', 0, 0, now + offset);
      offset += dur + 0.03;
    });
  },
};
