import * as THREE from 'three';
import { LANES } from '../utils/Constants.js';
import { ObstacleFactory } from './ObstacleFactory.js';
import { getRandomPattern } from './ObstaclePatterns.js';

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.factory = new ObstacleFactory();
    this.obstacles = [];
    this.nextId = 1;
    this.lastSpawnZ = 30; // Don't spawn immediately at starting position
  }

  reset() {
    for (const obs of this.obstacles) {
      this.scene.remove(obs.group);
    }
    this.obstacles = [];
    this.lastSpawnZ = 30;
  }

  spawnPatternAt(pattern, baseZ) {
    for (const item of pattern) {
      const obs = this.factory.createObstacle(item.type, this.nextId++);
      const x = LANES[item.lane];
      const z = baseZ + (item.offsetZ || 0);

      obs.group.position.set(x, 0, z);
      this.updateObstacleBox(obs);
      this.scene.add(obs.group);
      this.obstacles.push(obs);
    }
  }

  spawnForChunk(startZ, endZ, difficultyStage = 1) {
    // Determine how many patterns to spawn in this chunk
    // safe gap depends on difficulty
    const gap = Math.max(16, 32 - difficultyStage * 2);
    let z = Math.max(this.lastSpawnZ + gap, startZ + 10);

    while (z < endZ - 8) {
      const pattern = getRandomPattern(difficultyStage);
      this.spawnPatternAt(pattern, z);
      this.lastSpawnZ = z;
      z += gap + Math.random() * 8;
    }
  }

  updateObstacleBox(obs) {
    if (obs.isOverhead) {
      // Overhead beam hitbox: y from 1.05 to 2.5, width 2.6, depth 0.6
      const pos = obs.group.position;
      obs.box.min.set(pos.x - 1.25, pos.y + 1.05, pos.z - 0.3);
      obs.box.max.set(pos.x + 1.25, pos.y + 2.5, pos.z + 0.3);
    } else if (obs.isLow) {
      // Low barrier hitbox: y from 0 to 0.75, width 2.4, depth 0.6
      const pos = obs.group.position;
      obs.box.min.set(pos.x - 1.15, pos.y, pos.z - 0.3);
      obs.box.max.set(pos.x + 1.15, pos.y + 0.75, pos.z + 0.3);
    } else {
      // Standard static rock or pillar: fair bounds slightly smaller than mesh
      const pos = obs.group.position;
      obs.box.min.set(pos.x - 0.75, pos.y, pos.z - 0.75);
      obs.box.max.set(pos.x + 0.75, pos.y + 2.4, pos.z + 0.75);
    }
  }

  update(dt, playerZ) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // If moving obstacle (e.g. rolling boulder)
      if (obs.isMoving) {
        obs.group.position.x += obs.moveSpeed * dt;
        obs.group.rotation.x += dt * 6.0;
        // Bounce back between lanes
        if (obs.group.position.x > 3.5) {
          obs.group.position.x = 3.5;
          obs.moveSpeed = -Math.abs(obs.moveSpeed);
        } else if (obs.group.position.x < -3.5) {
          obs.group.position.x = -3.5;
          obs.moveSpeed = Math.abs(obs.moveSpeed);
        }
      }

      this.updateObstacleBox(obs);

      // Recycle if far behind camera
      if (obs.group.position.z < playerZ - 25) {
        this.scene.remove(obs.group);
        this.obstacles.splice(i, 1);
      }
    }
  }

  getActiveObstacles() {
    return this.obstacles;
  }
}
