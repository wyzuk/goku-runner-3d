import * as THREE from 'three';

/**
 * Procedural Texture Generator for PBR Materials
 * Generates crisp, seamless textures using Canvas2D for maximum compatibility and 0 external download dependencies.
 */
class TextureGenerator {
  static createAsphaltDiffuse(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base charcoal tone
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, size, size);

    // Fine mineral aggregate specks
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      const speck = Math.random() > 0.96 ? 40 : 0;
      data[i] = Math.min(255, Math.max(0, data[i] + noise + speck));     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + speck)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + speck + 4)); // B slightly cooler
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createAsphaltNormal(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Flat normal color (128, 128, 255)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const nx = 128 + (Math.random() - 0.5) * 40;
      const ny = 128 + (Math.random() - 0.5) * 40;
      data[i] = nx;
      data[i + 1] = ny;
      data[i + 2] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createAsphaltRoughness(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#d0d0d0'; // High roughness (matte asphalt)
    ctx.fillRect(0, 0, size, size);

    // Subtle tire track smooth lanes (slightly lower roughness)
    ctx.fillStyle = 'rgba(160, 160, 160, 0.4)';
    ctx.fillRect(size * 0.15, 0, size * 0.2, size);
    ctx.fillRect(size * 0.65, 0, size * 0.2, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createGrassDiffuse(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rich anime green base
    ctx.fillStyle = '#4fa32d';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, data[i] + n * 0.6));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.3));
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createRockDiffuse(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#6e7782';
    ctx.fillRect(0, 0, size, size);

    // Geological horizontal rock bands / strata
    for (let y = 0; y < size; y += 12) {
      const shade = (Math.sin(y * 0.08) * 20 + (Math.random() - 0.5) * 15);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(shade) / 120})`;
      ctx.fillRect(0, y, size, Math.random() * 8 + 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createWaterNormal(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    // Soft animated wave ripples
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const wave1 = Math.sin(x * 0.1 + y * 0.05);
        const wave2 = Math.cos(x * 0.05 - y * 0.1);
        data[idx] = 128 + wave1 * 25;
        data[idx + 1] = 128 + wave2 * 25;
        data[idx + 2] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createToonRamp(steps = 4) {
    const canvas = document.createElement('canvas');
    canvas.width = steps;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < steps; i++) {
      const val = Math.floor((i / (steps - 1)) * 255);
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(i, 0, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }
}

let sharedMaterialManager = null;
export function getMaterialManager() {
  if (!sharedMaterialManager) {
    sharedMaterialManager = new MaterialManager();
  }
  return sharedMaterialManager;
}

export class MaterialManager {
  constructor() {
    this.toonRamp = TextureGenerator.createToonRamp(4);

    // 1. Road Materials (PBR MeshStandardMaterial)
    this.asphaltDiffuse = TextureGenerator.createAsphaltDiffuse();
    this.asphaltNormal = TextureGenerator.createAsphaltNormal();
    this.asphaltRoughness = TextureGenerator.createAsphaltRoughness();

    this.asphaltDiffuse.repeat.set(3, 12);
    this.asphaltNormal.repeat.set(3, 12);
    this.asphaltRoughness.repeat.set(3, 12);

    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: this.asphaltDiffuse,
      normalMap: this.asphaltNormal,
      roughnessMap: this.asphaltRoughness,
      roughness: 0.88,
      metalness: 0.08
    });

    // Road Lane Lines Material
    this.laneLineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });

    // Road Edge Curb Material (Concrete bevel)
    this.curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x9fa4a6,
      roughness: 0.8,
      metalness: 0.05
    });

    // Road Shoulder Material (Gravel & Dirt)
    this.shoulderMaterial = new THREE.MeshStandardMaterial({
      color: 0x7a6b52,
      roughness: 0.95,
      metalness: 0.02
    });

    // 2. Terrain & Environment Materials
    this.grassDiffuse = TextureGenerator.createGrassDiffuse();
    this.grassDiffuse.repeat.set(4, 8);

    this.terrainMaterial = new THREE.MeshStandardMaterial({
      map: this.grassDiffuse,
      color: 0x4fb028,
      roughness: 0.85,
      metalness: 0.0
    });

    this.rockDiffuse = TextureGenerator.createRockDiffuse();
    this.rockDiffuse.repeat.set(2, 4);

    this.rockMaterial = new THREE.MeshStandardMaterial({
      map: this.rockDiffuse,
      roughness: 0.9,
      metalness: 0.05
    });

    this.mountainMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a728f,
      roughness: 0.92,
      metalness: 0.03
    });

    // 3. Foliage & Trees
    this.barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x543d2b,
      roughness: 0.92,
      metalness: 0.02
    });

    this.foliageMaterial = new THREE.MeshToonMaterial({
      color: 0x389e24,
      gradientMap: this.toonRamp
    });

    this.pineMaterial = new THREE.MeshToonMaterial({
      color: 0x226b2b,
      gradientMap: this.toonRamp
    });

    // 4. Flowing Water Material
    this.waterNormal = TextureGenerator.createWaterNormal();
    this.waterNormal.repeat.set(4, 16);

    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x2288dd,
      roughness: 0.15,
      metalness: 0.1,
      normalMap: this.waterNormal,
      transparent: true,
      opacity: 0.85
    });

    // 5. Stylized Cel-Shaded Goku Materials
    this.skinMaterial = new THREE.MeshToonMaterial({
      color: 0xfbd0a6,
      gradientMap: this.toonRamp
    });

    this.giOrangeMaterial = new THREE.MeshToonMaterial({
      color: 0xff5400,
      gradientMap: this.toonRamp
    });

    this.blueClothingMaterial = new THREE.MeshToonMaterial({
      color: 0x0c2b6f,
      gradientMap: this.toonRamp
    });

    this.bootsMaterial = new THREE.MeshToonMaterial({
      color: 0x081d4a,
      gradientMap: this.toonRamp
    });

    this.bootTrimMaterial = new THREE.MeshToonMaterial({
      color: 0xcc2222,
      gradientMap: this.toonRamp
    });

    this.hairBlackMaterial = new THREE.MeshToonMaterial({
      color: 0x141419,
      gradientMap: this.toonRamp
    });

    this.hairSSJMaterial = new THREE.MeshToonMaterial({
      color: 0xffd826,
      emissive: 0xffa500,
      emissiveIntensity: 0.55,
      gradientMap: this.toonRamp
    });

    this.eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.eyeNormalMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    this.eyeSSJMaterial = new THREE.MeshBasicMaterial({ color: 0x11eecc }); // Turquoise SSJ eyes
    this.kanjiMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // 6. Super Saiyan Dynamic Aura Shell Shader
    this.auraMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorCore: { value: new THREE.Color(0xfff275) },
        colorEdge: { value: new THREE.Color(0xff8800) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec3 displaced = position + normal * (sin(position.y * 10.0 + time * 14.0) * 0.06 + 0.05);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorCore;
        uniform vec3 colorEdge;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float viewDot = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
          float rim = 1.0 - abs(viewDot);
          rim = pow(rim, 1.6);
          float flicker = sin(time * 16.0 + vPosition.y * 12.0) * 0.15 + 0.85;
          vec3 col = mix(colorCore, colorEdge, rim);
          gl_FragColor = vec4(col * flicker, rim * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  update(dt, totalTime) {
    if (this.auraMaterial.uniforms) {
      this.auraMaterial.uniforms.time.value = totalTime;
    }
    // Animate river water normal map offset
    if (this.waterNormal) {
      this.waterNormal.offset.y = (totalTime * 0.25) % 1;
      this.waterNormal.offset.x = (Math.sin(totalTime * 0.5) * 0.02) % 1;
    }
  }

  setWetness(wetFactor) {
    // Road wetness during rain: increases specular, drops roughness
    const baseRoughness = 0.88;
    this.roadMaterial.roughness = baseRoughness * (1.0 - wetFactor * 0.5);
    this.roadMaterial.metalness = 0.08 + wetFactor * 0.35;
  }
}
