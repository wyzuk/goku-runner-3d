export class InputManager {
  constructor() {
    this.actionListeners = [];
    this.isEnabled = true;
    this.heldKeys = new Set();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 30; // pixels
    this.maxSwipeTime = 500; // ms

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.attach();
  }

  attach() {
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
    this.clearState();
  }

  clearState() {
    this.heldKeys.clear();
  }

  onWindowBlur() {
    this.clearState();
  }

  onAction(callback) {
    this.actionListeners.push(callback);
  }

  dispatch(action) {
    for (const listener of this.actionListeners) {
      listener(action);
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearState();
    }
  }

  onKeyUp(e) {
    this.heldKeys.delete(e.code);
  }

  onKeyDown(e) {
    const code = e.code;
    const key = e.key.toLowerCase();

    // Pause toggle is always allowed even if game input is paused
    if (code === 'Escape' || code === 'KeyP' || key === 'p') {
      e.preventDefault();
      this.dispatch('PAUSE');
      return;
    }

    // Toggle Debug mode (F3 or B)
    if (code === 'KeyB' || key === 'b' || code === 'F3') {
      e.preventDefault();
      this.dispatch('TOGGLE_DEBUG');
      return;
    }

    if (!this.isEnabled) return;

    // Prevent default scrolling for gameplay keys
    const isGameplayKey = [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space',
      'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyE', 'ShiftLeft', 'ShiftRight'
    ].includes(code);

    if (isGameplayKey) {
      e.preventDefault();
    }

    // Discrete action gating - avoid accidental repeats on held keys
    if (e.repeat && (code === 'KeyW' || code === 'ArrowUp' || code === 'Space' || code === 'KeyE' || code === 'ShiftLeft' || code === 'ShiftRight')) {
      return;
    }

    this.heldKeys.add(code);

    // Left: A or Left Arrow
    if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') {
      this.dispatch('MOVE_LEFT');
    }
    // Right: D or Right Arrow
    else if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') {
      this.dispatch('MOVE_RIGHT');
    }
    // Jump: W or Up Arrow or Space
    else if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space' || key === 'w') {
      this.dispatch('JUMP');
    }
    // Slide: S or Down Arrow
    else if (code === 'ArrowDown' || code === 'KeyS' || key === 's') {
      this.dispatch('SLIDE');
    }
    // Special Ability / Super Saiyan: E or Shift
    else if (code === 'KeyE' || code === 'ShiftLeft' || code === 'ShiftRight' || key === 'e') {
      this.dispatch('ACTIVATE_ABILITY');
    }
  }

  onTouchStart(e) {
    if (!this.isEnabled || e.touches.length === 0) return;
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  onTouchEnd(e) {
    if (!this.isEnabled || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const dt = Date.now() - this.touchStartTime;

    if (dt > this.maxSwipeTime) return;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < this.minSwipeDistance) return;

    if (absX > absY) {
      // Horizontal swipe
      if (dx > 0) {
        this.dispatch('MOVE_RIGHT');
      } else {
        this.dispatch('MOVE_LEFT');
      }
    } else {
      // Vertical swipe
      if (dy > 0) {
        this.dispatch('SLIDE');
      } else {
        this.dispatch('JUMP');
      }
    }
  }
}
