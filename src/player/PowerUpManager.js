import * as THREE from 'three';
import { POWER_UPS, POWER_UP_CONFIG } from '../utils/Constants.js';

export class PowerUpManager {
  constructor(player) {
    this.player = player;
    this.activePowerUps = new Map();

    // Nimbus cloud mesh under player when active
    this.nimbusGroup = new THREE.Group();
    const cloudMat = new THREE.MeshToonMaterial({
      color: 0xffea33,
      emissive: 0xffaa00,
      emissiveIntensity: 0.35
    });
    
    // Build fluffy cloud puffs
    const puff1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), cloudMat);
    puff1.scale.set(1.4, 0.6, 1.8);
    const puff2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), cloudMat);
    puff2.position.set(-0.25, 0.05, 0.2);
    const puff3 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), cloudMat);
    puff3.position.set(0.25, 0.05, 0.2);
    const puff4 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), cloudMat);
    puff4.position.set(0, 0.08, -0.25);
    
    this.nimbusGroup.add(puff1, puff2, puff3, puff4);
    this.nimbusGroup.position.set(0, 0.15, 0);
    this.nimbusGroup.visible = false;
    this.player.gokuModel.group.add(this.nimbusGroup);

    // Shield sphere mesh
    const shieldGeo = new THREE.SphereGeometry(1.1, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x55ff88,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 0.9, 0);
    this.shieldMesh.visible = false;
    this.player.gokuModel.group.add(this.shieldMesh);

    // Event hooks
    this.onPowerUpActivated = null;
    this.onPowerUpExpired = null;
  }

  activate(type) {
    const config = POWER_UP_CONFIG[type];
    if (!config) return;

    if (type === POWER_UPS.KI_BOOST) {
      this.player.transformation.addKi(50);
      if (this.onPowerUpActivated) this.onPowerUpActivated(type, config);
      return;
    }

    this.activePowerUps.set(type, {
      remaining: config.duration,
      duration: config.duration,
      config: config
    });

    if (type === POWER_UPS.NIMBUS) {
      this.nimbusGroup.visible = true;
    } else if (type === POWER_UPS.SENZU_BEAN) {
      this.shieldMesh.visible = true;
    }

    if (this.onPowerUpActivated) {
      this.onPowerUpActivated(type, config);
    }
  }

  has(type) {
    return this.activePowerUps.has(type);
  }

  isInvulnerable() {
    return (
      this.player.transformation.isSuperSaiyan ||
      this.has(POWER_UPS.NIMBUS) ||
      this.has(POWER_UPS.SENZU_BEAN) ||
      this.player.isInvincibleCheat
    );
  }

  hasMagnet() {
    return this.has(POWER_UPS.MAGNETIC_AURA) || this.player.transformation.isSuperSaiyan;
  }

  getSpeedMultiplier() {
    let mult = 1.0;
    if (this.has(POWER_UPS.ZENKAI_BOOST)) mult += 0.25;
    if (this.player.transformation.isSuperSaiyan) mult += 0.35;
    return mult;
  }

  getScoreMultiplier() {
    let mult = 1.0;
    if (this.has(POWER_UPS.ZENKAI_BOOST)) mult *= 2.0;
    return mult;
  }

  update(dt) {
    for (const [type, item] of this.activePowerUps.entries()) {
      item.remaining -= dt;
      if (item.remaining <= 0) {
        this.activePowerUps.delete(type);
        if (type === POWER_UPS.NIMBUS) this.nimbusGroup.visible = false;
        if (type === POWER_UPS.SENZU_BEAN) this.shieldMesh.visible = false;
        if (this.onPowerUpExpired) this.onPowerUpExpired(type);
      }
    }

    // Nimbus bobbing
    if (this.nimbusGroup.visible) {
      this.nimbusGroup.rotation.y += dt * 3.0;
    }
    // Shield rotation
    if (this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += dt * 2.0;
      this.shieldMesh.rotation.x += dt * 1.5;
    }
  }

  reset() {
    this.activePowerUps.clear();
    this.nimbusGroup.visible = false;
    this.shieldMesh.visible = false;
  }
}
