import * as THREE from 'three';
import { physicsConfig } from './PhysicsConfig.js';
import { LANES } from '../utils/Constants.js';

export class PhysicsEngine {
  constructor() {
    this.config = physicsConfig;
    
    // Player physical state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    
    this.currentLane = 1; // Center lane
    this.targetLaneX = LANES[1];
    this.laneTilt = 0; // Visual roll angle
    
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    
    this.forwardSpeed = this.config.initialSpeed;
    this.baseSpeed = this.config.initialSpeed;
    this.speedModifier = 1.0;

    // Colliders (AABB)
    this.playerBox = new THREE.Box3();
    
    // Timestep accumulator
    this.accumulator = 0;
    this.fixedStep = this.config.fixedTimeStep;

    // Callback hooks
    this.onLand = null;
    this.onJump = null;
    this.onSlideStart = null;
    this.onSlideEnd = null;
    this.onCollision = null;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.acceleration.set(0, 0, 0);
    this.currentLane = 1;
    this.targetLaneX = LANES[1];
    this.laneTilt = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.forwardSpeed = this.config.initialSpeed;
    this.baseSpeed = this.config.initialSpeed;
    this.speedModifier = 1.0;
    this.updateCollider();
  }

  setBaseSpeed(speed) {
    this.baseSpeed = speed;
  }

  setSpeedModifier(mod) {
    this.speedModifier = mod;
  }

  getCurrentSpeed() {
    return this.baseSpeed * this.speedModifier;
  }

  changeLane(direction) {
    // direction: -1 (left toward lane 0 / visual left), +1 (right toward lane 2 / visual right)
    const nextLane = this.currentLane + direction;
    if (nextLane >= 0 && nextLane < LANES.length) {
      this.currentLane = nextLane;
      this.targetLaneX = LANES[this.currentLane];
      // Quick tilt in direction of movement: left is negative tilt, right is positive tilt
      this.laneTilt = direction * this.config.laneTiltAngle;
      return true;
    }
    return false;
  }

  jump(variableHold = false) {
    if (this.isGrounded && !this.isSliding) {
      this.isGrounded = false;
      this.isJumping = true;
      let impulse = this.config.jumpImpulse;
      if (variableHold) impulse *= this.config.variableJumpMultiplier;
      this.velocity.y = impulse;
      if (this.onJump) this.onJump();
      return true;
    }
    return false;
  }

  slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.config.slideDuration;
      
      // If sliding while airborne, perform fast dive to ground
      if (!this.isGrounded) {
        this.velocity.y = -18.0;
      }
      
      if (this.onSlideStart) this.onSlideStart();
      return true;
    } else {
      // Refresh slide duration if pressed again
      this.slideTimer = this.config.slideDuration;
    }
    return false;
  }

  updateCollider() {
    const r = this.config.playerRadius;
    const h = this.isSliding ? this.config.playerHeightSliding : this.config.playerHeightStanding;
    
    this.playerBox.min.set(
      this.position.x - r * 0.8,
      this.position.y,
      this.position.z - r * 0.8
    );
    this.playerBox.max.set(
      this.position.x + r * 0.8,
      this.position.y + h,
      this.position.z + r * 0.8
    );
  }

  update(deltaTime, obstacles = [], checkCeiling = false) {
    // Frame clamping to avoid large delta time spike on tab switch
    const clampedDelta = Math.min(deltaTime, 0.1);
    this.accumulator += clampedDelta;

    while (this.accumulator >= this.fixedStep) {
      this.step(this.fixedStep, obstacles, checkCeiling);
      this.accumulator -= this.fixedStep;
    }

    this.updateCollider();
  }

  step(dt, obstacles, checkCeiling) {
    const effectiveSpeed = this.getCurrentSpeed();
    this.forwardSpeed = effectiveSpeed;

    // 1. Forward movement (Z increases forward)
    this.position.z += this.forwardSpeed * dt;

    // 2. Lateral (X) movement with smooth critically-damped spring
    const dx = this.targetLaneX - this.position.x;
    const moveStep = dx * Math.min(1.0, this.config.laneChangeSpeed * dt);
    this.position.x += moveStep;

    // Restore tilt back to upright
    this.laneTilt = THREE.MathUtils.lerp(this.laneTilt, 0, dt * 10.0);

    // 3. Vertical (Y) movement and gravity
    if (!this.isGrounded) {
      this.velocity.y += this.config.gravity * dt;
      this.position.y += this.velocity.y * dt;

      // Ground landing check (ground is at y = 0)
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;
        this.isJumping = false;
        if (this.onLand) this.onLand();
      }
    } else {
      this.position.y = 0;
      this.velocity.y = 0;
    }

    // 4. Slide duration management
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        // Check if there is an overhead barrier right now that prevents standing up
        let canStand = true;
        if (checkCeiling) {
          const standBox = this.playerBox.clone();
          standBox.max.y = this.position.y + this.config.playerHeightStanding;
          for (const obs of obstacles) {
            if (obs.isOverhead && obs.box && standBox.intersectsBox(obs.box)) {
              canStand = false;
              break;
            }
          }
        }

        if (canStand) {
          this.isSliding = false;
          if (this.onSlideEnd) this.onSlideEnd();
        } else {
          // Prolong slide slightly until safe
          this.slideTimer = 0.1;
        }
      }
    }

    // Update collider box for collision test
    this.updateCollider();

    // 5. Collision detection against obstacles
    for (const obs of obstacles) {
      if (!obs.active || !obs.box) continue;

      // If obstacle is too far ahead or behind, skip
      if (Math.abs(obs.position.z - this.position.z) > 4.0) continue;

      if (this.playerBox.intersectsBox(obs.box)) {
        if (this.onCollision) {
          this.onCollision(obs);
        }
        break;
      }
    }
  }
}
