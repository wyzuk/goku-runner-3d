export class ScoreMultiplier {
  constructor() {
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboTimeout = 3.5; // 3.5 seconds to keep combo alive
    this.multiplier = 1.0;
    this.maxMultiplier = 3.0;

    this.onComboChange = null;
  }

  reset() {
    this.comboCount = 0;
    this.comboTimer = 0;
    this.multiplier = 1.0;
  }

  registerAction() {
    this.comboCount++;
    this.comboTimer = this.comboTimeout;

    // Multiplier breakpoints
    if (this.comboCount >= 20) {
      this.multiplier = 3.0; // Legendary
    } else if (this.comboCount >= 12) {
      this.multiplier = 2.0; // Excellent
    } else if (this.comboCount >= 6) {
      this.multiplier = 1.5; // Great
    } else if (this.comboCount >= 3) {
      this.multiplier = 1.2; // Good
    } else {
      this.multiplier = 1.0;
    }

    if (this.onComboChange) {
      this.onComboChange(this.comboCount, this.multiplier);
    }
  }

  breakCombo() {
    if (this.comboCount > 0) {
      this.comboCount = 0;
      this.comboTimer = 0;
      this.multiplier = 1.0;
      if (this.onComboChange) {
        this.onComboChange(0, 1.0);
      }
    }
  }

  update(dt) {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.breakCombo();
      }
    }
  }

  getMultiplier() {
    return this.multiplier;
  }
}
