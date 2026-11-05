export class ChallengeManager {
  constructor(progressionManager) {
    this.progression = progressionManager;
    this.checkDailyReset();
  }

  getTodayDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  checkDailyReset() {
    const today = this.getTodayDateString();
    if (this.progression.profile.lastDailyDate !== today) {
      this.progression.profile.lastDailyDate = today;
      this.progression.profile.dailyProgress = {
        distance: 0,
        dragonBalls: 0,
        kiOrbs: 0,
        dodges: 0,
        claimed: {}
      };
      this.progression.saveProfile();
    }
  }

  getDailyChallenges() {
    this.checkDailyReset();
    const progress = this.progression.profile.dailyProgress;

    return [
      {
        id: 'DAILY_DIST_1500',
        title: 'Morning Sprint',
        desc: 'Run a total of 1,500m today',
        target: 1500,
        current: Math.min(1500, progress.distance || 0),
        rewardXp: 350,
        claimed: !!progress.claimed?.DAILY_DIST_1500
      },
      {
        id: 'DAILY_DB_5',
        title: 'Dragon Radar',
        desc: 'Collect 5 Dragon Balls today',
        target: 5,
        current: Math.min(5, progress.dragonBalls || 0),
        rewardXp: 400,
        claimed: !!progress.claimed?.DAILY_DB_5
      },
      {
        id: 'DAILY_DODGE_20',
        title: 'Reflex Master',
        desc: 'Dodge 20 obstacles today',
        target: 20,
        current: Math.min(20, progress.dodges || 0),
        rewardXp: 300,
        claimed: !!progress.claimed?.DAILY_DODGE_20
      }
    ];
  }

  updateProgress(distance, dragonBalls, kiOrbs, dodges) {
    this.checkDailyReset();
    const p = this.progression.profile.dailyProgress;
    p.distance = (p.distance || 0) + distance;
    p.dragonBalls = (p.dragonBalls || 0) + dragonBalls;
    p.kiOrbs = (p.kiOrbs || 0) + kiOrbs;
    p.dodges = (p.dodges || 0) + dodges;
    this.progression.saveProfile();
  }

  claimReward(challengeId) {
    this.checkDailyReset();
    const challenges = this.getDailyChallenges();
    const ch = challenges.find(c => c.id === challengeId);
    if (ch && ch.current >= ch.target && !ch.claimed) {
      this.progression.profile.dailyProgress.claimed = this.progression.profile.dailyProgress.claimed || {};
      this.progression.profile.dailyProgress.claimed[challengeId] = true;
      this.progression.addXp(ch.rewardXp);
      this.progression.saveProfile();
      return true;
    }
    return false;
  }
}
