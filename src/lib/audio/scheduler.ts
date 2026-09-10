import { getAudioContext, resumeAudio } from './context';

export type StepCallback = (step: number, when: number) => void;

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;

/**
 * Look-ahead step scheduler (the standard "tale of two clocks" pattern):
 * a setInterval timer wakes up frequently and schedules any steps that fall
 * within the next SCHEDULE_AHEAD_S seconds using precise AudioContext time.
 */
export class StepScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private stepCount = 16;
  private bpm = 90;
  private onStep: StepCallback | null = null;
  private onVisualStep: ((step: number) => void) | null = null;

  get isRunning(): boolean {
    return this.timer !== null;
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  setStepCount(count: number): void {
    this.stepCount = count;
    if (this.currentStep >= count) this.currentStep = 0;
  }

  async start(opts: {
    bpm: number;
    stepCount: number;
    onStep: StepCallback;
    onVisualStep: (step: number) => void;
  }): Promise<boolean> {
    const ctx = await resumeAudio();
    if (!ctx) return false;
    this.stop();
    this.bpm = opts.bpm;
    this.stepCount = opts.stepCount;
    this.onStep = opts.onStep;
    this.onVisualStep = opts.onVisualStep;
    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.tick(), LOOKAHEAD_MS);
    return true;
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.currentStep = 0;
  }

  private tick(): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    while (this.nextStepTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const step = this.currentStep;
      const when = this.nextStepTime;
      this.onStep?.(step, when);
      const delayMs = Math.max(0, (when - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (this.isRunning) this.onVisualStep?.(step);
      }, delayMs);
      this.nextStepTime += 60 / this.bpm;
      this.currentStep = (this.currentStep + 1) % this.stepCount;
    }
  }
}
