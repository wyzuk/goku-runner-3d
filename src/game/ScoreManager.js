export class ScoreManager {
  constructor(multiplierSystem) {
    this.multiplierSystem = multiplierSystem;
    this.score = 0;
    this.distance = 0;
    this.dragonBalls = 0;
    this.kiOrbs = 0;
    this.obstaclesAvoided = 0;
    this.survivalTime = 0;
    this.maxCombo = 0;
  }

  reset() {
    this.score = 0;
    this.distance = 0;
    this.dragonBalls = 0;
    this.kiOrbs = 0;
    this.obstaclesAvoided = 0;
    this.survivalTime = 0;
    this.maxCombo = 0;
  }

  addDistance(deltaDistance, powerUpMultiplier = 1.0) {
    this.distance += deltaDistance;
    const comboMult = this.multiplierSystem ? this.multiplierSystem.getMultiplier() : 1.0;
    // 1 meter = 10 base points
    this.score += deltaDistance * 10.0 * comboMult * powerUpMultiplier;
  }

  addDragonBall(starCount, powerUpMultiplier = 1.0) {
    this.dragonBalls++;
    const comboMult = this.multiplierSystem ? this.multiplierSystem.getMultiplier() : 1.0;
    this.score += 150.0 * comboMult * powerUpMultiplier;
    if (this.multiplierSystem) this.multiplierSystem.registerAction();
  }

  addKiOrb(powerUpMultiplier = 1.0) {
    this.kiOrbs++;
    const comboMult = this.multiplierSystem ? this.multiplierSystem.getMultiplier() : 1.0;
    this.score += 35.0 * comboMult * powerUpMultiplier;
    if (this.multiplierSystem) this.multiplierSystem.registerAction();
  }

  addObstacleAvoided() {
    this.obstaclesAvoided++;
    const comboMult = this.multiplierSystem ? this.multiplierSystem.getMultiplier() : 1.0;
    this.score += 60.0 * comboMult;
    if (this.multiplierSystem) this.multiplierSystem.registerAction();
  }

  update(dt) {
    this.survivalTime += dt;
    if (this.multiplierSystem && this.multiplierSystem.comboCount > this.maxCombo) {
      this.maxCombo = this.multiplierSystem.comboCount;
    }
  }

  getStats() {
    return {
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      dragonBalls: this.dragonBalls,
      kiOrbs: this.kiOrbs,
      obstaclesAvoided: this.obstaclesAvoided,
      survivalTime: Math.floor(this.survivalTime),
      maxCombo: this.maxCombo
    };
  }
}
