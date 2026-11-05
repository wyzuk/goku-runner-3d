import * as THREE from 'three';
import { GokuModel } from './GokuModel.js';
import { PlayerAnimation } from './PlayerAnimation.js';
import { Transformation } from './Transformation.js';
import { PowerUpManager } from './PowerUpManager.js';

export class Player {
  constructor(physicsEngine) {
    this.physics = physicsEngine;
    this.gokuModel = new GokuModel();
    this.animation = new PlayerAnimation(this.gokuModel);
    this.transformation = new Transformation(this.gokuModel, this.animation);
    this.powerUps = new PowerUpManager(this);

    this.isDead = false;
    this.isInvincibleCheat = false;

    // Connect physics events to animation
    this.physics.onLand = () => {
      this.animation.triggerLanding();
      if (this.onLandCallback) this.onLandCallback();
    };

    this.physics.onJump = () => {
      this.animation.setState('JUMP');
      if (this.onJumpCallback) this.onJumpCallback();
    };

    this.physics.onSlideStart = () => {
      this.animation.setState('SLIDE');
      if (this.onSlideCallback) this.onSlideCallback();
    };

    this.physics.onSlideEnd = () => {
      this.animation.setState('RUN');
    };
  }

  get mesh() {
    return this.gokuModel.group;
  }

  get position() {
    return this.physics.position;
  }

  reset() {
    this.isDead = false;
    this.physics.reset();
    this.transformation.reset();
    this.powerUps.reset();
    this.animation.setState('RUN');
    this.gokuModel.group.position.set(0, 0, 0);
    this.gokuModel.group.rotation.set(0, 0, 0);
  }

  die() {
    this.isDead = true;
    this.animation.setState('DEATH');
  }

  update(dt, totalTime, obstacles = []) {
    if (this.isDead) {
      this.animation.update(dt, 0, true, false, 0);
      this.gokuModel.update(totalTime, dt);
      return;
    }

    // Check transformation
    this.transformation.update(dt);
    this.powerUps.update(dt);

    // Speed multiplier from SSJ and Zenkai
    const speedMult = this.powerUps.getSpeedMultiplier();
    this.physics.setSpeedModifier(speedMult);

    // Physics step
    this.physics.update(dt, obstacles, true);

    // Sync 3D mesh position with physics position
    this.gokuModel.group.position.copy(this.physics.position);
    this.gokuModel.group.rotation.y = 0; // Running forward

    // Animate character
    this.animation.update(
      dt,
      this.physics.getCurrentSpeed(),
      this.physics.isGrounded,
      this.physics.isSliding,
      this.physics.laneTilt
    );

    // Model shader uniforms & aura update
    this.gokuModel.update(totalTime, dt);
  }
}
