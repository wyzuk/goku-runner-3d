export class GameOverModal {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop hidden';
    this.container.appendChild(this.element);
  }

  show(results) {
    const isNewHigh = results.score > results.previousBest;
    const gainedXp = Math.floor(results.distance * 0.4 + results.dragonBalls * 80 + results.score * 0.05);

    this.element.innerHTML = `
      <div class="modal-card anime-card game-over-card">
        <div class="game-over-header">
          <div class="ko-badge">💥 RUN FINISHED 💥</div>
          ${isNewHigh ? '<div class="new-best-badge">🏆 NEW HIGH SCORE!</div>' : ''}
        </div>

        <div class="results-stats-grid">
          <div class="result-box primary-result">
            <span class="res-label">FINAL SCORE</span>
            <span class="res-num">${results.score.toLocaleString()}</span>
          </div>
          <div class="result-box">
            <span class="res-label">DISTANCE</span>
            <span class="res-num">${results.distance.toLocaleString()} m</span>
          </div>
          <div class="result-box">
            <span class="res-label">DRAGON BALLS</span>
            <span class="res-num">🔮 ${results.dragonBalls} / 7</span>
          </div>
          <div class="result-box">
            <span class="res-label">MAX COMBO</span>
            <span class="res-num">🔥 ${results.maxCombo}x</span>
          </div>
        </div>

        <div class="results-xp-award">
          <div class="xp-award-text">+${gainedXp.toLocaleString()} XP Earned!</div>
        </div>

        <div class="game-over-actions">
          <button class="anime-btn gold-btn large-btn" id="game-over-retry-btn">
            ⚡ PLAY AGAIN
          </button>
          <button class="anime-btn secondary-btn" id="game-over-menu-btn">
            MAIN MENU
          </button>
        </div>
      </div>
    `;

    this.element.querySelector('#game-over-retry-btn').addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onRetry) this.callbacks.onRetry();
    });

    this.element.querySelector('#game-over-menu-btn').addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });

    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
