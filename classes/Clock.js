export class Clock {
    constructor(fn) {
        this.timerIntervalId = null;
        this.fn = fn;
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
//# sourceMappingURL=Clock.js.map