// Development Debug HUD for Phase 00 validation
import { LANE_NAMES, LANES } from '../utils/Constants.js';

export class DebugHUD {
  constructor(container) {
    this.container = container;
    this.enabled = false;
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();

    this.element = document.createElement('div');
    this.element.id = 'dev-debug-hud';
    this.element.className = 'debug-hud hidden';
    this.element.innerHTML = `
      <div class="debug-panel">
        <div class="debug-title">GOKU RUNNER 3D — DEBUG MONITOR (F3 / B)</div>
        <div class="debug-grid">
          <div><strong>LANE:</strong> <span id="dbg-lane">CENTER (0)</span></div>
          <div><strong>PLAYER X:</strong> <span id="dbg-x">0.00 m</span></div>
          <div><strong>TARGET X:</strong> <span id="dbg-target-x">0.00 m</span></div>
          <div><strong>DIR:</strong> <span id="dbg-dir">NONE</span></div>
          <div><strong>STATE:</strong> <span id="dbg-state">GROUNDED</span></div>
          <div><strong>SPEED:</strong> <span id="dbg-speed">14.0 m/s</span></div>
          <div><strong>CAM POS:</strong> <span id="dbg-cam">(0.0, 3.2, -6.6)</span></div>
          <div><strong>FPS:</strong> <span id="dbg-fps">60</span></div>
          <div><strong>RENDER RES:</strong> <span id="dbg-res">1920x1080</span></div>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.elLane = this.element.querySelector('#dbg-lane');
    this.elX = this.element.querySelector('#dbg-x');
    this.elTargetX = this.element.querySelector('#dbg-target-x');
    this.elDir = this.element.querySelector('#dbg-dir');
    this.elState = this.element.querySelector('#dbg-state');
    this.elSpeed = this.element.querySelector('#dbg-speed');
    this.elCam = this.element.querySelector('#dbg-cam');
    this.elFps = this.element.querySelector('#dbg-fps');
    this.elRes = this.element.querySelector('#dbg-res');
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.element.classList.remove('hidden');
    } else {
      this.element.classList.add('hidden');
    }
    return this.enabled;
  }

  update(game) {
    if (!this.enabled) return;

    // Calculate FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastTime >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
    }

    const physics = game.physics;
    const laneIndex = physics.currentLane; // 0 (LEFT), 1 (CENTER), 2 (RIGHT)
    const laneName = LANE_NAMES[laneIndex] || 'UNKNOWN';
    const targetX = physics.targetLaneX;
    const currentX = physics.position.x;
    const dx = targetX - currentX;

    let dirText = 'STEADY';
    if (Math.abs(dx) > 0.05) {
      // Remember: +X is Left on screen, -X is Right on screen
      dirText = dx > 0 ? '← MOVING LEFT' : '→ MOVING RIGHT';
    }

    let stateText = 'GROUNDED';
    if (physics.isSliding) stateText = 'SLIDING';
    else if (!physics.isGrounded) stateText = 'AIRBORNE (JUMP)';

    const cam = game.camera.position;
    const camStr = `(${cam.x.toFixed(1)}, ${cam.y.toFixed(1)}, ${cam.z.toFixed(1)})`;

    this.elLane.textContent = `${laneName} (index ${laneIndex - 1})`;
    this.elX.textContent = `${currentX >= 0 ? '+' : ''}${currentX.toFixed(2)} m`;
    this.elTargetX.textContent = `${targetX >= 0 ? '+' : ''}${targetX.toFixed(2)} m`;
    this.elDir.textContent = dirText;
    this.elState.textContent = stateText;
    this.elSpeed.textContent = `${physics.getCurrentSpeed().toFixed(1)} m/s`;
    this.elCam.textContent = camStr;
    this.elFps.textContent = `${this.fps}`;
    this.elRes.textContent = `${window.innerWidth}x${window.innerHeight} (${(window.devicePixelRatio || 1).toFixed(1)}x)`;
  }
}
