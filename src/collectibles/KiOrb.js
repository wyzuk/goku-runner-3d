import * as THREE from 'three';

export class KiOrb {
  constructor() {
    this.group = new THREE.Group();

    // Inner bright cyan energy core
    const coreGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(core);

    // Outer pulsating cyan shell
    const shellGeo = new THREE.SphereGeometry(0.36, 14, 14);
    this.shellMat = new THREE.MeshToonMaterial({
      color: 0x00d2ff,
      emissive: 0x0099ff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75
    });
    this.shell = new THREE.Mesh(shellGeo, this.shellMat);
    this.group.add(this.shell);

    // Orbiting energy ring
    const ringGeo = new THREE.TorusGeometry(0.45, 0.02, 6, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x66eeff });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.ring);

    this.baseY = 1.0;
    this.group.position.y = 1.0;
    this.collected = false;
  }

  update(dt, totalTime) {
    if (this.collected) return;
    this.group.position.y = this.baseY + Math.sin(totalTime * 5.0) * 0.12;
    this.ring.rotation.x = totalTime * 3.5;
    this.ring.rotation.y = totalTime * 2.5;
    const pulse = 1.0 + Math.sin(totalTime * 8.0) * 0.1;
    this.shell.scale.set(pulse, pulse, pulse);
  }
}
