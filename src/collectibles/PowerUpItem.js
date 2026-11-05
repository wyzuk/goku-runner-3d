import * as THREE from 'three';
import { POWER_UPS, POWER_UP_CONFIG } from '../utils/Constants.js';

export class PowerUpItem {
  constructor(type) {
    this.type = type;
    this.group = new THREE.Group();
    this.config = POWER_UP_CONFIG[type] || POWER_UP_CONFIG[POWER_UPS.NIMBUS];

    // Colored glowing aura ring
    const ringGeo = new THREE.TorusGeometry(0.5, 0.04, 6, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.config.color) });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.rotation.x = Math.PI / 2;
    this.group.add(this.ring);

    // Icon / Core Model
    this.buildItemMesh();

    this.baseY = 1.1;
    this.group.position.y = 1.1;
    this.collected = false;
  }

  buildItemMesh() {
    const mat = new THREE.MeshToonMaterial({
      color: new THREE.Color(this.config.color),
      emissive: new THREE.Color(this.config.color),
      emissiveIntensity: 0.4
    });

    if (this.type === POWER_UPS.NIMBUS) {
      // Golden Nimbus Mini-Cloud
      const cloudPuff = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), mat);
      cloudPuff.scale.set(1.4, 0.8, 1.2);
      this.group.add(cloudPuff);
    } else if (this.type === POWER_UPS.SENZU_BEAN) {
      // Green Senzu Bean
      const beanGeo = new THREE.SphereGeometry(0.22, 8, 8);
      beanGeo.scale(0.8, 1.4, 0.9);
      const bean = new THREE.Mesh(beanGeo, mat);
      this.group.add(bean);
    } else if (this.type === POWER_UPS.ZENKAI_BOOST) {
      // Fiery Star Crystal
      const starGeo = new THREE.OctahedronGeometry(0.3, 0);
      const star = new THREE.Mesh(starGeo, mat);
      this.group.add(star);
    } else {
      // Ki / Magnetic Orb
      const sphereGeo = new THREE.DodecahedronGeometry(0.26, 0);
      const sphere = new THREE.Mesh(sphereGeo, mat);
      this.group.add(sphere);
    }
  }

  update(dt, totalTime) {
    if (this.collected) return;
    this.group.position.y = this.baseY + Math.sin(totalTime * 4.0) * 0.15;
    this.group.rotation.y = totalTime * 2.5;
    this.ring.rotation.z = totalTime * 3.0;
  }
}
