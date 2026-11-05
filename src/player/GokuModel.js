import * as THREE from 'three';
import { modelLoader } from '../utils/ModelAssetLoader.js';

/**
 * 3D Goku Character Model
 * Directly integrates the downloaded 3D Goku model (baby_goku_super_saiyan_iii.glb).
 * Features:
 * - Authentic 3D geometry with anime Gi, martial arts belt, boots, and spiky Saiyan hair.
 * - Dynamic texture swapping: Base Form (black hair, dark eyes) and Super Saiyan (golden hair, teal eyes).
 * - Full procedural animation support (running hop, stride sway, forward lean, jump tuck, slide crouch, banking).
 * - Super Saiyan visual aura, dynamic golden glow light, and orbiting crackling lightning arcs.
 */
export class GokuModel {
  constructor() {
    this.group = new THREE.Group();
    this.isSuperSaiyan = false;
    this.sparkMeshes = [];
    this.modelLoaded = false;

    // Outer animation root (for stride hop, slide drop, squash & stretch)
    this.animRoot = new THREE.Group();
    this.group.add(this.animRoot);

    // Inner model container (holds centered 3D mesh)
    this.modelContainer = new THREE.Group();
    this.animRoot.add(this.modelContainer);

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    this.baseTexture = textureLoader.load('textures/goku_base_diffuse.png');
    this.baseTexture.colorSpace = THREE.SRGBColorSpace;
    this.baseTexture.flipY = false;

    this.ssjTexture = textureLoader.load('textures/goku_ssj_diffuse.png');
    this.ssjTexture.colorSpace = THREE.SRGBColorSpace;
    this.ssjTexture.flipY = false;

    // Goku PBR Anime Material
    this.gokuMaterial = new THREE.MeshStandardMaterial({
      map: this.baseTexture,
      roughness: 0.6,
      metalness: 0.04,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0
    });

    // Build Aura & SSJ FX
    this.buildSuperSaiyanFX();

    // Load and attach the 3D Character Models
    this.currentSkin = 'GOGETA';
    this.loadCharacterModels();
  }

  loadCharacterModels() {
    const initSkin = () => {
      this.applySkin(this.currentSkin);
    };

    if (modelLoader.isReady) {
      initSkin();
    } else {
      modelLoader.onReady(initSkin);
    }
  }

  applySkin(skinName) {
    this.currentSkin = skinName;
    if (!modelLoader.isReady) return;

    // Clear old character meshes from container
    while (this.modelContainer.children.length > 0) {
      this.modelContainer.remove(this.modelContainer.children[0]);
    }

    if (skinName === 'GOGETA' && modelLoader.has('gogeta')) {
      const gogeta = modelLoader.createInstance('gogeta');
      if (gogeta) {
        const scale = 1.75;
        gogeta.scale.set(scale, scale, scale);
        gogeta.position.set(0, 0.85, 0);
        gogeta.rotation.set(0, 0, 0);
        gogeta.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        this.characterGroup = gogeta;
        this.modelContainer.add(gogeta);
        this.modelLoaded = true;
        console.log('[GokuModel] Successfully loaded Gogeta Adult Saiyan model.');
        return;
      }
    }

    // Default: Chibi Goku SSJ3 model with dynamic material options
    if (modelLoader.has('chibi_goku_ssj3')) {
      const goku = modelLoader.createInstance('chibi_goku_ssj3');
      if (goku) {
        const scale = 0.65;
        goku.scale.set(scale, scale, scale);
        goku.position.set(-0.014, 0.0, 0.22);
        goku.rotation.set(0, 0, 0);

        goku.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
            if (!c.userData.originalMaterial) {
              c.userData.originalMaterial = c.material;
            }
            if (skinName === 'CHIBI_SSJ3') {
              // Use authentic original Sketchfab SSJ3 texture
              c.material = c.userData.originalMaterial;
            } else {
              // Use Base Form black hair texture
              c.material = this.gokuMaterial;
            }
          }
        });

