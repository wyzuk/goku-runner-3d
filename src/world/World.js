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

    // 2. Procedural Anime Sky Dome & Atmospheric Fog
    const skyGeo = new THREE.SphereGeometry(280, 24, 16);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1a72d6) },     // Deep anime azure blue
        horizonColor: { value: new THREE.Color(0x9ae2ff) }, // Bright cyan-white horizon
        offset: { value: 20.0 },
        exponent: { value: 0.65 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          gl_FragColor = vec4(mix(horizonColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, this.skyMat);
    this.scene.add(this.skyDome);

    // Natural atmospheric perspective: crystal-clear foreground for obstacles, smooth distance fading for mountains
    this.scene.fog = new THREE.Fog(0x96d0f8, 70, 240);
    this.scene.background = new THREE.Color(0x96d0f8);

    // 3. Subsystems
    this.chunkManager = new ChunkManager(this.scene, this.envAssets);
    this.dayNightCycle = new DayNightCycle(this.scene, this.dirLight, this.hemiLight, this.ambientLight, this.skyDome);
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
    // Keep sky dome centered at player
    if (this.skyDome) {
      this.skyDome.position.set(0, 0, playerZ);
    }

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
