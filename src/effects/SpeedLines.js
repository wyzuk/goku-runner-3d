import * as THREE from 'three';

export class SpeedLines {
  constructor(camera) {
    this.camera = camera;
    this.lineCount = 40;
    this.group = new THREE.Group();
    this.camera.add(this.group);

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.lineCount * 6); // 2 points per line
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    this.lines = new THREE.LineSegments(geo, this.mat);
    this.group.add(this.lines);

    // Initial random streaks in camera space
    this.initLines();
  }

  initLines() {
    const pos = this.lines.geometry.attributes.position.array;
    for (let i = 0; i < this.lineCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.5 + Math.random() * 4.0;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const zFar = -12 - Math.random() * 8;
      const zNear = zFar + 4.5 + Math.random() * 3.0;

      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = zFar;

      pos[i * 6 + 3] = x * 1.1;
      pos[i * 6 + 4] = y * 1.1;
      pos[i * 6 + 5] = zNear;
    }
    this.lines.geometry.attributes.position.needsUpdate = true;
  }

  update(dt, speed, isSuperSaiyan) {
    // Show speed lines when speed > 20 or during SSJ
    const threshold = 18.0;
    const intensity = Math.min(1.0, Math.max(0, (speed - threshold) / 12.0) + (isSuperSaiyan ? 0.5 : 0));
    this.mat.opacity = THREE.MathUtils.lerp(this.mat.opacity, intensity * 0.75, dt * 5.0);

    if (this.mat.opacity > 0.02) {
      const pos = this.lines.geometry.attributes.position.array;
      for (let i = 0; i < this.lineCount; i++) {
        // Stream lines forward
        pos[i * 6 + 2] += dt * speed * 2.2;
        pos[i * 6 + 5] += dt * speed * 2.2;

        if (pos[i * 6 + 5] > -2.0) {
          const zFar = -18 - Math.random() * 6;
          const length = 4.0 + Math.random() * 3.0;
          pos[i * 6 + 2] = zFar;
          pos[i * 6 + 5] = zFar + length;
        }
      }
      this.lines.geometry.attributes.position.needsUpdate = true;
    }
  }
}
