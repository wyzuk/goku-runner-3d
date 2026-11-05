import * as THREE from 'three';
import { OBSTACLE_TYPES } from '../utils/Constants.js';
import { getMaterialManager } from '../materials/MaterialManager.js';
import { modelLoader } from '../utils/ModelAssetLoader.js';

/**
 * Reconstructed 3D Obstacle Factory
 * Integrates real 3D assets:
 * - mossy_old_tree_log.glb for low jump hurdles
 * - large_stone.glb & desert_rocks.glb for solid rock obstacles
 * - wooden_bridge.glb for overhead slide archways & bridge structures
 * - tree_broken_mossy_branch for ground branch obstacles
 * With procedural fallbacks if assets are loading.
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
      case OBSTACLE_TYPES.LOW_BARRIER:
      case OBSTACLE_TYPES.FALLEN_LOG: {
        // Low Jump Hurdle: Real 3D Mossy Old Tree Log
        isLow = true;
        if (modelLoader.has('mossy_log')) {
          const log = modelLoader.createInstance('mossy_log');
          // Scale to span ~2.8m across the lane (lane width is 3.6m)
          const s = 1.95;
          log.scale.set(s, s, s);
          log.position.set(0, 0, 0);
          log.rotation.y = 0; // Aligned across lane
          group.add(log);
        } else {
          // Procedural fallback log
          const logGeo = new THREE.CylinderGeometry(0.38, 0.42, 2.8, 8);
          logGeo.rotateZ(Math.PI / 2);
          const logMesh = new THREE.Mesh(logGeo, this.materials.wood);
          logMesh.position.y = 0.38;
          logMesh.castShadow = true;
          group.add(logMesh);
        }
        break;
      }

      case OBSTACLE_TYPES.OVERHEAD_ARCH:
      case OBSTACLE_TYPES.OVERHEAD_BEAM: {
        // Slide Obstacle: Real 3D Wooden Bridge Section or Archway
        isOverhead = true;
        isDestructible = false;

        if (modelLoader.has('wooden_bridge')) {
          const bridge = modelLoader.createInstance('wooden_bridge');
          // Native scale is ~420cm wide, ~83cm high
          // Scale ~0.022 creates width ~3.4m, overhead arch clearance ~1.25m
          const s = 0.022;
          bridge.scale.set(s, s, s);
          bridge.position.set(0, 0.45, 0);
          group.add(bridge);
        } else {
          // Fallback overhead stone arch
          const pillarGeo = new THREE.BoxGeometry(0.42, 2.6, 0.42);
          const pillarL = new THREE.Mesh(pillarGeo, this.materials.rock);
          pillarL.position.set(-1.45, 1.3, 0);
          pillarL.castShadow = true;
          const pillarR = new THREE.Mesh(pillarGeo, this.materials.rock);
          pillarR.position.set(1.45, 1.3, 0);
          pillarR.castShadow = true;
          group.add(pillarL, pillarR);

          const beamGeo = new THREE.BoxGeometry(3.2, 0.95, 0.5);
          const beamMesh = new THREE.Mesh(beamGeo, this.materials.rock);
          beamMesh.position.set(0, 1.95, 0);
          beamMesh.castShadow = true;
          group.add(beamMesh);
        }
        break;
      }

      case OBSTACLE_TYPES.ROLLING_BOULDER: {
        isMoving = true;
        if (modelLoader.has('rock_large')) {
          const boulder = modelLoader.createInstance('rock_large');
          boulder.scale.set(0.95, 0.95, 0.95);
          boulder.position.y = 0.8;
          group.add(boulder);
        } else {
          const boulderGeo = new THREE.DodecahedronGeometry(0.95, 1);
          const boulderMesh = new THREE.Mesh(boulderGeo, this.materials.rock);
          boulderMesh.position.y = 0.95;
          boulderMesh.castShadow = true;
          group.add(boulderMesh);
        }
        break;
      }

      case OBSTACLE_TYPES.PILLAR: {
        isDestructible = false;
        // Ancient ruin pillar
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
        // Lane-Blocking Rock: Real 3D Large Stone or Desert Rock
        const useDesert = Math.random() > 0.5;
        const key = useDesert && modelLoader.has('rock_desert') ? 'rock_desert' : 'rock_large';

        if (modelLoader.has(key)) {
          const rock = modelLoader.createInstance(key);
          const s = key === 'rock_desert' ? 1.35 : 1.15;
          rock.scale.set(s, s, s);
          rock.position.y = 0;
          rock.rotation.y = Math.random() * Math.PI * 2;
          group.add(rock);
        } else {
          const rockGeo = new THREE.DodecahedronGeometry(1.1, 1);
          rockGeo.scale(1.15, 1.35, 1.15);
          const rockMesh = new THREE.Mesh(rockGeo, this.materials.rock);
          rockMesh.position.y = 1.15;
          rockMesh.castShadow = true;
          group.add(rockMesh);
        }
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

    let elapsed = 0;
    const animateDebris = () => {
      elapsed += 0.016;
      for (const p of pieces) {
        p.vel.y -= 9.8 * 0.016 * 1.5;
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
