import * as THREE from 'three';

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    
    // Normal follow offset relative to player (balanced 3rd person perspective)
    this.offset = new THREE.Vector3(0, 3.2, -6.6);
    this.lookOffset = new THREE.Vector3(0, 1.3, 8.0);

    this.currentPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.baseFov = 60;
    this.camera.fov = this.baseFov;

    this.isCinematic = false;
    this.cinematicTimer = 0;
  }

  init(playerPos) {
    this.currentPos.set(playerPos.x + this.offset.x, playerPos.y + this.offset.y, playerPos.z + this.offset.z);
    this.currentLookAt.set(playerPos.x + this.lookOffset.x, playerPos.y + this.lookOffset.y, playerPos.z + this.lookOffset.z);
    this.camera.position.copy(this.currentPos);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.currentLookAt);
  }

  triggerShake(intensity = 0.4, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  triggerTransformationCinematic(duration = 0.85) {
    this.isCinematic = true;
    this.cinematicTimer = duration;
  }

  update(dt, playerPos, speed, laneTilt = 0) {
    // 1. Cinematic transformation camera
    if (this.isCinematic) {
      this.cinematicTimer -= dt;
      if (this.cinematicTimer <= 0) {
        this.isCinematic = false;
      } else {
        // Dramatic close-up slightly to the side and lower
        const cinematicTargetPos = new THREE.Vector3(playerPos.x + 1.2, playerPos.y + 1.2, playerPos.z - 3.2);
        const cinematicLookAt = new THREE.Vector3(playerPos.x, playerPos.y + 1.1, playerPos.z + 1.0);
        this.camera.position.lerp(cinematicTargetPos, dt * 8.0);
        this.currentLookAt.lerp(cinematicLookAt, dt * 8.0);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(this.currentLookAt);
        return;
      }
    }

    // 2. Dynamic FOV based on speed (exhilarating tunnel vision sensation)
    const targetFov = this.baseFov + Math.min(18, Math.max(0, (speed - 14) * 0.9));
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 4.0);
    this.camera.updateProjectionMatrix();

    // 3. Target position calculation
    const targetX = playerPos.x * 0.75 + this.offset.x; // Slight lateral lag for lane changes
    const targetY = Math.max(2.8, playerPos.y * 0.5 + this.offset.y); // Dampened jump follow
    const targetZ = playerPos.z + this.offset.z;

    this.currentPos.x = THREE.MathUtils.lerp(this.currentPos.x, targetX, dt * 10.0);
    this.currentPos.y = THREE.MathUtils.lerp(this.currentPos.y, targetY, dt * 8.0);
    this.currentPos.z = THREE.MathUtils.lerp(this.currentPos.z, targetZ, dt * 25.0);

    // 4. Target lookAt calculation
    const lookTargetX = playerPos.x * 0.6 + this.lookOffset.x;
    const lookTargetY = playerPos.y * 0.4 + this.lookOffset.y;
    const lookTargetZ = playerPos.z + this.lookOffset.z;

    this.currentLookAt.x = THREE.MathUtils.lerp(this.currentLookAt.x, lookTargetX, dt * 10.0);
    this.currentLookAt.y = THREE.MathUtils.lerp(this.currentLookAt.y, lookTargetY, dt * 8.0);
    this.currentLookAt.z = THREE.MathUtils.lerp(this.currentLookAt.z, lookTargetZ, dt * 25.0);

    // 5. Camera Shake
    let shakeOffset = new THREE.Vector3();
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const progress = this.shakeDuration;
      shakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity * progress,
        (Math.random() - 0.5) * this.shakeIntensity * progress,
        (Math.random() - 0.5) * this.shakeIntensity * progress
      );
    }

    this.camera.position.copy(this.currentPos).add(shakeOffset);

    // Roll tilt smoothly using camera.up vector to avoid Euler gimbal flips
    const rollAngle = laneTilt * 0.15;
    this.camera.up.set(-Math.sin(rollAngle), Math.cos(rollAngle), 0);
    this.camera.lookAt(this.currentLookAt);
  }
}
