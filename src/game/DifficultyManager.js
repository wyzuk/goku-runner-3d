import { DIFFICULTY_STAGES } from '../utils/Constants.js';

export class DifficultyManager {
  constructor() {
    this.currentStageIndex = 0;
    this.currentStage = DIFFICULTY_STAGES[0];
    this.targetSpeed = this.currentStage.speed;
  }

  reset() {
    this.currentStageIndex = 0;
    this.currentStage = DIFFICULTY_STAGES[0];
    this.targetSpeed = this.currentStage.speed;
  }

  update(distance) {
    let stageIdx = 0;
    for (let i = DIFFICULTY_STAGES.length - 1; i >= 0; i--) {
      if (distance >= DIFFICULTY_STAGES[i].minDistance) {
        stageIdx = i;
        break;
      }
    }

    this.currentStageIndex = stageIdx;
    this.currentStage = DIFFICULTY_STAGES[stageIdx];
    this.targetSpeed = this.currentStage.speed;

    return {
      stageIndex: this.currentStageIndex,
      stageName: this.currentStage.name,
      targetSpeed: this.targetSpeed,
      obstacleFreq: this.currentStage.obstacleFreq,
      safeGap: this.currentStage.safeGap
    };
  }
}
