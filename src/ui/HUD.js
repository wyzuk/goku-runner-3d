export class HUD {
  constructor(container, onPauseClick) {
    this.container = container;
    this.onPauseClick = onPauseClick;

    this.element = document.createElement('div');
    this.element.className = 'game-hud hidden';
    this.element.innerHTML = `
      <!-- TOP HUD BAR -->
      <div class="hud-top-bar">
        <div class="hud-left-stats">
          <div class="hud-stat-box score-box">
            <span class="hud-label">SCORE</span>
            <span class="hud-value" id="hud-score">0</span>
          </div>
          <div class="hud-stat-box distance-box">
            <span class="hud-label">DISTANCE</span>
            <span class="hud-value" id="hud-distance">0 m</span>
          </div>
          <div class="hud-stat-box speed-box">
            <span class="hud-label">SPEED</span>
            <span class="hud-value" id="hud-speed">14 m/s</span>
          </div>
        </div>

        <div class="hud-center-badges">
          <div class="hud-badge stage-badge" id="hud-stage">Beginner</div>
          <div class="hud-badge combo-badge hidden" id="hud-combo">COMBO 1.0x</div>
        </div>

        <div class="hud-right-actions">
          <div class="dragon-ball-counter">
            <span class="db-icon">🔮</span>
            <span class="db-text" id="hud-db-count">0 / 7</span>
          </div>
          <button class="hud-pause-btn" id="hud-pause-btn" title="Pause Game (Esc / P)">⏸️</button>
        </div>
      </div>

      <!-- POWER-UP BADGES ROW -->
      <div class="hud-powerups-row" id="hud-powerups"></div>

      <!-- MILESTONE NOTIFICATION BANNER -->
      <div class="milestone-banner hidden" id="hud-milestone-banner">
        <div class="milestone-title" id="milestone-title">MILESTONE REACHED!</div>
        <div class="milestone-desc" id="milestone-desc">1,000 m - Rising Saiyan (+400 XP)</div>
      </div>

      <!-- BOTTOM KI METER BAR -->
      <div class="hud-bottom-bar">
        <div class="ki-meter-container">
          <div class="ki-label-row">
            <span class="ki-title">⚡ KI ENERGY</span>
            <span class="ki-percent" id="hud-ki-percent">0%</span>
          </div>
          <div class="ki-bar-frame">
            <div class="ki-bar-fill" id="hud-ki-fill" style="width: 0%"></div>
            <div class="ki-ready-alert hidden" id="hud-ki-ready-alert">
              🔥 READY! PRESS [E] OR [SHIFT] TO TRANSFORM 🔥
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.scoreEl = this.element.querySelector('#hud-score');
    this.distEl = this.element.querySelector('#hud-distance');
    this.speedEl = this.element.querySelector('#hud-speed');
    this.stageEl = this.element.querySelector('#hud-stage');
    this.comboEl = this.element.querySelector('#hud-combo');
    this.dbEl = this.element.querySelector('#hud-db-count');
    this.kiFillEl = this.element.querySelector('#hud-ki-fill');
    this.kiPercentEl = this.element.querySelector('#hud-ki-percent');
    this.kiReadyAlertEl = this.element.querySelector('#hud-ki-ready-alert');
    this.powerupsContainer = this.element.querySelector('#hud-powerups');
    this.milestoneBanner = this.element.querySelector('#hud-milestone-banner');
    this.milestoneTitle = this.element.querySelector('#milestone-title');
    this.milestoneDesc = this.element.querySelector('#milestone-desc');

    this.element.querySelector('#hud-pause-btn').addEventListener('click', () => {
      if (this.onPauseClick) this.onPauseClick();
    });
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  update(stats, ki, isSSJ, powerUpsMap, stageName) {
    this.scoreEl.textContent = stats.score.toLocaleString();
    this.distEl.textContent = `${stats.distance.toLocaleString()} m`;
    this.speedEl.textContent = `${Math.round(stats.speed)} m/s`;
    this.stageEl.textContent = stageName;
    this.dbEl.textContent = `${stats.dragonBalls} / 7`;

    // Combo
    if (stats.comboCount >= 3) {
      this.comboEl.classList.remove('hidden');
      this.comboEl.textContent = `🔥 COMBO ${stats.comboCount}x (${stats.multiplier.toFixed(1)}x)`;
      if (stats.multiplier >= 2.0) {
        this.comboEl.classList.add('gold-combo');
      } else {
        this.comboEl.classList.remove('gold-combo');
      }
    } else {
      this.comboEl.classList.add('hidden');
    }

    // Ki Meter
    const kiPercent = Math.min(100, Math.floor(ki));
    this.kiFillEl.style.width = `${kiPercent}%`;
    this.kiPercentEl.textContent = `${kiPercent}%`;

    if (isSSJ) {
      this.kiFillEl.classList.add('ssj-ki-fill');
      this.kiReadyAlertEl.classList.remove('hidden');
      this.kiReadyAlertEl.textContent = '⚡ SUPER SAIYAN MODE ACTIVE ⚡';
    } else if (kiPercent >= 100) {
      this.kiFillEl.classList.remove('ssj-ki-fill');
      this.kiReadyAlertEl.classList.remove('hidden');
      this.kiReadyAlertEl.textContent = '🔥 READY! PRESS [E] OR [SHIFT] TO TRANSFORM 🔥';
    } else {
      this.kiFillEl.classList.remove('ssj-ki-fill');
      this.kiReadyAlertEl.classList.add('hidden');
    }

    // Active power-ups
    this.updatePowerUps(powerUpsMap);
  }

  updatePowerUps(powerUpsMap) {
    if (!powerUpsMap || powerUpsMap.size === 0) {
      this.powerupsContainer.innerHTML = '';
      return;
    }
    let html = '';
    for (const [type, item] of powerUpsMap.entries()) {
      const remainingSec = Math.ceil(item.remaining);
      html += `
        <div class="powerup-badge" style="border-color: ${item.config.color}">
          <span class="pu-name">${item.config.name}</span>
          <span class="pu-time">${remainingSec}s</span>
        </div>
      `;
    }
    this.powerupsContainer.innerHTML = html;
  }

  showMilestone(ms) {
    this.milestoneTitle.textContent = `🏆 MILESTONE: ${ms.title.toUpperCase()}!`;
    this.milestoneDesc.textContent = `${ms.distance.toLocaleString()} Metres Cleared (+${ms.rewardXp} XP)`;
    this.milestoneBanner.classList.remove('hidden');
    setTimeout(() => {
      this.milestoneBanner.classList.add('hidden');
    }, 3500);
  }
}
