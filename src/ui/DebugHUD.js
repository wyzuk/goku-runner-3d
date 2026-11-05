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
        <div class="debug-title">WYZUK GOKU RUN — DEBUG MONITOR (F3 / B)</div>
        <div class="debug-grid">
          <div><strong>LANE:</strong> <span id="dbg-lane">CENTER (0)</span></div>
          <div><strong>PLAYER X:</strong> <span id="dbg-x">0.00 m</span></div>
          <div><strong>STATE:</strong> <span id="dbg-state">GROUNDED</span></div>
          <div><strong>SPEED:</strong> <span id="dbg-speed">14.0 m/s</span></div>
          <div><strong>FPS:</strong> <span id="dbg-fps">60</span></div>
          <div><strong>DRAWCALLS:</strong> <span id="dbg-calls">0</span></div>
          <div><strong>TRIANGLES:</strong> <span id="dbg-tris">0</span></div>
          <div><strong>PRESET:</strong> <span id="dbg-preset">HIGH</span></div>
          <div><strong>BIOME:</strong> <span id="dbg-biome">VALLEY</span></div>
          <div><strong>CAM POS:</strong> <span id="dbg-cam">(0.0, 3.2, -6.6)</span></div>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.elLane = this.element.querySelector('#dbg-lane');
    this.elX = this.element.querySelector('#dbg-x');
    this.elState = this.element.querySelector('#dbg-state');
    this.elSpeed = this.element.querySelector('#dbg-speed');
    this.elFps = this.element.querySelector('#dbg-fps');
    this.elCalls = this.element.querySelector('#dbg-calls');
    this.elTris = this.element.querySelector('#dbg-tris');
    this.elPreset = this.element.querySelector('#dbg-preset');
    this.elBiome = this.element.querySelector('#dbg-biome');
    this.elCam = this.element.querySelector('#dbg-cam');
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
    this.elState.textContent = stateText;
    this.elSpeed.textContent = `${physics.getCurrentSpeed().toFixed(1)} m/s`;
    this.elCam.textContent = camStr;
    this.elFps.textContent = `${this.fps}`;

    if (game.renderer && game.renderer.info) {
      this.elCalls.textContent = `${game.renderer.info.render.calls}`;
      this.elTris.textContent = `${game.renderer.info.render.triangles.toLocaleString()}`;
    }
    this.elPreset.textContent = game.graphicsQuality || 'HIGH';
    this.elBiome.textContent = (game.world && game.world.chunkManager) ? game.world.chunkManager.currentBiome : 'VALLEY';
  }
}
