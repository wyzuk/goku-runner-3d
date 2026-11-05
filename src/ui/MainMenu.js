export class MainMenu {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.element = document.createElement('div');
    this.element.className = 'main-menu-overlay';
    this.container.appendChild(this.element);

    this.render();
  }

  render(profile = {}) {
    const level = profile.level || 1;
    const highScore = profile.highScore || 0;

    this.element.innerHTML = `
      <div class="menu-container anime-fade-in">
        <div class="menu-top-stats">
          <div class="mini-rank-badge">
            <span class="rank-star">⭐</span>
            <span class="rank-text">SAIYAN LVL ${level}</span>
          </div>
          <div class="mini-score-badge">
            <span class="score-label">BEST:</span>
            <span class="score-num">${highScore.toLocaleString()}</span>
          </div>
        </div>

        <div class="menu-logo-hero">
          <h1 class="logo-title">
            <span class="logo-goku">WYZUK</span>
            <span class="logo-runner">GOKU RUN</span>
          </h1>
          <div class="logo-subtitle">SUPER SAIYAN ENDLESS RUNNER</div>
          <div class="author-credit-tag">Created by Wyzuk</div>
        </div>

        <div class="menu-actions-stack">
          <button class="anime-btn gold-btn play-main-btn" id="menu-play-btn">
            <span class="btn-icon">⚡</span>
            <span class="btn-text">PLAY RUN</span>
          </button>
          <button class="anime-btn primary-btn" id="menu-tutorial-btn">
            <span class="btn-icon">📖</span>
            <span class="btn-text">HOW TO PLAY</span>
          </button>
          <button class="anime-btn secondary-btn" id="menu-profile-btn">
            <span class="btn-icon">🥋</span>
            <span class="btn-text">WARRIOR PROFILE</span>
          </button>
          <button class="anime-btn secondary-btn" id="menu-settings-btn">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">SETTINGS</span>
          </button>
          <button class="anime-btn secondary-btn" id="menu-about-btn">
            <span class="btn-icon">ℹ️</span>
            <span class="btn-text">ABOUT & CREDITS</span>
          </button>
        </div>

        <div class="menu-footer">
          <div class="menu-keys-hint">WASD / Arrow Keys to Move &bull; Space to Jump &bull; E / Shift for Super Saiyan</div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.element.querySelector('#menu-play-btn').addEventListener('click', () => {
      if (this.callbacks.onPlay) this.callbacks.onPlay();
    });
    this.element.querySelector('#menu-tutorial-btn').addEventListener('click', () => {
      if (this.callbacks.onTutorial) this.callbacks.onTutorial();
    });
    this.element.querySelector('#menu-profile-btn').addEventListener('click', () => {
      if (this.callbacks.onProfile) this.callbacks.onProfile();
    });
    this.element.querySelector('#menu-settings-btn').addEventListener('click', () => {
      if (this.callbacks.onSettings) this.callbacks.onSettings();
    });
    this.element.querySelector('#menu-about-btn').addEventListener('click', () => {
      if (this.callbacks.onAbout) this.callbacks.onAbout();
    });
  }

  show(profile) {
    this.render(profile);
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
