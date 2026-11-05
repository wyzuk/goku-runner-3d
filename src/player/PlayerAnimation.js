import * as THREE from 'three';

export const ANIM_STATES = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  JUMP: 'JUMP',
  SLIDE: 'SLIDE',
  TRANSFORM: 'TRANSFORM',
  DEATH: 'DEATH'
};

export class PlayerAnimation {
  constructor(gokuModel) {
    this.model = gokuModel;
    this.joints = gokuModel.joints;
    this.state = ANIM_STATES.IDLE;
    this.animTime = 0;
    this.blendWeight = 1.0;
    this.landingTimer = 0;
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    if (newState === ANIM_STATES.JUMP) {
      this.animTime = 0;
    }
  }

  triggerLanding() {
    this.landingTimer = 0.15; // 150ms squash recovery
  }

  update(dt, speed, isGrounded, isSliding, laneTilt = 0) {
    this.animTime += dt;

    if (this.state === ANIM_STATES.DEATH) {
      this.animateDeath(dt);
      return;
    }

    if (this.state === ANIM_STATES.TRANSFORM) {
      this.animateTransform(dt);
      return;
    }

    if (isSliding) {
      this.animateSlide(dt);
      return;
    }

    if (!isGrounded) {
      this.animateJump(dt);
      return;
    }

    // Grounded running or idle
    if (speed > 1.0) {
      this.animateRun(dt, speed, laneTilt);
    } else {
      this.animateIdle(dt);
    }
  }

  animateRun(dt, speed, laneTilt) {
    // Frequency scaled to speed: 14 m/s -> ~14 rad/s stride
    const strideFreq = Math.min(22.0, Math.max(10.0, speed * 0.9));
    const cycle = this.animTime * strideFreq;
    const sinCycle = Math.sin(cycle);
    const cosCycle = Math.cos(cycle);

    // Root / Pelvis Vertical Bob & Roll
    let bob = Math.abs(sinCycle) * 0.08;
    if (this.landingTimer > 0) {
      this.landingTimer -= dt;
      bob -= 0.15 * (this.landingTimer / 0.15); // Landing squash
    }
    this.joints.root.position.y = 0.95 + bob;
    this.joints.root.rotation.z = laneTilt; // Lean naturally into lane shift
    this.joints.root.rotation.y = sinCycle * 0.08;

    // Spine lean forward into sprint
    this.joints.spine.rotation.x = 0.22 + (speed / 30.0) * 0.12;
    this.joints.spine.rotation.y = -sinCycle * 0.08;

    // Head stays level looking forward
    this.joints.head.rotation.x = -0.15;
    this.joints.head.rotation.y = 0;

    // Legs - Alternating stride
    const legSwing = sinCycle * 0.75;
    this.joints.leftThigh.rotation.x = legSwing;
    this.joints.rightThigh.rotation.x = -legSwing;

    // Shin bend during back-swing
    this.joints.leftShin.rotation.x = legSwing < 0 ? -legSwing * 1.2 : 0.1;
    this.joints.rightShin.rotation.x = -legSwing < 0 ? legSwing * 1.2 : 0.1;

    // Arms - Opposite to legs for balance
    const armSwing = -sinCycle * 0.65;
    this.joints.leftArm.rotation.x = armSwing;
    this.joints.leftArm.rotation.z = 0.15;
    this.joints.leftForearm.rotation.x = Math.max(0.2, armSwing + 0.6);

    this.joints.rightArm.rotation.x = -armSwing;
    this.joints.rightArm.rotation.z = -0.15;
    this.joints.rightForearm.rotation.x = Math.max(0.2, -armSwing + 0.6);
  }

