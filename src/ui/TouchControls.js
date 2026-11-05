export class TouchControls {
  constructor(container, onAction) {
    this.container = container;
    this.onAction = onAction;

    this.element = document.createElement('div');
    this.element.className = 'touch-controls-overlay hidden';
    this.element.innerHTML = `
      <div class="touch-dpad-left">
        <button class="touch-btn touch-btn-left" id="btn-touch-left" aria-label="Move Left">&larr;</button>
        <button class="touch-btn touch-btn-right" id="btn-touch-right" aria-label="Move Right">&rarr;</button>
      </div>

      <div class="touch-dpad-right">
        <button class="touch-btn touch-btn-ssj hidden" id="btn-touch-ssj" aria-label="Super Saiyan">⚡</button>
        <button class="touch-btn touch-btn-jump" id="btn-touch-jump" aria-label="Jump">&uarr;</button>
        <button class="touch-btn touch-btn-slide" id="btn-touch-slide" aria-label="Slide">&darr;</button>
      </div>
    `;

    this.container.appendChild(this.element);
    this.ssjBtn = this.element.querySelector('#btn-touch-ssj');

    this.bindEvents();
  }

  bindEvents() {
    let lastActionTime = 0;
    const triggerAction = (action) => {
      const now = performance.now();
      if (now - lastActionTime < 60) return; // Debounce rapid pointer/touch duplicates
      lastActionTime = now;
      if (this.onAction) this.onAction(action);
    };

    const bindButton = (id, action) => {
      const btn = this.element.querySelector(id);
      if (!btn) return;

      const handlePress = (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerAction(action);
      };

      btn.addEventListener('pointerdown', handlePress, { passive: false });
      btn.addEventListener('touchstart', handlePress, { passive: false });
    };

    bindButton('#btn-touch-left', 'MOVE_LEFT');
    bindButton('#btn-touch-right', 'MOVE_RIGHT');
    bindButton('#btn-touch-jump', 'JUMP');
    bindButton('#btn-touch-slide', 'SLIDE');
    bindButton('#btn-touch-ssj', 'ACTIVATE_ABILITY');
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  setOpacity(opacityPercent) {
    this.element.style.opacity = (opacityPercent / 100).toString();
  }

  updateKiState(canTransform) {
    if (canTransform) {
      this.ssjBtn.classList.remove('hidden');
    } else {
      this.ssjBtn.classList.add('hidden');
    }
  }
}
