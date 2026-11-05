import * as THREE from 'three';

/**
 * Coordinated Dynamic Day/Night Cycle
 * Seamless transitions between Sunrise, Midday Bright Daylight, Golden Hour / Sunset, Dusk, and Moonlit Night.
 */
export class DayNightCycle {
  constructor(scene, dirLight, hemiLight, ambientLight, skyDome) {
    this.scene = scene;
    this.sunLight = dirLight;
    this.hemiLight = hemiLight;
    this.ambientLight = ambientLight;
    this.skyDome = skyDome;

    this.cycleDuration = 200.0; // Seconds for full cycle
    this.time = 50.0; // Default starts at 0.25 (Bright Daytime)
    this.timeRatio = 0.25;

    // Build nighttime stars
    this.buildStars();

    // Keyframes for all time periods
    this.keyframes = [
      // 0.0 - Sunrise / Dawn
      {
        ratio: 0.0,
        name: 'Sunrise',
        sunColor: new THREE.Color(0xff8d45),
        sunIntensity: 1.1,
        hemiSky: new THREE.Color(0xffa07a),
        hemiGround: new THREE.Color(0x6b5b45),
        ambientColor: new THREE.Color(0xff9466),
        ambientIntensity: 0.45,
        fogColor: new THREE.Color(0xdca17c),
        sunPos: new THREE.Vector3(-45, 22, 20),
        starsOpacity: 0.0
      },
      // 0.25 - Bright Daytime (DEFAULT BASELINE)
      {
        ratio: 0.25,
        name: 'Bright Daytime',
        sunColor: new THREE.Color(0xfffaea),
        sunIntensity: 1.5,
        hemiSky: new THREE.Color(0x5cb8ff),
        hemiGround: new THREE.Color(0x6aa84f),
        ambientColor: new THREE.Color(0x90c4ff),
        ambientIntensity: 0.65,
        fogColor: new THREE.Color(0x92c9f5),
        sunPos: new THREE.Vector3(25, 48, 25),
        starsOpacity: 0.0
      },
      // 0.50 - Golden Hour & Sunset
      {
        ratio: 0.50,
        name: 'Sunset',
        sunColor: new THREE.Color(0xff5522),
        sunIntensity: 1.2,
        hemiSky: new THREE.Color(0xff7744),
        hemiGround: new THREE.Color(0x5c4228),
        ambientColor: new THREE.Color(0xdd6644),
        ambientIntensity: 0.5,
        fogColor: new THREE.Color(0xd27558),
        sunPos: new THREE.Vector3(50, 16, -15),
        starsOpacity: 0.15
      },
      // 0.65 - Dusk
      {
        ratio: 0.65,
        name: 'Dusk',
        sunColor: new THREE.Color(0xaa5588),
        sunIntensity: 0.7,
        hemiSky: new THREE.Color(0x444477),
        hemiGround: new THREE.Color(0x222233),
        ambientColor: new THREE.Color(0x334466),
        ambientIntensity: 0.4,
        fogColor: new THREE.Color(0x383355),
        sunPos: new THREE.Vector3(55, 8, -25),
        starsOpacity: 0.5
      },
      // 0.78 - Moonlit Night
      {
        ratio: 0.78,
        name: 'Night',
        sunColor: new THREE.Color(0x7799ee), // Cool blue moonlight
        sunIntensity: 0.65,
        hemiSky: new THREE.Color(0x1a294d),
        hemiGround: new THREE.Color(0x0e1726),
        ambientColor: new THREE.Color(0x28385e),
        ambientIntensity: 0.45,
        fogColor: new THREE.Color(0x131a2e),
        sunPos: new THREE.Vector3(-35, 42, 10),
        starsOpacity: 0.95
      },
      // 1.0 - Sunrise (loop)
      {
        ratio: 1.0,
        name: 'Sunrise',
        sunColor: new THREE.Color(0xff8d45),
        sunIntensity: 1.1,
        hemiSky: new THREE.Color(0xffa07a),
        hemiGround: new THREE.Color(0x6b5b45),
        ambientColor: new THREE.Color(0xff9466),
        ambientIntensity: 0.45,
        fogColor: new THREE.Color(0xdca17c),
        sunPos: new THREE.Vector3(-45, 22, 20),
        starsOpacity: 0.0
      }
    ];
  }

  buildStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.15); // Upper sky dome
      const r = 260;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 15;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0
    });
    this.starPoints = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.starPoints);

    // Glowing Moon Disc
    const moonGeo = new THREE.CircleGeometry(7.0, 24);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xf4f8ff,
      transparent: true,
      opacity: 0
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(-60, 110, 80);
    this.moonMesh.lookAt(0, 0, 0);
    this.scene.add(this.moonMesh);
  }

  update(dt, playerZ = 0) {
    this.time = (this.time + dt) % this.cycleDuration;
    this.timeRatio = this.time / this.cycleDuration;

    if (this.starPoints) {
      this.starPoints.position.z = playerZ;
    }
    if (this.moonMesh) {
      this.moonMesh.position.z = playerZ + 80;
    }

    // Find keyframe interval
    let kfA = this.keyframes[0];
    let kfB = this.keyframes[1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (this.timeRatio >= this.keyframes[i].ratio && this.timeRatio <= this.keyframes[i + 1].ratio) {
        kfA = this.keyframes[i];
        kfB = this.keyframes[i + 1];
        break;
      }
    }

    const span = kfB.ratio - kfA.ratio;
    const t = span > 0 ? (this.timeRatio - kfA.ratio) / span : 0;

    // Interpolate Sunlight
    if (this.sunLight) {
      this.sunLight.color.copy(kfA.sunColor).lerp(kfB.sunColor, t);
      this.sunLight.intensity = THREE.MathUtils.lerp(kfA.sunIntensity, kfB.sunIntensity, t);
      this.sunLight.position.lerpVectors(kfA.sunPos, kfB.sunPos, t);
      this.sunLight.position.z += playerZ;
      if (this.sunLight.target) {
        this.sunLight.target.position.set(0, 0, playerZ);
      }
    }

    // Interpolate Hemisphere light
    if (this.hemiLight) {
      this.hemiLight.color.copy(kfA.hemiSky).lerp(kfB.hemiSky, t);
      this.hemiLight.groundColor.copy(kfA.hemiGround).lerp(kfB.hemiGround, t);
    }

    // Interpolate Ambient
    if (this.ambientLight) {
      this.ambientLight.color.copy(kfA.ambientColor).lerp(kfB.ambientColor, t);
      this.ambientLight.intensity = THREE.MathUtils.lerp(kfA.ambientIntensity, kfB.ambientIntensity, t);
    }

    // Fog & Background
    if (this.scene.fog) {
      this.scene.fog.color.copy(kfA.fogColor).lerp(kfB.fogColor, t);
    }
    if (this.scene.background && this.scene.background.isColor) {
      this.scene.background.copy(kfA.fogColor).lerp(kfB.fogColor, t);
    }

    // Stars & Moon
    const starAlpha = THREE.MathUtils.lerp(kfA.starsOpacity, kfB.starsOpacity, t);
    if (this.starMat) {
      this.starMat.opacity = starAlpha;
    }
    if (this.moonMesh) {
      this.moonMesh.material.opacity = Math.min(0.9, starAlpha * 1.1);
    }
  }

  getTimeOfDayName() {
    if (this.timeRatio < 0.12) return 'Sunrise';
    if (this.timeRatio < 0.45) return 'Bright Daytime';
    if (this.timeRatio < 0.60) return 'Sunset';
    if (this.timeRatio < 0.72) return 'Dusk';
    return 'Moonlit Night';
  }
}