        this.characterGroup = goku;
        this.modelContainer.add(goku);
        this.modelLoaded = true;
        console.log('[GokuModel] Successfully loaded Goku model with skin:', skinName);
      }
    }
  }

  setSkin(skinName) {
    this.applySkin(skinName);
  }

  buildSuperSaiyanFX() {
    // 1. Golden Glowing Energy Aura Shell
    const auraGeo = new THREE.CylinderGeometry(0.75, 1.05, 2.3, 16, 4, true);
    this.auraMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorCore: { value: new THREE.Color(0xfff68f) },
        colorEdge: { value: new THREE.Color(0xff8c00) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          // Flickering flame displacement
          float wave = sin(position.y * 8.0 - time * 16.0) * 0.08 + sin(position.x * 6.0 + time * 12.0) * 0.05;
          vec3 displaced = position + normal * wave;
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
          rim = pow(rim, 1.8);
          float flicker = sin(time * 20.0 + vPosition.y * 14.0) * 0.18 + 0.82;
          vec3 col = mix(colorCore, colorEdge, rim);
          gl_FragColor = vec4(col * flicker, rim * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.auraMesh = new THREE.Mesh(auraGeo, this.auraMaterial);
    this.auraMesh.position.set(0, 0.95, 0);
    this.auraMesh.visible = false;
    this.animRoot.add(this.auraMesh);

    // 2. Super Saiyan Dynamic Light
    this.ssjLight = new THREE.PointLight(0xffdf44, 0, 10, 1.5);
    this.ssjLight.position.set(0, 1.2, 0);
    this.animRoot.add(this.ssjLight);

    // 3. Crackling Lightning Sparks
    this.sparkGroup = new THREE.Group();
    this.sparkGroup.position.set(0, 0.9, 0);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0x66ffff, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 5; i++) {
      const arcGeo = new THREE.BoxGeometry(0.025, 0.35, 0.025);
      const arcMesh = new THREE.Mesh(arcGeo, sparkMat);
      arcMesh.visible = false;
      this.sparkGroup.add(arcMesh);
      this.sparkMeshes.push(arcMesh);
    }
    this.animRoot.add(this.sparkGroup);
  }

  setSuperSaiyan(isSSJ) {
    this.isSuperSaiyan = isSSJ;

    if (this.currentSkin === 'GOGETA' && this.characterGroup) {
      this.characterGroup.traverse((c) => {
        if (c.isMesh && c.material) {
          if (isSSJ) {
            c.material.emissive = new THREE.Color(0xff9900);
            c.material.emissiveIntensity = 0.35;
          } else {
            c.material.emissive = new THREE.Color(0x000000);
            c.material.emissiveIntensity = 0.0;
          }
        }
      });
    }

    if (isSSJ) {
      this.gokuMaterial.map = this.ssjTexture;
      this.gokuMaterial.emissive.setHex(0xffaa00);
      this.gokuMaterial.emissiveIntensity = 0.4;
      this.gokuMaterial.roughness = 0.42;
      this.auraMesh.visible = true;
      this.ssjLight.intensity = 3.6;
      this.sparkMeshes.forEach(m => { m.visible = true; });
    } else {
      this.gokuMaterial.map = this.baseTexture;
      this.gokuMaterial.emissive.setHex(0x000000);
      this.gokuMaterial.emissiveIntensity = 0.0;
      this.gokuMaterial.roughness = 0.6;
      this.auraMesh.visible = false;
      this.ssjLight.intensity = 0;
      this.sparkMeshes.forEach(m => { m.visible = false; });
    }
    this.gokuMaterial.needsUpdate = true;
  }

  update(totalTime, dt) {
    // Aura flame animation
    if (this.isSuperSaiyan && this.auraMaterial && this.auraMaterial.uniforms) {
      this.auraMaterial.uniforms.time.value = totalTime;
      this.auraMesh.rotation.y = totalTime * 3.5;
      this.ssjLight.intensity = 3.2 + Math.sin(totalTime * 18.0) * 0.6;

      // Orbiting lightning arcs
      for (let i = 0; i < this.sparkMeshes.length; i++) {
        const arc = this.sparkMeshes[i];
        if (Math.random() > 0.3) {
          arc.visible = true;
          const angle = totalTime * 10.0 + (i * Math.PI * 2) / this.sparkMeshes.length;
          const radius = 0.55 + Math.random() * 0.3;
          arc.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.9, Math.sin(angle) * radius);
          arc.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        } else {
          arc.visible = false;
        }
      }
    }
  }
}
