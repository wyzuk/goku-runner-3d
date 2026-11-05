import * as THREE from 'three';
import { LANES, POWER_UPS } from '../utils/Constants.js';
import { DragonBall } from './DragonBall.js';
import { KiOrb } from './KiOrb.js';
import { PowerUpItem } from './PowerUpItem.js';

export class CollectibleManager {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.nextStarIndex = 1;
    this.lastSpawnZ = 20;

    // Callbacks
    this.onDragonBallCollected = null;
    this.onKiCollected = null;
    this.onPowerUpCollected = null;
  }

  reset() {
    for (const item of this.items) {
      this.scene.remove(item.instance.group);
    }
    this.items = [];
    this.nextStarIndex = 1;
    this.lastSpawnZ = 20;
  }

  spawnForChunk(startZ, endZ) {
    let z = Math.max(this.lastSpawnZ + 15, startZ + 8);

    while (z < endZ - 6) {
      const roll = Math.random();
      const laneIdx = Math.floor(Math.random() * 3);
      const laneX = LANES[laneIdx];

      if (roll < 0.25) {
        // Spawn Dragon Ball
        const starCount = this.nextStarIndex;
        this.nextStarIndex = (this.nextStarIndex % 7) + 1;
        const db = new DragonBall(starCount);
        db.group.position.set(laneX, 1.0, z);
        this.scene.add(db.group);
        this.items.push({ type: 'DRAGON_BALL', instance: db, starCount });
        z += 16;
      } else if (roll < 0.35) {
        // Spawn Power-Up
        const pTypes = [
          POWER_UPS.NIMBUS,
          POWER_UPS.SENZU_BEAN,
          POWER_UPS.KI_BOOST,
          POWER_UPS.MAGNETIC_AURA,
          POWER_UPS.ZENKAI_BOOST
        ];
        const chosen = pTypes[Math.floor(Math.random() * pTypes.length)];
        const pu = new PowerUpItem(chosen);
        pu.group.position.set(laneX, 1.1, z);
        this.scene.add(pu.group);
        this.items.push({ type: 'POWER_UP', instance: pu, powerUpType: chosen });
        z += 20;
      } else {
        // Spawn a line of 3 to 5 Ki Orbs
        const count = 4;
        for (let i = 0; i < count; i++) {
          const ki = new KiOrb();
          ki.group.position.set(laneX, 1.0, z + i * 3.5);
          this.scene.add(ki.group);
          this.items.push({ type: 'KI_ORB', instance: ki });
        }
        z += count * 3.5 + 10;
      }

      this.lastSpawnZ = z;
    }
  }

  update(dt, totalTime, playerPos, hasMagnet = false) {
    const pickupDistSq = 1.6 * 1.6;
    const magnetDistSq = 16.0 * 16.0;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const inst = item.instance;

      if (inst.collected) {
        this.scene.remove(inst.group);
        this.items.splice(i, 1);
        continue;
      }

      inst.update(dt, totalTime);

      const pos = inst.group.position;
      const dx = playerPos.x - pos.x;
      const dy = (playerPos.y + 0.9) - pos.y;
      const dz = playerPos.z - pos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      // Magnetic Attraction
      if (hasMagnet && distSq < magnetDistSq) {
        const pullFactor = dt * 14.0;
        pos.x += dx * pullFactor;
        pos.y += dy * pullFactor;
        pos.z += dz * pullFactor;
      }

      // Pickup Check
      if (distSq < pickupDistSq) {
        inst.collected = true;
        this.scene.remove(inst.group);
        this.items.splice(i, 1);

        if (item.type === 'DRAGON_BALL' && this.onDragonBallCollected) {
          this.onDragonBallCollected(item.starCount, pos);
        } else if (item.type === 'KI_ORB' && this.onKiCollected) {
          this.onKiCollected(pos);
        } else if (item.type === 'POWER_UP' && this.onPowerUpCollected) {
          this.onPowerUpCollected(item.powerUpType, pos);
        }
        continue;
      }

      // Recycle if far behind camera
      if (pos.z < playerPos.z - 20) {
        this.scene.remove(inst.group);
        this.items.splice(i, 1);
      }
    }
  }
}
