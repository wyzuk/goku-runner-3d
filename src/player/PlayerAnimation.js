import * as THREE from 'three';

export const ANIM_STATES = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  JUMP: 'JUMP',
  SLIDE: 'SLIDE',
  TRANSFORM: 'TRANSFORM',
  DEATH: 'DEATH'
};

/**
 * Procedural Player Animation Controller
 * Drives energetic, bouncy, stylized anime motion for the 3D Goku model.
 * Handles running cadence, athletic forward lean, lane banking, jumping, landing squash,
 * low-profile slide crouching, and Super Saiyan transformation roaring.
 */
export class PlayerAnimation {
  constructor(gokuModel) {
    this.model = gokuModel;
    this.state = ANIM_STATES.IDLE;
    this.animTime = 0;
    this.landingTimer = 0;
    this.verticalVelocity = 0;
    this.lastPosY = 0;
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    if (newState === ANIM_STATES.JUMP) {
      this.animTime = 0;
    }
  }

  triggerLanding() {
    this.landingTimer = 0.18; // 180ms squash & recovery
  }

  update(dt, speed, isGrounded, isSliding, laneTilt = 0) {
    this.animTime += dt;
    const root = this.model.animRoot;
    if (!root) return;

    if (this.state === ANIM_STATES.DEATH) {
      this.animateDeath(dt, root);
      return;
    }

    if (this.state === ANIM_STATES.TRANSFORM) {
      this.animateTransform(dt, root);
      return;
    }

    if (isSliding) {
      this.animateSlide(dt, root, laneTilt);
      return;
    }

    if (!isGrounded) {
      this.animateJump(dt, root, laneTilt);
      return;
    }

    // Grounded running or idle
    if (speed > 1.0) {
      this.animateRun(dt, root, speed, laneTilt);
    } else {
      this.animateIdle(dt, root);
    }
  }

  animateRun(dt, root, speed, laneTilt) {
    // Dynamic stride frequency scaled with running speed
    const strideFreq = Math.min(24.0, Math.max(12.0, speed * 0.95));
    const cycle = this.animTime * strideFreq;
    const sinCycle = Math.sin(cycle);
    const cosCycle = Math.cos(cycle);

    // 1. Vertical bounce (hop)
    let hop = Math.abs(sinCycle) * 0.12;

    // 2. Landing squash
    let squashY = 1.0;
    let squashXZ = 1.0;
    if (this.landingTimer > 0) {
      this.landingTimer -= dt;
      const progress = Math.max(0, this.landingTimer / 0.18);
      hop -= 0.16 * progress;
      squashY = 1.0 - 0.22 * progress;
      squashXZ = 1.0 + 0.15 * progress;
    } else {
      // Step squash & stretch
      squashY = 1.0 + Math.sin(cycle * 2.0) * 0.04;
      squashXZ = 1.0 - Math.sin(cycle * 2.0) * 0.02;
    }

    root.position.y = hop;
    root.position.x = 0;
    root.position.z = 0;

    // 3. Forward sprint lean (reveals back, gi, belt, and martial arts stride)
    const sprintLean = 0.28 + Math.min(0.14, (speed - 14) * 0.008);
    root.rotation.x = sprintLean;

    // 4. Lateral sway & lane banking
    const bankRoll = -laneTilt * 0.35; // Bank deep into lane switches
    const strideRoll = sinCycle * 0.06;
    root.rotation.z = bankRoll + strideRoll;

    // 5. Yaw heading sway
    const yawSway = cosCycle * 0.05;
    const steerYaw = -laneTilt * 0.15;
    root.rotation.y = yawSway + steerYaw;

    // 6. Scale dynamics
    root.scale.set(squashXZ, squashY, squashXZ);
  }

  animateJump(dt, root, laneTilt) {
    root.position.set(0, 0, 0);

    // Floating leap tilt: slight backward pitch at ascent, forward at peak/descent
    const jumpProgress = Math.min(1.0, this.animTime * 1.8);
    root.rotation.x = THREE.MathUtils.lerp(-0.16, 0.14, jumpProgress);
    root.rotation.z = -laneTilt * 0.35;
    root.rotation.y = -laneTilt * 0.15;

    // Elongated athletic silhouette in mid-air
    root.scale.set(0.96, 1.08, 0.96);
  }

  animateSlide(dt, root, laneTilt) {
    // Drop low to ground, pitch backward sliding on heels
    root.position.y = -0.42;
    root.position.x = 0;
    root.position.z = 0.1;

    root.rotation.x = -0.55; // Slide pitch
    root.rotation.z = -laneTilt * 0.25;
    root.rotation.y = 0;

    // Low obstacle avoidance profile
    root.scale.set(1.12, 0.65, 1.25);
  }

  animateTransform(dt, root) {
    // Powerful Super Saiyan power-up stance
    root.position.y = 0.05 + Math.sin(this.animTime * 24.0) * 0.02;
    const jitter = (Math.random() - 0.5) * 0.04;
    root.rotation.x = -0.22 + jitter;
    root.rotation.y = jitter;
    root.rotation.z = jitter;

    // Power expansion pulse
    const pulse = 1.0 + Math.sin(this.animTime * 18.0) * 0.06;
    root.scale.set(pulse, pulse, pulse);
  }

  animateDeath(dt, root) {
    // Knockback tumble
    root.position.y = THREE.MathUtils.lerp(root.position.y, 0.15, dt * 5.0);
    root.position.z = THREE.MathUtils.lerp(root.position.z, -0.6, dt * 5.0);
    root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, -1.45, dt * 6.0);
    root.rotation.z = THREE.MathUtils.lerp(root.rotation.z, 0.6, dt * 4.0);
    root.scale.set(1.0, 1.0, 1.0);
  }

  animateIdle(dt, root) {
    // Gentle anime idle breathing & heroic front-facing menu pose
    const t = this.animTime;
    const breathe = Math.sin(t * 3.2);

    root.position.set(0, breathe * 0.02, 0);
    root.rotation.set(0.04, Math.PI, 0); // Faces camera in main menu
    root.scale.set(1.0 - breathe * 0.015, 1.0 + breathe * 0.025, 1.0 - breathe * 0.015);
  }
}
