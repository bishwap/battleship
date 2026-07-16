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

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', startOffset = 0, endOffset = 0) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const t = ctx.currentTime;
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

  playSound(event: FeedbackEvent) {
    if (!state.sound) return;
    switch (event) {
      case 'tap':
        playTone(800, 0.06);
        break;
      case 'miss':
        playTone(300, 0.12, 'sine');
        break;
      case 'hit':
        playTone(600, 0.12, 'square');
        break;
      case 'sunk':
        playTone(300, 0.35, 'sawtooth', 0, -200);
        break;
      case 'win':
        playTone(523, 0.2, 'sine');
        setTimeout(() => playTone(659, 0.2, 'sine'), 120);
        setTimeout(() => playTone(784, 0.3, 'sine'), 240);
        break;
      case 'lose':
        playTone(300, 0.3, 'sawtooth', 0, -100);
        setTimeout(() => playTone(200, 0.4, 'sawtooth', 0, -100), 250);
        break;
    }
  },

  triggerHaptic(event: Exclude<FeedbackEvent, 'win' | 'lose'>) {
    if (!state.haptics || typeof navigator === 'undefined' || !navigator.vibrate) return;
    navigator.vibrate(hapticPattern(event));
  },
};
