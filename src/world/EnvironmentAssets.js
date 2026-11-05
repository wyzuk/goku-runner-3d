import * as THREE from 'three';
import { getMaterialManager } from '../materials/MaterialManager.js';
import { modelLoader } from '../utils/ModelAssetLoader.js';

/**
 * EnvironmentAssets
 * Spawns rich 3D models for the environment, vegetation, rocks, and trees.
 * Uses cached GLB instances from ModelAssetLoader, with clean procedural fallbacks.
 */
export class EnvironmentAssets {
  constructor() {
    this.matMgr = getMaterialManager();
    this.materials = {
      trunk: this.matMgr.barkMaterial,
      oakLeaves: this.matMgr.foliageMaterial,
      pineLeaves: this.matMgr.pineMaterial,
      rock: this.matMgr.rockMaterial,
      desertRock: new THREE.MeshStandardMaterial({ color: 0xba7645, roughness: 0.9, metalness: 0.05 }),
      cactus: new THREE.MeshToonMaterial({ color: 0x2e8b46, gradientMap: this.matMgr.toonRamp }),
      cloud: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
      marblePillar: new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.4, metalness: 0.1 }),
      goldPillarCap: new THREE.MeshStandardMaterial({ color: 0xffcc22, roughness: 0.3, metalness: 0.8, emissive: 0x443300 })
    };
  }

  // ==========================================
  // 1. TREES & FOREST
  // ==========================================

  createOakTree(scale = 1.0) {
    if (modelLoader.has('tree_oak')) {
      const tree = modelLoader.createInstance('tree_oak');
      const s = 0.95 * scale;
      tree.scale.set(s, s, s);
      tree.rotation.y = Math.random() * Math.PI * 2;
      return tree;
    }
    return this._fallbackOakTree();
  }

  createPineTree(scale = 1.0) {
    if (modelLoader.has('tree_pine')) {
      const tree = modelLoader.createInstance('tree_pine');
      // Native unit scale is ~300cm; scale to ~8m - 10m height
      const s = 0.03 * scale;
      tree.scale.set(s, s, s);
      tree.rotation.y = Math.random() * Math.PI * 2;
      return tree;
    }
    return this._fallbackPineTree();
  }

  createSmallTreeCluster(scale = 1.0) {
    if (modelLoader.has('tree_small')) {
      const cluster = modelLoader.createInstance('tree_small');
      const s = 1.6 * scale;
      cluster.scale.set(s, s, s);
      cluster.rotation.y = Math.random() * Math.PI * 2;
      return cluster;
    }
    return this._fallbackPineTree();
  }

  createDeadTreeCluster(scale = 1.0) {
    if (modelLoader.has('tree_dead')) {
      const dead = modelLoader.createInstance('tree_dead');
      const s = 0.0045 * scale;
      dead.scale.set(s, s, s);
      dead.rotation.y = Math.random() * Math.PI * 2;
      return dead;
    }
    return this._fallbackOakTree();
  }

  // ==========================================
  // 2. ROCKS & BOULDERS
  // ==========================================

  createLargeBoulder(scale = 1.0) {
    if (modelLoader.has('rock_large')) {
      const rock = modelLoader.createInstance('rock_large');
      const s = 1.25 * scale;
      rock.scale.set(s, s, s);
      rock.rotation.y = Math.random() * Math.PI * 2;
      return rock;
    }
    return this.createSceneryRock(false);
  }

  createDesertRock(scale = 1.0) {
    if (modelLoader.has('rock_desert')) {
      const rock = modelLoader.createInstance('rock_desert');
      const s = 1.15 * scale;
      rock.scale.set(s, s, s);
      rock.rotation.y = Math.random() * Math.PI * 2;
      return rock;
    }
    return this.createSceneryRock(true);
  }

  createFlatRockFormation(scale = 1.0) {
    if (modelLoader.has('rock_flat')) {
      const rock = modelLoader.createInstance('rock_flat');
      const s = 0.28 * scale;
      rock.scale.set(s, s, s);
      rock.rotation.y = Math.random() * Math.PI * 2;
      return rock;
    }
    return this.createSceneryRock(false);
  }

  createSmallRockGroup(scale = 1.0) {
    const key = Math.random() > 0.5 ? 'rock_small' : 'rock_cluster';
    if (modelLoader.has(key)) {
      const rock = modelLoader.createInstance(key);
      const s = (key === 'rock_small' ? 0.75 : 0.55) * scale;
      rock.scale.set(s, s, s);
      rock.rotation.y = Math.random() * Math.PI * 2;
      return rock;
    }
    return this.createSceneryRock(false);
  }

  createRockTreeVignette(scale = 1.0) {
    if (modelLoader.has('rock_tree_vignette')) {
      const vig = modelLoader.createInstance('rock_tree_vignette');
      const s = 2.4 * scale;
      vig.scale.set(s, s, s);
      vig.rotation.y = Math.random() * Math.PI * 2;
      return vig;
    }
    return this.createLargeBoulder();
  }

  createCrystalCluster(scale = 1.0) {
    if (modelLoader.has('crystal_cluster')) {
      const crystal = modelLoader.createInstance('crystal_cluster');
      const s = 1.2 * scale;
      crystal.scale.set(s, s, s);
      crystal.rotation.y = Math.random() * Math.PI * 2;
      return crystal;
    }
    return this.createLargeBoulder();
  }

  // ==========================================
  // 3. FOLIAGE & UNDERGROWTH
  // ==========================================

  createStylizedBush(scale = 1.0) {
    if (modelLoader.has('bush_stylized')) {
      const bush = modelLoader.createInstance('bush_stylized');
      const s = 1.2 * scale;
      bush.scale.set(s, s, s);
      bush.rotation.y = Math.random() * Math.PI * 2;
      return bush;
    }
    return this._fallbackBush();
  }

  createGrassTuft(scale = 1.0) {
    const key = Math.random() > 0.5 ? 'grass_tufts' : 'grass_patch';
    if (modelLoader.has(key)) {
      const grass = modelLoader.createInstance(key);
      const s = (key === 'grass_tufts' ? 1.3 : 0.55) * scale;
      grass.scale.set(s, s, s);
      grass.rotation.y = Math.random() * Math.PI * 2;
      return grass;
    }
    return null;
  }

  createFern(scale = 1.0) {
    if (modelLoader.has('fern')) {
      const fern = modelLoader.createInstance('fern');
      const s = 0.85 * scale;
      fern.scale.set(s, s, s);
      fern.rotation.y = Math.random() * Math.PI * 2;
      return fern;
    }
    return null;
  }

  createFlowerPatch(scale = 1.0) {
    if (modelLoader.has('flower_plant')) {
      const flower = modelLoader.createInstance('flower_plant');
      const s = 1.1 * scale;
      flower.scale.set(s, s, s);
      flower.rotation.y = Math.random() * Math.PI * 2;
      return flower;
    }
    return null;
  }

  // ==========================================
  // 4. FOREST FLOOR PROPS
  // ==========================================

  createMossyLogProp(scale = 1.0) {
    if (modelLoader.has('mossy_log')) {
      const log = modelLoader.createInstance('mossy_log');
      const s = 1.8 * scale;
      log.scale.set(s, s, s);
      log.rotation.y = Math.random() * Math.PI * 2;
      return log;
    }
    return null;
  }

  createBrokenBranchProp(scale = 1.0) {
    if (modelLoader.has('broken_branch')) {
      const branch = modelLoader.createInstance('broken_branch');
      const s = 3.4 * scale;
      branch.scale.set(s, s, s);
      branch.rotation.y = Math.random() * Math.PI * 2;
      return branch;
    }
    return null;
  }

  // ==========================================
  // 5. MOUNTAIN GEOMETRIES
  // ==========================================

  createMountain(type = 0, scale = 1.0) {
    const keys = ['mtn_main', 'mtn_ridge', 'mtn_peak', 'mtn_crag'];
    const chosenKey = keys[type % keys.length];

    if (modelLoader.has(chosenKey)) {
      const mtn = modelLoader.createInstance(chosenKey);
      let baseScale = 0.55;
      if (chosenKey === 'mtn_crag') baseScale = 11.0;
      else if (chosenKey === 'mtn_peak') baseScale = 0.38;
      else if (chosenKey === 'mtn_ridge') baseScale = 0.48;

      const s = baseScale * scale;
      mtn.scale.set(s, s, s);
      mtn.rotation.y = Math.random() * Math.PI * 2;
      return mtn;
    }
    return null;
  }

  // ==========================================
  // FALLBACKS & SPECIAL ASSETS
  // ==========================================

  createCactus() {
    const cactus = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 2.5, 8),
      this.materials.cactus
    );
    body.position.y = 1.25;
    body.castShadow = true;
    cactus.add(body);

    const armL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6), this.materials.cactus);
    armL1.position.set(-0.35, 1.4, 0);
    armL1.rotation.z = Math.PI / 2;
    const armL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6), this.materials.cactus);
    armL2.position.set(-0.6, 1.7, 0);
    cactus.add(armL1, armL2);

    const armR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6), this.materials.cactus);
    armR1.position.set(0.3, 1.0, 0);
    armR1.rotation.z = -Math.PI / 2;
    const armR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6), this.materials.cactus);
    armR2.position.set(0.5, 1.25, 0);
    cactus.add(armR1, armR2);

    return cactus;
  }

  createMarblePillar() {
    const pillar = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), this.materials.marblePillar);
    base.position.y = 0.2;
    pillar.add(base);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 4.0, 10), this.materials.marblePillar);
    shaft.position.y = 2.4;
    shaft.castShadow = true;
    pillar.add(shaft);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.45, 0.5, 10), this.materials.goldPillarCap);
    cap.position.y = 4.5;
    cap.castShadow = true;
    pillar.add(cap);

    return pillar;
  }

  createSceneryRock(isDesert = false) {
    const mat = isDesert ? this.materials.desertRock : this.materials.rock;
    const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
    rockGeo.scale(1.2, 0.8, 1.1);
    const rock = new THREE.Mesh(rockGeo, mat);
    rock.position.y = 0.8;
    rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  createCloud() {
    const cloud = new THREE.Group();
    const mat = this.materials.cloud;

    const basePuff = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), mat);
    basePuff.scale.set(1.6, 0.7, 1.0);
    cloud.add(basePuff);

    const p1 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), mat);
    p1.position.set(-1.8, 0.2, 0.2);
    cloud.add(p1);

    const p2 = new THREE.Mesh(new THREE.SphereGeometry(2.0, 8, 8), mat);
    p2.position.set(1.6, 0.3, -0.2);
    cloud.add(p2);

    const p3 = new THREE.Mesh(new THREE.SphereGeometry(1.4, 7, 7), mat);
    p3.position.set(0.2, 1.0, 0);
    cloud.add(p3);

    return cloud;
  }

  _fallbackOakTree() {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.6, 8), this.materials.trunk);
    trunk.position.y = 1.3;
    trunk.castShadow = true;
    tree.add(trunk);

    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), this.materials.oakLeaves);
    canopy.position.y = 2.9;
    canopy.castShadow = true;
    tree.add(canopy);
    return tree;
  }

  _fallbackPineTree() {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 2.2, 8), this.materials.trunk);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.2, 7), this.materials.pineLeaves);
    cone.position.y = 3.0;
    cone.castShadow = true;
    tree.add(cone);
    return tree;
  }

  _fallbackBush() {
    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), this.materials.oakLeaves);
    bush.position.y = 0.5;
    bush.scale.set(1.3, 0.8, 1.1);
    bush.castShadow = true;
    return bush;
  }
}