  animateJump(dt) {
    // Dynamic aerial Saiyan leap pose
    this.joints.root.position.y = 0.95;
    this.joints.spine.rotation.x = 0.1;
    this.joints.spine.rotation.y = 0;

    // Bent knees tucked in midair
    this.joints.leftThigh.rotation.x = 0.65;
    this.joints.leftShin.rotation.x = 0.85;
    this.joints.rightThigh.rotation.x = 0.45;
    this.joints.rightShin.rotation.x = 0.95;

    // Arms braced up and back
    this.joints.leftArm.rotation.x = -0.6;
    this.joints.leftArm.rotation.z = 0.4;
    this.joints.leftForearm.rotation.x = 0.9;

    this.joints.rightArm.rotation.x = -0.6;
    this.joints.rightArm.rotation.z = -0.4;
    this.joints.rightForearm.rotation.x = 0.9;
  }

  animateSlide(dt) {
    // Drop root low to ground
    this.joints.root.position.y = 0.38;
    this.joints.root.rotation.set(0, 0, 0);

    // Torso angled backwards
    this.joints.spine.rotation.x = -0.65;
    this.joints.head.rotation.x = 0.6; // Keep eyes forward

    // Legs kicked straight forward
    this.joints.leftThigh.rotation.x = -1.35;
    this.joints.leftShin.rotation.x = 0.1;
    this.joints.rightThigh.rotation.x = -1.25;
    this.joints.rightShin.rotation.x = 0.15;

    // Arms planted back for friction brace
    this.joints.leftArm.rotation.x = -0.9;
    this.joints.leftArm.rotation.z = 0.35;
    this.joints.leftForearm.rotation.x = 0.5;

    this.joints.rightArm.rotation.x = -0.9;
    this.joints.rightArm.rotation.z = -0.35;
    this.joints.rightForearm.rotation.x = 0.5;
  }

  animateTransform(dt) {
    // Powerful Super Saiyan powering up posture
    // Wide stance, knees bent, fists clenched, chest pumped forward
    this.joints.root.position.y = 0.82;
    this.joints.spine.rotation.x = -0.2; // Chest puffed back
    this.joints.head.rotation.x = -0.25; // Chin raised roaring

    // Wide legs
    this.joints.leftThigh.rotation.set(0.35, 0, 0.4);
    this.joints.leftShin.rotation.set(0.65, 0, 0);
    this.joints.rightThigh.rotation.set(0.35, 0, -0.4);
    this.joints.rightShin.rotation.set(0.65, 0, 0);

    // Fists clenched at sides shaking with intense energy
    const shake = (Math.random() - 0.5) * 0.08;
    this.joints.leftArm.rotation.set(0.2 + shake, 0, 0.5);
    this.joints.leftForearm.rotation.set(1.4 + shake, 0, 0);
    this.joints.rightArm.rotation.set(0.2 + shake, 0, -0.5);
    this.joints.rightForearm.rotation.set(1.4 + shake, 0, 0);
  }

  animateDeath(dt) {
    // Knocked back / collision tumble
    this.joints.root.position.y = THREE.MathUtils.lerp(this.joints.root.position.y, 0.25, dt * 6.0);
    this.joints.root.rotation.x = THREE.MathUtils.lerp(this.joints.root.rotation.x, -1.4, dt * 6.0);
    this.joints.spine.rotation.x = 0.3;
    this.joints.leftArm.rotation.x = -1.2;
    this.joints.rightArm.rotation.x = -1.2;
  }

  animateIdle(dt) {
    const cycle = this.animTime * 2.5;
    this.joints.root.position.y = 0.95 + Math.sin(cycle) * 0.02;
    this.joints.spine.rotation.x = 0.05;
    this.joints.spine.rotation.y = 0;
    this.joints.head.rotation.x = 0;

    this.joints.leftThigh.rotation.set(0, 0, 0.1);
    this.joints.leftShin.rotation.set(0, 0, 0);
    this.joints.rightThigh.rotation.set(0, 0, -0.1);
    this.joints.rightShin.rotation.set(0, 0, 0);

    this.joints.leftArm.rotation.set(0.1, 0, 0.2);
    this.joints.leftForearm.rotation.set(0.3, 0, 0);
    this.joints.rightArm.rotation.set(0.1, 0, -0.2);
    this.joints.rightForearm.rotation.set(0.3, 0, 0);
  }
}
