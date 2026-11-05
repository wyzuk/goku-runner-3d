import * as THREE from 'three';
import { EnvironmentAssets } from './EnvironmentAssets.js';
import { ChunkManager } from './ChunkManager.js';
import { DayNightCycle } from './DayNightCycle.js';
import { WeatherSystem } from './WeatherSystem.js';

/**
 * World Manager for Goku Runner 3D
 * Handles daylight lighting, soft shadows, sky, fog, chunks, day/night and weather.
 */
export class World {
  constructor(scene) {
    this.scene = scene;
    this.envAssets = new EnvironmentAssets();

    // 1. Balanced Daylight Lighting Setup (Phase 00 & Phase 05)
    // Top Sky (Azure anime blue) + Bottom Ground (warm green fill)
    this.hemiLight = new THREE.HemisphereLight(0x5cb8ff, 0x6aa84f, 1.15);
    this.scene.add(this.hemiLight);

    // Subtle Ambient fill
    this.ambientLight = new THREE.AmbientLight(0x90c4ff, 0.6);
    this.scene.add(this.ambientLight);

    // Warm Directional Sunlight
    this.dirLight = new THREE.DirectionalLight(0xfffaea, 1.5);
    this.dirLight.position.set(25, 48, 25);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 140;
    this.dirLight.shadow.camera.left = -18;
    this.dirLight.shadow.camera.right = 18;
    this.dirLight.shadow.camera.top = 24;
    this.dirLight.shadow.camera.bottom = -16;
    this.dirLight.shadow.bias = -0.0008;
    this.dirLight.shadow.normalBias = 0.02;

    // Directional Light Target following player
    this.dirLightTarget = new THREE.Object3D();
    this.scene.add(this.dirLightTarget);
    this.dirLight.target = this.dirLightTarget;
    this.scene.add(this.dirLight);

    // Character Hero Rim / Fill Light (attached to player position in update)
    this.heroLight = new THREE.PointLight(0xffeedd, 0.45, 12);
    this.scene.add(this.heroLight);

    // 2. Procedural Sky & Fog
    // Natural atmospheric perspective: crystal-clear foreground for obstacles, smooth distance fading for mountains
    this.scene.fog = new THREE.Fog(0x92c9f5, 65, 230);
    this.scene.background = new THREE.Color(0x92c9f5);

    // 3. Subsystems
    this.chunkManager = new ChunkManager(this.scene, this.envAssets);
    this.dayNightCycle = new DayNightCycle(this.scene, this.dirLight, this.hemiLight, this.ambientLight, null);
    this.weatherSystem = new WeatherSystem(this.scene);
  }

  init() {
    this.chunkManager.init(-15);
  }

  reset() {
    this.chunkManager.clear();
    this.chunkManager.init(-15);
  }

  update(dt, playerZ) {
    // Keep directional sunlight and shadow frustum centered tightly around player
    if (this.dirLightTarget) {
      this.dirLightTarget.position.set(0, 0, playerZ);
    }
    if (this.heroLight) {
      this.heroLight.position.set(0, 2.5, playerZ - 2.0);
    }

    this.chunkManager.update(playerZ);
    this.dayNightCycle.update(dt, playerZ);
    this.weatherSystem.update(dt, playerZ);
  }
}
