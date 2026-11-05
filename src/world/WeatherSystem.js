import * as THREE from 'three';
import { WEATHERS } from '../utils/Constants.js';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentWeather = WEATHERS.CLEAR;
    this.targetWeather = WEATHERS.CLEAR;
    this.transitionTimer = 0;
    this.weatherDuration = 70.0; // Changes roughly every 70 seconds
    this.elapsedTime = 0;

    // Rain Particles
    this.rainCount = 800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 40;
      rainPos[i * 3 + 1] = Math.random() * 25;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    this.rainMat = new THREE.PointsMaterial({
      color: 0x90c0ff,
      size: 0.22,
      transparent: true,
      opacity: 0.0
    });
    this.rainPoints = new THREE.Points(rainGeo, this.rainMat);
    this.scene.add(this.rainPoints);

    // Lightning Flash Light
    this.lightningLight = new THREE.PointLight(0xddeeff, 0, 150);
    this.lightningLight.position.set(0, 35, 0);
    this.scene.add(this.lightningLight);
    this.lightningFlashTimer = 0;

    // Possible weather cycle
    this.weatherList = [
      WEATHERS.CLEAR,
      WEATHERS.CLOUDY,
      WEATHERS.RAIN,
      WEATHERS.THUNDERSTORM,
      WEATHERS.CLEAR,
      WEATHERS.FOG,
      WEATHERS.CLEAR
    ];
    this.weatherIndex = 0;
  }

  setWeather(weather) {
    this.targetWeather = weather;
  }

  update(dt, playerZ = 0) {
    this.elapsedTime += dt;
    if (this.elapsedTime >= this.weatherDuration) {
      this.elapsedTime = 0;
      this.weatherIndex = (this.weatherIndex + 1) % this.weatherList.length;
      this.targetWeather = this.weatherList[this.weatherIndex];
    }

    this.currentWeather = this.targetWeather;

    // Follow player Z
    if (this.rainPoints) {
      this.rainPoints.position.z = playerZ;
    }
    if (this.lightningLight) {
      this.lightningLight.position.z = playerZ + 20;
    }

    // Rain intensity
    const isRaining = this.currentWeather === WEATHERS.RAIN || this.currentWeather === WEATHERS.THUNDERSTORM;
    const targetOpacity = isRaining ? (this.currentWeather === WEATHERS.THUNDERSTORM ? 0.8 : 0.45) : 0.0;
    this.rainMat.opacity = THREE.MathUtils.lerp(this.rainMat.opacity, targetOpacity, dt * 2.0);

    // Rain animation
    if (this.rainMat.opacity > 0.01) {
      const positions = this.rainPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.rainCount; i++) {
        positions[i * 3 + 1] -= dt * 32.0; // Fall speed
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 25;
        }
      }
      this.rainPoints.geometry.attributes.position.needsUpdate = true;
    }

    // Thunderstorm lightning flashes
    if (this.currentWeather === WEATHERS.THUNDERSTORM) {
      this.lightningFlashTimer -= dt;
      if (this.lightningFlashTimer <= 0) {
        // Flash!
        this.lightningLight.intensity = Math.random() > 0.4 ? 4.5 : 0;
        this.lightningFlashTimer = Math.random() * 5.0 + 1.5;
        setTimeout(() => {
          if (this.lightningLight) this.lightningLight.intensity = 0;
        }, 80);
      }
    } else {
      this.lightningLight.intensity = 0;
    }
  }

  getWeatherName() {
    return this.currentWeather.replace('_', ' ');
  }
}
