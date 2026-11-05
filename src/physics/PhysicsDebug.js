import * as THREE from 'three';

export class PhysicsDebug {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Player collider wireframe
    const playerGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.85, 12);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
    this.playerMesh = new THREE.Mesh(playerGeo, wireMat);
    this.group.add(this.playerMesh);

    // Ground ray visualization
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.5, 0)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff0055 });
    this.rayLine = new THREE.Line(lineGeo, lineMat);
    this.group.add(this.rayLine);

    this.obstacleHelpers = new Map();
    this.group.visible = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    this.group.visible = this.enabled;
    return this.enabled;
  }

  update(playerPos, isSliding, obstacles = []) {
    if (!this.enabled) return;

    // Update player collider helper
    this.playerMesh.position.copy(playerPos);
    if (isSliding) {
      this.playerMesh.scale.set(1, 0.4, 1);
      this.playerMesh.position.y = playerPos.y + 0.35;
    } else {
      this.playerMesh.scale.set(1, 1, 1);
      this.playerMesh.position.y = playerPos.y + 0.925;
    }

    this.rayLine.position.copy(playerPos);

    // Clear stale obstacle helpers
    const currentObstacleIds = new Set(obstacles.map(o => o.id));
    for (const [id, helper] of this.obstacleHelpers.entries()) {
      if (!currentObstacleIds.has(id)) {
        this.group.remove(helper);
        helper.geometry.dispose();
        this.obstacleHelpers.delete(id);
      }
    }

    // Update or create obstacle helpers
    for (const obs of obstacles) {
      let helper = this.obstacleHelpers.get(obs.id);
      if (!helper && obs.box) {
        const size = new THREE.Vector3();
        obs.box.getSize(size);
        const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
        helper = new THREE.Mesh(geo, mat);
        this.group.add(helper);
        this.obstacleHelpers.set(obs.id, helper);
      }
      if (helper && obs.box) {
        const center = new THREE.Vector3();
        obs.box.getCenter(center);
        helper.position.copy(center);
      }
    }
  }

  destroy() {
    this.scene.remove(this.group);
  }
}
