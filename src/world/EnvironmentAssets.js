import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterialManager } from '../materials/MaterialManager.js';
import { modelLoader } from '../utils/ModelAssetLoader.js';

/**
 * High-Performance AAA Environment Asset System
 * Reconstructs the complete visual presentation to match the reference image:
 * - Lush, dense alpine valleys with rolling green hills
 * - Tall conifer pine trees and leafy broadleaf oak trees
 * - Dense roadside wildflowers (purple lupines, white daisies, yellow flowers)
 * - Rustic wooden split-rail fences along the road verge
 * - Mossy tree stumps and fallen logs
 * - Majestic distant snow-capped mountains with cascading waterfalls and atmospheric depth
 * - Batched and Instanced rendering for 60 FPS performance
 */
export class EnvironmentAssets {
  constructor() {
    this.matMgr = getMaterialManager();
    this.initMaterials();
    this.initGeometries();
  }

  initMaterials() {
    // 1. Natural Wood Bark & Foliage
    this.barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x543c2a,
      roughness: 0.88,
      metalness: 0.02
    });

    this.pineMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f5c24, // Deep vibrant pine green
      roughness: 0.76,
      metalness: 0.02
    });

    this.oakMaterial = new THREE.MeshStandardMaterial({
      color: 0x3ea826, // Lush anime oak green
      roughness: 0.72,
      metalness: 0.02
    });

    this.bushMaterial = new THREE.MeshStandardMaterial({
      color: 0x47b528, // Bright vibrant shrub green
      roughness: 0.68,
      metalness: 0.01
    });

    this.fernMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e8f23,
      roughness: 0.65,
      metalness: 0.01,
      side: THREE.DoubleSide
    });

    // 2. Roadside Wildflowers (matching reference image)
    this.flowerPurpleMaterial = new THREE.MeshStandardMaterial({
      color: 0x933be0, // Rich anime purple lupine
      roughness: 0.55,
      metalness: 0.02,
      emissive: new THREE.Color(0x321155),
      emissiveIntensity: 0.25
    });

    this.flowerWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White daisy petals
      roughness: 0.45,
      metalness: 0.01
    });

    this.flowerYellowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffca18, // Yellow buttercup / daisy center
      roughness: 0.45,
      metalness: 0.01,
      emissive: new THREE.Color(0x443300),
      emissiveIntensity: 0.2
    });

    // 3. Roadside Props (Fence, Stumps, Rocks)
    this.fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x86674a, // Weathered cedar split-rail wood
      roughness: 0.85,
      metalness: 0.02
    });

    this.stumpMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a4330,
      roughness: 0.88,
      metalness: 0.02
    });

    this.stumpTopMaterial = new THREE.MeshStandardMaterial({
      color: 0x9e8061, // Annual ring wood surface
      roughness: 0.82,
      metalness: 0.01
    });

    this.rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x6e7884, // Smooth slate/granite boulder
      roughness: 0.88,
      metalness: 0.04
    });

    // 4. Distant Alpine Mountains
    this.mountainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
      flatShading: true
    });

    this.waterfallMaterial = new THREE.MeshStandardMaterial({
      color: 0xb5f0ff,
      emissive: new THREE.Color(0x55ccff),
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });

    // 5. Fluffy Clouds
    this.cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88
    });
  }

  initGeometries() {
    // 1. PINE TREE (Conifer)
    const pTrunk = new THREE.CylinderGeometry(0.3, 0.55, 4.2, 7);
    pTrunk.translate(0, 2.1, 0);
    this.pineTrunkGeo = pTrunk;

    const c1 = new THREE.ConeGeometry(2.5, 3.4, 7);
    c1.translate(0, 3.6, 0);
    const c2 = new THREE.ConeGeometry(2.0, 3.0, 7);
    c2.translate(0, 5.4, 0);
    const c3 = new THREE.ConeGeometry(1.4, 2.4, 7);
    c3.translate(0, 7.0, 0);
    this.pineLeavesGeo = BufferGeometryUtils.mergeGeometries([c1, c2, c3]);

    // 2. OAK TREE (Broadleaf)
    const oTrunk = new THREE.CylinderGeometry(0.48, 0.72, 4.4, 7);
    oTrunk.translate(0, 2.2, 0);
    this.oakTrunkGeo = oTrunk;

    const s1 = new THREE.SphereGeometry(2.3, 8, 6);
    s1.translate(0, 5.3, 0);
    const s2 = new THREE.SphereGeometry(1.75, 8, 6);
    s2.translate(1.3, 4.6, 0.4);
    const s3 = new THREE.SphereGeometry(1.65, 8, 6);
    s3.translate(-1.2, 4.7, -0.3);
    const s4 = new THREE.SphereGeometry(1.5, 8, 6);
    s4.translate(0.1, 6.2, -0.6);
    this.oakLeavesGeo = BufferGeometryUtils.mergeGeometries([s1, s2, s3, s4]);

    // 3. STYLIZED BUSH
    const b1 = new THREE.SphereGeometry(1.0, 7, 6);
    b1.translate(0, 0.75, 0);
    const b2 = new THREE.SphereGeometry(0.75, 6, 5);
    b2.translate(0.65, 0.6, 0.3);
    const b3 = new THREE.SphereGeometry(0.7, 6, 5);
    b3.translate(-0.6, 0.65, -0.2);
    this.bushGeo = BufferGeometryUtils.mergeGeometries([b1, b2, b3]);

    // 4. FERN CLUMP
    const fronds = [];
    for (let f = 0; f < 5; f++) {
      const frond = new THREE.PlaneGeometry(0.35, 1.3, 1, 3);
      const angle = (f / 5) * Math.PI * 2;
      frond.rotateX(-0.4);
      frond.rotateY(angle);
      frond.translate(Math.cos(angle) * 0.25, 0.5, Math.sin(angle) * 0.25);
      fronds.push(frond);
    }
    this.fernGeo = BufferGeometryUtils.mergeGeometries(fronds);

    // 5. PURPLE LUPINE WILDFLOWER
    const lupStem = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4);
    lupStem.translate(0, 0.35, 0);
    const lupCone = new THREE.ConeGeometry(0.13, 0.52, 6);
    lupCone.translate(0, 0.72, 0);
    this.purpleLupineGeo = BufferGeometryUtils.mergeGeometries([lupStem, lupCone]);

    // 6. WHITE DAISY WILDFLOWER
    const daiStem = new THREE.CylinderGeometry(0.02, 0.02, 0.55, 4);
    daiStem.translate(0, 0.28, 0);
    const daiHead = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 6);
    daiHead.translate(0, 0.56, 0);
    this.whiteDaisyGeo = BufferGeometryUtils.mergeGeometries([daiStem, daiHead]);

    // 7. RUSTIC WOODEN SPLIT-RAIL FENCE
    const post1 = new THREE.CylinderGeometry(0.08, 0.09, 1.15, 6);
    post1.translate(-1.6, 0.55, 0);
    const post2 = new THREE.CylinderGeometry(0.08, 0.09, 1.15, 6);
    post2.translate(1.6, 0.55, 0);
    const railTop = new THREE.BoxGeometry(3.28, 0.08, 0.06);
    railTop.translate(0, 0.88, 0);
    const railBottom = new THREE.BoxGeometry(3.28, 0.08, 0.06);
    railBottom.translate(0, 0.46, 0);
    this.fenceGeo = BufferGeometryUtils.mergeGeometries([post1, post2, railTop, railBottom]);

    // 8. TREE STUMP & FALLEN LOG
    const stumpTrunk = new THREE.CylinderGeometry(0.5, 0.65, 0.9, 8);
    stumpTrunk.translate(0, 0.45, 0);
    const stumpTop = new THREE.CylinderGeometry(0.48, 0.48, 0.03, 8);
    stumpTop.translate(0, 0.91, 0);
    this.stumpGeo = BufferGeometryUtils.mergeGeometries([stumpTrunk, stumpTop]);

    // Fallen Log
    const logGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.8, 8);
    logGeo.rotateZ(Math.PI / 2);
    logGeo.translate(0, 0.35, 0);
    this.logGeo = logGeo;

    // 9. SMOOTH NATURAL BOULDER
    const bGeo = new THREE.DodecahedronGeometry(1.3, 1).toNonIndexed();
    // Non-indexed jitter for rock facets
    const bPos = bGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const vx = bPos.getX(i);
      const vy = bPos.getY(i) * 0.75; // Slightly flattened river stone
      const vz = bPos.getZ(i);
      bPos.setXYZ(i, vx, vy + 0.65, vz);
    }
    bGeo.computeVertexNormals();
    this.rockGeo = bGeo;
  }

  /**
   * Generates a high-quality distant alpine mountain ridge with snow peaks,
   * rugged granite cliffs, foothill transitions, and an optional cascading waterfall.
   */
  createAlpineMountainRange(width = 130, height = 80, depth = 90, hasWaterfall = true) {
    const group = new THREE.Group();
    const segments = 16;
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = [];
    const snowLine = height * 0.46;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distRatio = Math.hypot(x / (width / 2), z / (depth / 2));
      const falloff = Math.max(0, 1.0 - distRatio);

      // Sharp alpine ridges with jagged peaks
      const ridgeNoise = Math.sin(x * 0.07) * 0.3 + Math.cos(z * 0.08) * 0.25 + 0.85;
      const y = Math.pow(falloff, 1.5) * ridgeNoise * height;
      pos.setY(i, y);

      if (y > snowLine) {
        // Pure alpine snow peak
        colors.push(0.94, 0.96, 0.99);
      } else if (y > height * 0.18) {
        // Rocky granite cliff face
        const t = (y - height * 0.18) / (snowLine - height * 0.18);
        colors.push(0.32 + t * 0.18, 0.36 + t * 0.18, 0.42 + t * 0.22);
      } else {
        // Lush green foothills meeting the valley
        colors.push(0.24, 0.46, 0.18);
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mountainMesh = new THREE.Mesh(geo, this.mountainMaterial);
    mountainMesh.castShadow = false; // Never cast expensive shadows from background
    mountainMesh.receiveShadow = false;
    group.add(mountainMesh);

    // Cascading Waterfall Ribbon (matching reference image)
    if (hasWaterfall) {
      const wfGeo = new THREE.PlaneGeometry(3.6, height * 0.55, 1, 4);
      wfGeo.translate(0, height * 0.32, depth * 0.22);
      const waterfallMesh = new THREE.Mesh(wfGeo, this.waterfallMaterial);
      group.add(waterfallMesh);
    }

    return group;
  }

  /**
   * Puffy Anime Cumulus Cloud
   */
  createCloud() {
    const cloud = new THREE.Group();
    const mat = this.cloudMaterial;

    const base = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), mat);
    base.scale.set(1.8, 0.7, 1.1);
    cloud.add(base);

    const p1 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), mat);
    p1.position.set(-2.2, 0.3, 0.2);
    cloud.add(p1);

    const p2 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), mat);
    p2.position.set(2.0, 0.4, -0.2);
    cloud.add(p2);

    const top = new THREE.Mesh(new THREE.SphereGeometry(1.8, 7, 7), mat);
    top.position.set(0.2, 1.3, 0);
    cloud.add(top);

    return cloud;
  }
}
