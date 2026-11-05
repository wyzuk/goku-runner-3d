export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.isRunning = false;
    this.lastTime = 0;
    this.reqId = null;

    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.reqId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.isRunning = false;
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }
  }

  tick(currentTime) {
    if (!this.isRunning) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta time to avoid large jumps when switching tabs
    dt = Math.min(dt, 0.1);

    this.updateFn(dt, currentTime / 1000);
    this.renderFn();

    this.reqId = requestAnimationFrame(this.tick);
  }
}
