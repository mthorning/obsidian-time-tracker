export class Clock {
  timerIntervalId: number | null = null;
  fn: () => void;

  constructor(fn: () => void) {
    this.fn = fn
  }

  start() {
    if (this.timerIntervalId) {
      window.clearInterval(this.timerIntervalId);
    }
    this.timerIntervalId = window.setInterval(this.fn, 500);
  }

  stop() {
    if (this.timerIntervalId) {
      window.clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }
}
