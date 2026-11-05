import * as THREE from 'three';
import { OBSTACLE_TYPES } from '../utils/Constants.js';
import { getMaterialManager } from '../materials/MaterialManager.js';

/**
 * Reconstructed 3D Obstacle Factory
 * Detailed rocks, wooden barricades, fallen trees, overhead beams, and moving hazards.
 */
export class ObstacleFactory {
  constructor() {
    this.matMgr = getMaterialManager();

    // Procedural hazard stripe canvas texture for wooden/metal barricades
    const stripeCanvas = document.createElement('canvas');
    stripeCanvas.width = 128;
    stripeCanvas.height = 128;
    const ctx = stripeCanvas.getContext('2d');
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#111111';
    for (let x = -128; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 32, 0);
      ctx.lineTo(x + 16, 128);
      ctx.lineTo(x - 16, 128);
      ctx.fill();
    }
    const stripeTex = new THREE.CanvasTexture(stripeCanvas);
    stripeTex.wrapS = THREE.RepeatWrapping;
    stripeTex.wrapT = THREE.RepeatWrapping;
    stripeTex.repeat.set(4, 1);

    this.materials = {
      rock: this.matMgr.rockMaterial,
      wood: this.matMgr.barkMaterial,
      crateWood: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85, metalness: 0.05 }),
      ironCorner: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.8 }),
      hazardStripe: new THREE.MeshBasicMaterial({ map: stripeTex }),
      moss: new THREE.MeshStandardMaterial({ color: 0x3d7028, roughness: 0.95 })
    };
  }

  createObstacle(type, id) {
    const group = new THREE.Group();
    const box = new THREE.Box3();
    let isOverhead = false;
    let isLow = false;
    let isMoving = false;
    let isDestructible = true;

    switch (type) {
      case OBSTACLE_TYPES.LOW_BARRIER: {
        // Low wooden barricade with hazard stripes - Jumpable (~0.75m tall)
        isLow = true;
        const barGeo = new THREE.BoxGeometry(2.6, 0.28, 0.12);
        const barMesh = new THREE.Mesh(barGeo, this.materials.hazardStripe);
        barMesh.position.y = 0.55;
        barMesh.castShadow = true;
        group.add(barMesh);

        // Lower support plank
        const lowBar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.1), this.materials.crateWood);
        lowBar.position.y = 0.25;
        lowBar.castShadow = true;
        group.add(lowBar);

        // A-Frame Posts
        const postGeo = new THREE.BoxGeometry(0.14, 0.85, 0.14);
        const postL = new THREE.Mesh(postGeo, this.materials.wood);
        postL.position.set(-1.15, 0.42, 0);
        postL.castShadow = true;
        const postR = new THREE.Mesh(postGeo, this.materials.wood);
        postR.position.set(1.15, 0.42, 0);
        postR.castShadow = true;
        group.add(postL, postR);
        break;
      }

      case OBSTACLE_TYPES.FALLEN_LOG: {
        // Detailed fallen forest log with bark, cut branch stubs and moss - Jumpable
        isLow = true;
        const logGeo = new THREE.CylinderGeometry(0.38, 0.42, 2.8, 8);
        logGeo.rotateZ(Math.PI / 2);
        const logMesh = new THREE.Mesh(logGeo, this.materials.wood);
        logMesh.position.y = 0.38;
        logMesh.castShadow = true;
        logMesh.receiveShadow = true;
        group.add(logMesh);

        // Cut branch stubs
        const branchGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.45, 6);
        const b1 = new THREE.Mesh(branchGeo, this.materials.wood);
        b1.position.set(-0.6, 0.65, 0.15);
        b1.rotation.set(0.3, 0, 0.4);
        b1.castShadow = true;
        group.add(b1);

        // Moss patch on log
        const mossGeo = new THREE.CylinderGeometry(0.39, 0.43, 1.2, 8, 1, true, 0, Math.PI);
        mossGeo.rotateZ(Math.PI / 2);
        const mossMesh = new THREE.Mesh(mossGeo, this.materials.moss);
        mossMesh.position.set(0.2, 0.4, 0);
        group.add(mossMesh);
        break;
      }

      case OBSTACLE_TYPES.OVERHEAD_ARCH:
      case OBSTACLE_TYPES.OVERHEAD_BEAM: {
        // Overhead stone arch: clearance below is 1.15m, requires SLIDE
        isOverhead = true;
        isDestructible = false; // Heavy architecture

        // Left and Right stone pillars
        const pillarGeo = new THREE.BoxGeometry(0.42, 2.6, 0.42);
        const pillarL = new THREE.Mesh(pillarGeo, this.materials.rock);
        pillarL.position.set(-1.45, 1.3, 0);
        pillarL.castShadow = true;
        pillarL.receiveShadow = true;

        const pillarR = new THREE.Mesh(pillarGeo, this.materials.rock);
        pillarR.position.set(1.45, 1.3, 0);
        pillarR.castShadow = true;
        pillarR.receiveShadow = true;
        group.add(pillarL, pillarR);

        // Overhead cross beam (bottom edge at y = 1.15m)
        const beamGeo = new THREE.BoxGeometry(3.2, 0.95, 0.5);
        const beamMesh = new THREE.Mesh(beamGeo, this.materials.rock);
        beamMesh.position.set(0, 1.95, 0);
        beamMesh.castShadow = true;
        beamMesh.receiveShadow = true;
        group.add(beamMesh);
        break;
      }

      case OBSTACLE_TYPES.ROLLING_BOULDER: {
        // Moving rolling boulder rolling across lanes
        isMoving = true;
        const boulderGeo = new THREE.DodecahedronGeometry(0.95, 1);
        const boulderMesh = new THREE.Mesh(boulderGeo, this.materials.rock);
        boulderMesh.position.y = 0.95;
        boulderMesh.castShadow = true;
        boulderMesh.receiveShadow = true;
        group.add(boulderMesh);
        break;
      }

      case OBSTACLE_TYPES.PILLAR: {
        // Heavy ancient ruin pillar - Lane blocking
        isDestructible = false;
        const pillarGeo = new THREE.CylinderGeometry(0.58, 0.68, 3.6, 9);
        const pillarMesh = new THREE.Mesh(pillarGeo, this.materials.rock);
        pillarMesh.position.y = 1.8;
        pillarMesh.castShadow = true;
        pillarMesh.receiveShadow = true;
        group.add(pillarMesh);
        break;
      }

      case OBSTACLE_TYPES.STATIC_ROCK:
      default: {
        // Jagged mountain crag / boulder - Requires lane shift or SSJ smash
        const rockGeo = new THREE.DodecahedronGeometry(1.1, 1);
        rockGeo.scale(1.15, 1.35, 1.15);
        const rockMesh = new THREE.Mesh(rockGeo, this.materials.rock);
        rockMesh.position.y = 1.15;
        rockMesh.rotation.set(0.35, 0.6, 0.15);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        group.add(rockMesh);
        break;
      }
    }

    return {
      id,
      type,
      group,
      box,
      isOverhead,
      isLow,
      isMoving,
      isDestructible,
      moveSpeed: isMoving ? (Math.random() > 0.5 ? 4.5 : -4.5) : 0,
      active: true,
      position: group.position
    };
  }

  /**
   * Spawn fracturing debris when an obstacle is smashed by Super Saiyan or Nimbus!
   */
  createDebris(position, scene) {
    const debrisGroup = new THREE.Group();
    debrisGroup.position.copy(position);

    const numPieces = 6;
    const pieces = [];

    for (let i = 0; i < numPieces; i++) {
      const size = 0.2 + Math.random() * 0.25;
      const geo = new THREE.BoxGeometry(size, size, size);
      const piece = new THREE.Mesh(geo, this.materials.rock);
      piece.position.set(
        (Math.random() - 0.5) * 0.6,
        Math.random() * 0.8,
        (Math.random() - 0.5) * 0.6
      );
      piece.castShadow = true;
      debrisGroup.add(piece);

      pieces.push({
        mesh: piece,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 8.0,
          Math.random() * 6.0 + 3.0,
          Math.random() * 6.0 - 2.0
        ),
        rotVel: new THREE.Vector3(
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10
        )
      });
    }

    scene.add(debrisGroup);

    // Animate debris falling and clean up
    let elapsed = 0;
    const animateDebris = () => {
      elapsed += 0.016;
      for (const p of pieces) {
        p.vel.y -= 9.8 * 0.016 * 1.5; // Gravity
        p.mesh.position.addScaledVector(p.vel, 0.016);
        p.mesh.rotation.x += p.rotVel.x * 0.016;
        p.mesh.rotation.y += p.rotVel.y * 0.016;
      }

      if (elapsed < 0.85) {
        requestAnimationFrame(animateDebris);
      } else {
        scene.remove(debrisGroup);
        pieces.forEach(p => p.mesh.geometry.dispose());
      }
    };
    requestAnimationFrame(animateDebris);
  }
}
