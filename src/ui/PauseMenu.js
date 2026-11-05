export class PauseMenu {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop hidden';
    this.container.appendChild(this.element);

    this.render();
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-card anime-card pause-card">
        <div class="modal-header">
          <div class="logo-badge">⏸️ GAME PAUSED</div>
        </div>
        <div class="pause-actions-stack">
          <button class="anime-btn gold-btn" id="pause-resume-btn">RESUME GAME</button>
          <button class="anime-btn primary-btn" id="pause-restart-btn">RESTART RUN</button>
          <button class="anime-btn secondary-btn" id="pause-settings-btn">SETTINGS</button>
          <button class="anime-btn secondary-btn" id="pause-menu-btn">MAIN MENU</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.element.querySelector('#pause-resume-btn').addEventListener('click', () => {
      if (this.callbacks.onResume) this.callbacks.onResume();
    });
    this.element.querySelector('#pause-restart-btn').addEventListener('click', () => {
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });
    this.element.querySelector('#pause-settings-btn').addEventListener('click', () => {
      if (this.callbacks.onSettings) this.callbacks.onSettings();
    });
    this.element.querySelector('#pause-menu-btn').addEventListener('click', () => {
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
