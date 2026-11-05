import { ACHIEVEMENTS } from '../progression/AchievementManager.js';

export class ProfileModal {
  constructor(container, progressionManager, challengeManager) {
    this.container = container;
    this.progression = progressionManager;
    this.challenges = challengeManager;

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop hidden';
    this.container.appendChild(this.element);
  }

  render() {
    const prof = this.progression.profile;
    const reqXp = this.progression.getXpRequired(prof.level);
    const xpPercent = Math.min(100, Math.floor((prof.currentXp / reqXp) * 100));
    const dailyList = this.challenges.getDailyChallenges();

    this.element.innerHTML = `
      <div class="modal-card anime-card profile-card">
        <div class="modal-header">
          <div class="logo-badge">🥋 WARRIOR PROFILE</div>
          <button class="close-btn" id="profile-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="profile-header-card">
            <div class="rank-avatar">⚡</div>
            <div class="rank-details">
              <div class="rank-level">LEVEL ${prof.level}</div>
              <div class="rank-title">${this.getRankTitle(prof.level)}</div>
              <div class="xp-bar-container">
                <div class="xp-bar-fill" style="width: ${xpPercent}%"></div>
              </div>
              <div class="xp-label">${prof.currentXp.toLocaleString()} / ${reqXp.toLocaleString()} XP (${xpPercent}%)</div>
            </div>
          </div>

          <div class="profile-tabs-row">
            <div class="stats-overview-grid">
              <div class="stat-box"><span class="stat-label">High Score</span><span class="stat-num">${prof.highScore.toLocaleString()}</span></div>
              <div class="stat-box"><span class="stat-label">Max Distance</span><span class="stat-num">${prof.maxDistance.toLocaleString()} m</span></div>
              <div class="stat-box"><span class="stat-label">Total Runs</span><span class="stat-num">${prof.totalRuns}</span></div>
              <div class="stat-box"><span class="stat-label">Dragon Balls</span><span class="stat-num">🔮 ${prof.totalDragonBalls}</span></div>
              <div class="stat-box"><span class="stat-label">Ki Orbs</span><span class="stat-num">⚡ ${prof.totalKiOrbs}</span></div>
              <div class="stat-box"><span class="stat-label">Dodges</span><span class="stat-num">🛡️ ${prof.totalObstaclesAvoided}</span></div>
            </div>
          </div>

          <div class="profile-section">
            <h3>Daily Saiyan Training</h3>
            <div class="challenges-list">
              ${dailyList.map(ch => `
                <div class="challenge-item ${ch.claimed ? 'claimed' : ''}">
                  <div class="ch-info">
                    <div class="ch-title">${ch.title} (+${ch.rewardXp} XP)</div>
                    <div class="ch-desc">${ch.desc} (${ch.current} / ${ch.target})</div>
                    <div class="ch-bar"><div class="ch-fill" style="width: ${Math.min(100, (ch.current / ch.target) * 100)}%"></div></div>
                  </div>
                  <div class="ch-action">
                    ${ch.claimed ? '<span class="claimed-badge">Claimed ✓</span>' : (ch.current >= ch.target ? `<button class="claim-btn anime-btn gold-btn" data-id="${ch.id}">Claim</button>` : '<span class="in-progress-badge">In Progress</span>')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="profile-section">
            <h3>Achievements</h3>
            <div class="achievements-grid">
              ${ACHIEVEMENTS.map(ach => {
                const isUnlocked = !!prof.achievements[ach.id];
                return `
                  <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="ach-icon">${ach.icon}</div>
                    <div class="ach-text">
                      <div class="ach-name">${ach.name}</div>
                      <div class="ach-desc">${ach.desc}</div>
                      <div class="ach-xp">+${ach.xp} XP</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  getRankTitle(lvl) {
    if (lvl >= 50) return 'Universe Legend';
    if (lvl >= 35) return 'Super Saiyan God';
    if (lvl >= 25) return 'Super Saiyan 3';
    if (lvl >= 15) return 'Super Saiyan 2';
    if (lvl >= 8) return 'Super Saiyan';
    if (lvl >= 4) return 'Elite Saiyan Warrior';
    return 'Earth Apprentice';
  }

  bindEvents() {
    this.element.querySelector('#profile-close-btn').addEventListener('click', () => this.hide());

    const claimButtons = this.element.querySelectorAll('.claim-btn');
    claimButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (this.challenges.claimReward(id)) {
          this.render();
        }
      });
    });
  }

  show() {
    this.render();
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
