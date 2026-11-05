export class ProgressionManager {
  constructor() {
    this.storageKey = 'goku_runner_progression_v1';
    this.profile = this.loadProfile();
    this.onLevelUp = null;
  }

  loadProfile() {
    const defaultProfile = {
      level: 1,
      currentXp: 0,
      lifetimeXp: 0,
      highScore: 0,
      maxDistance: 0,
      totalRuns: 0,
      totalDragonBalls: 0,
      totalKiOrbs: 0,
      totalSurvivalTime: 0,
      totalObstaclesAvoided: 0,
      unlockedCosmetics: ['DEFAULT_GOKU'],
      achievements: {},
      tutorialCompleted: false,
      tutorialRewardClaimed: false,
      lastDailyDate: '',
      dailyProgress: {}
    };

    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return { ...defaultProfile, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
    }
    return defaultProfile;
  }

  saveProfile() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }

  getXpRequired(level) {
    return Math.floor(500 * Math.pow(level, 1.35));
  }

  addXp(amount) {
    if (amount <= 0) return { levelsGained: 0 };
    
    this.profile.lifetimeXp += amount;
    this.profile.currentXp += amount;
    let levelsGained = 0;

    let required = this.getXpRequired(this.profile.level);
    while (this.profile.currentXp >= required) {
      this.profile.currentXp -= required;
      this.profile.level++;
      levelsGained++;
      required = this.getXpRequired(this.profile.level);

      if (this.onLevelUp) {
        this.onLevelUp(this.profile.level);
      }
    }

    this.saveProfile();
    return { levelsGained, newLevel: this.profile.level, currentXp: this.profile.currentXp, requiredXp: required };
  }

  recordRun(runStats) {
    this.profile.totalRuns++;
    this.profile.totalDragonBalls += (runStats.dragonBalls || 0);
    this.profile.totalKiOrbs += (runStats.kiOrbs || 0);
    this.profile.totalSurvivalTime += (runStats.survivalTime || 0);
    this.profile.totalObstaclesAvoided += (runStats.obstaclesAvoided || 0);

    if (runStats.score > this.profile.highScore) {
      this.profile.highScore = Math.floor(runStats.score);
    }
    if (runStats.distance > this.profile.maxDistance) {
      this.profile.maxDistance = Math.floor(runStats.distance);
    }

    this.saveProfile();
  }

  completeTutorialReward() {
    if (!this.profile.tutorialRewardClaimed) {
      this.profile.tutorialCompleted = true;
      this.profile.tutorialRewardClaimed = true;
      this.addXp(500); // +500 XP reward
      this.saveProfile();
      return true;
    }
    return false;
  }

  resetProgress() {
    localStorage.removeItem(this.storageKey);
    this.profile = this.loadProfile();
  }
}
