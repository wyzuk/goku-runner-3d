import * as THREE from 'three';

export class DragonBall {
  constructor(starCount = 4) {
    this.starCount = starCount;
    this.group = new THREE.Group();

    // Outer translucent orange sphere
    const ballGeo = new THREE.SphereGeometry(0.38, 16, 16);
    this.ballMat = new THREE.MeshToonMaterial({
      color: 0xff8c00,
      emissive: 0xff5500,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88
    });
    this.ballMesh = new THREE.Mesh(ballGeo, this.ballMat);
    this.group.add(this.ballMesh);

    // Inner Red Stars
    this.starMat = new THREE.MeshBasicMaterial({ color: 0xee0011 });
    this.buildStars(starCount);

    this.group.position.y = 1.0;
    this.baseY = 1.0;
    this.collected = false;
  }

  buildStars(count) {
    const starGeo = new THREE.ConeGeometry(0.045, 0.08, 5);
    starGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < count; i++) {
      const star = new THREE.Mesh(starGeo, this.starMat);
      if (count === 1) {
        star.position.set(0, 0, 0);
      } else {
        const angle = (i / count) * Math.PI * 2;
        const radius = count > 3 ? 0.14 : 0.09;
        star.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      }
      this.ballMesh.add(star);
    }
  }

  update(dt, totalTime) {
    if (this.collected) return;
    this.group.rotation.y = totalTime * 2.5;
    this.group.position.y = this.baseY + Math.sin(totalTime * 4.0) * 0.15;
  }
}
