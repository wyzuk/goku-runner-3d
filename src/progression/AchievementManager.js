export const ACHIEVEMENTS = [
  { id: 'DIST_100', name: 'First Steps', desc: 'Travel 100 metres', icon: '🏃', xp: 100 },
  { id: 'DIST_1000', name: 'Rising Saiyan', desc: 'Travel 1,000 metres', icon: '⭐', xp: 500 },
  { id: 'DIST_10000', name: 'Elite Saiyan', desc: 'Travel 10,000 metres in a single run', icon: '👑', xp: 2500 },
  { id: 'DB_FIRST', name: 'Wish Seeker', desc: 'Collect your first Dragon Ball', icon: '🔮', xp: 150 },
  { id: 'DB_SEVEN', name: 'Dragon Summoner', desc: 'Collect 7 Dragon Balls in one run', icon: '🐉', xp: 1000 },
  { id: 'DB_100_TOTAL', name: 'Dragon Master', desc: 'Collect 100 total Dragon Balls', icon: '🌟', xp: 3000 },
  { id: 'KI_1000', name: 'Energy Reservoir', desc: 'Collect 1,000 total Ki Orbs', icon: '⚡', xp: 2000 },
  { id: 'SSJ_TRANSFORM', name: 'Super Saiyan Awakening', desc: 'Transform into Super Saiyan for the first time', icon: '🔥', xp: 1200 },
  { id: 'COMBO_10X', name: 'Untouchable Warrior', desc: 'Reach a 10x action combo streak', icon: '💥', xp: 800 },
  { id: 'COMBO_20X', name: 'Ultra Instinct Focus', desc: 'Reach the maximum 3.0x combo multiplier', icon: '✨', xp: 2000 },
  { id: 'DODGE_50', name: 'Agile Fighter', desc: 'Dodge 50 obstacles in a single run', icon: '🛡️', xp: 600 },
  { id: 'SURVIVE_5MIN', name: 'Endurance Legend', desc: 'Survive for over 5 minutes in a single run', icon: '⏱️', xp: 1500 },
  { id: 'NIMBUS_RIDER', name: 'Nimbus Rider', desc: 'Fly on the Flying Nimbus power-up', icon: '☁️', xp: 400 },
  { id: 'MAX_SPEED', name: 'Speed of Light', desc: 'Reach maximum running speed', icon: '🚀', xp: 1500 }
];

export class AchievementManager {
  constructor(progressionManager) {
    this.progression = progressionManager;
    this.onUnlock = null;
  }

  unlock(id) {
    if (!this.progression.profile.achievements[id]) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        this.progression.profile.achievements[id] = Date.now();
        this.progression.addXp(ach.xp);
        this.progression.saveProfile();

        if (this.onUnlock) {
          this.onUnlock(ach);
        }
      }
    }
  }

  isUnlocked(id) {
    return !!this.progression.profile.achievements[id];
  }

  getUnlockedCount() {
    return Object.keys(this.progression.profile.achievements).length;
  }
}
