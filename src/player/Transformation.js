export class Transformation {
  constructor(gokuModel, playerAnimation) {
    this.model = gokuModel;
    this.animation = playerAnimation;
    
    this.ki = 0; // 0 to 100
    this.maxKi = 100;
    this.isSuperSaiyan = false;
    this.isTransforming = false;
    this.transformTimer = 0;
    this.ssjDuration = 15.0; // 15 seconds in SSJ mode
    this.ssjTimer = 0;

    // Callbacks
    this.onTransformStart = null;
    this.onTransformComplete = null;
    this.onRevert = null;
  }

  addKi(amount) {
    if (this.isSuperSaiyan) return; // Ki is draining during SSJ
    this.ki = Math.min(this.maxKi, this.ki + amount);
  }

  canTransform() {
    return this.ki >= this.maxKi && !this.isSuperSaiyan && !this.isTransforming;
  }

  activateTransformation() {
    if (!this.canTransform()) return false;

    this.isTransforming = true;
    this.transformTimer = 0.85; // 850ms cinematic powerup
    this.animation.setState('TRANSFORM');

    if (this.onTransformStart) {
      this.onTransformStart();
    }
    return true;
  }

  update(dt) {
    if (this.isTransforming) {
      this.transformTimer -= dt;
      if (this.transformTimer <= 0) {
        this.isTransforming = false;
        this.isSuperSaiyan = true;
        this.ssjTimer = this.ssjDuration;
        this.model.setSuperSaiyan(true);
        this.animation.setState('RUN');

        if (this.onTransformComplete) {
          this.onTransformComplete();
        }
      }
      return;
    }

    if (this.isSuperSaiyan) {
      this.ssjTimer -= dt;
      this.ki = Math.max(0, (this.ssjTimer / this.ssjDuration) * this.maxKi);

      if (this.ssjTimer <= 0) {
        this.revertToBase();
      }
    }
  }

  revertToBase() {
    this.isSuperSaiyan = false;
    this.isTransforming = false;
    this.ki = 0;
    this.model.setSuperSaiyan(false);
    if (this.onRevert) {
      this.onRevert();
    }
  }

  reset() {
    this.ki = 0;
    this.isSuperSaiyan = false;
    this.isTransforming = false;
    this.transformTimer = 0;
    this.ssjTimer = 0;
    this.model.setSuperSaiyan(false);
  }
}
