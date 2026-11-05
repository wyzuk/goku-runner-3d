import { MILESTONES } from '../utils/Constants.js';

export class MilestoneManager {
  constructor(progressionManager) {
    this.progression = progressionManager;
    this.reachedMilestones = new Set();
    this.onMilestoneReached = null;
  }

  reset() {
    this.reachedMilestones.clear();
  }

  checkDistance(currentDistance) {
    for (const ms of MILESTONES) {
      if (currentDistance >= ms.distance && !this.reachedMilestones.has(ms.distance)) {
        this.reachedMilestones.add(ms.distance);
        this.progression.addXp(ms.rewardXp);

        if (this.onMilestoneReached) {
          this.onMilestoneReached(ms);
        }
      }
    }
  }
}
