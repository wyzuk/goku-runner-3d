import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CHUNK_LENGTH, ROAD_TOTAL_WIDTH, LANE_WIDTH, ROAD_EXCLUSION_HALF_WIDTH } from '../utils/Constants.js';
import { BIOME_CONFIGS } from './BiomeConfig.js';
import { getMaterialManager } from '../materials/MaterialManager.js';
import { modelLoader } from '../utils/ModelAssetLoader.js';

/**
 * AAA Quality Terrain Chunk for Goku Runner 3D
 * Reconstructed to match the provided reference image:
 * - 3-Lane dark asphalt road with merged lane markings
 * - Concrete curbs & warm dirt roadside verges
 * - Lush rolling green valley slopes on both sides
 * - Dense forests of tall conifer pines and leafy oak trees
 * - Roadside wildflowers (purple lupines, white daisies), ferns, bushes
 * - Rustic wooden split-rail fences along the verge
 * - Mossy tree stumps, fallen logs, river boulders
 * - Distant snow-capped alpine mountain ranges with cascading waterfalls
 * - High-performance InstancedMesh architecture for 60 FPS
 */
export class TerrainChunk {
  constructor(envAssets) {
    this.envAssets = envAssets;
    this.matMgr = getMaterialManager();
    this.group = new THREE.Group();
    this.chunkIndex = 0;
    this.biomeType = null;
    this.qualityPreset = 'HIGH';

    this.sceneryObjects = [];
    this.mountainObjects = [];

    this.buildChunkGeometry();
    this.initInstancedFoliage();
  }

  buildChunkGeometry() {
    const roadW = ROAD_TOTAL_WIDTH; // 12.0m

    // 1. PBR ASPHALT ROAD TRACK
    const roadGeo = new THREE.PlaneGeometry(roadW, CHUNK_LENGTH, 1, 4);
    roadGeo.rotateX(-Math.PI / 2);
    const uvs = roadGeo.attributes.uv;
    const pos = roadGeo.attributes.position;
    for (let i = 0; i < uvs.count; i++) {
      const u = (pos.getX(i) + roadW / 2) / roadW;
      const v = (pos.getZ(i) + CHUNK_LENGTH / 2) / CHUNK_LENGTH;
      uvs.setXY(i, u * 3, v * 9);
    }
    uvs.needsUpdate = true;

    this.trackMesh = new THREE.Mesh(roadGeo, this.matMgr.roadMaterial);
    this.trackMesh.position.y = 0.04;
    this.trackMesh.receiveShadow = true;
    this.group.add(this.trackMesh);

    // 2. MERGED ROAD MARKINGS (Dashes + Edge lines in 1 single draw call!)
    const markingGeos = [];
    const dashLength = 3.2;
    const gapLength = 2.4;
    const totalCycle = dashLength + gapLength;
    const numDashes = Math.floor(CHUNK_LENGTH / totalCycle);

    for (let i = 0; i < numDashes; i++) {
      const z = -CHUNK_LENGTH / 2 + (i + 0.5) * totalCycle;
      // Left lane divider (+1.8)
      const dL = new THREE.PlaneGeometry(0.18, dashLength);
      dL.rotateX(-Math.PI / 2);
      dL.translate(LANE_WIDTH / 2, 0.045, z);
      markingGeos.push(dL);

      // Right lane divider (-1.8)
      const dR = new THREE.PlaneGeometry(0.18, dashLength);
      dR.rotateX(-Math.PI / 2);
      dR.translate(-LANE_WIDTH / 2, 0.045, z);
      markingGeos.push(dR);
    }

    // Solid Edge Lines
    const edgeL = new THREE.PlaneGeometry(0.16, CHUNK_LENGTH);
    edgeL.rotateX(-Math.PI / 2);
    edgeL.translate(roadW / 2 - 0.4, 0.045, 0);
    markingGeos.push(edgeL);

    const edgeR = new THREE.PlaneGeometry(0.16, CHUNK_LENGTH);
    edgeR.rotateX(-Math.PI / 2);
    edgeR.translate(-(roadW / 2 - 0.4), 0.045, 0);
    markingGeos.push(edgeR);

    const mergedMarkingsGeo = BufferGeometryUtils.mergeGeometries(markingGeos);
    this.markingsMesh = new THREE.Mesh(mergedMarkingsGeo, this.matMgr.laneLineMaterial);
    this.group.add(this.markingsMesh);

    // 3. BEVELED CONCRETE ROAD CURBS
    const curbWidth = 0.35;
    const curbHeight = 0.12;
    const curbGeo = new THREE.BoxGeometry(curbWidth, curbHeight, CHUNK_LENGTH);

    this.curbLeft = new THREE.Mesh(curbGeo, this.matMgr.curbMaterial);
    this.curbLeft.position.set(roadW / 2 + curbWidth / 2, curbHeight / 2, 0);
    this.curbLeft.receiveShadow = true;
    this.curbLeft.castShadow = true;

    this.curbRight = new THREE.Mesh(curbGeo, this.matMgr.curbMaterial);
    this.curbRight.position.set(-(roadW / 2 + curbWidth / 2), curbHeight / 2, 0);
    this.curbRight.receiveShadow = true;
    this.curbRight.castShadow = true;

    this.group.add(this.curbLeft, this.curbRight);

    // 4. GRAVEL & DIRT ROADSIDE VERGES (Width 2.2m)
    const shoulderWidth = 2.2;
    const shoulderGeo = new THREE.PlaneGeometry(shoulderWidth, CHUNK_LENGTH);
    shoulderGeo.rotateX(-Math.PI / 2);

    this.shoulderLeft = new THREE.Mesh(shoulderGeo, this.matMgr.shoulderMaterial);
    this.shoulderLeft.position.set(roadW / 2 + curbWidth + shoulderWidth / 2, 0.02, 0);
    this.shoulderLeft.receiveShadow = true;

    this.shoulderRight = new THREE.Mesh(shoulderGeo, this.matMgr.shoulderMaterial);
    this.shoulderRight.position.set(-(roadW / 2 + curbWidth + shoulderWidth / 2), 0.02, 0);
    this.shoulderRight.receiveShadow = true;

    this.group.add(this.shoulderLeft, this.shoulderRight);

    // 5. ROLLING GREEN VALLEY HILLS (Width 55m on each side)
    const terrainWidth = 55.0;
    this.terrainWidth = terrainWidth;

    this.terrainGeoLeft = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH, 18, 16);
    this.terrainGeoLeft.rotateX(-Math.PI / 2);
    this.terrainLeft = new THREE.Mesh(this.terrainGeoLeft, this.matMgr.terrainMaterial);
    this.terrainLeft.position.set(roadW / 2 + curbWidth + shoulderWidth + terrainWidth / 2, 0, 0);
    this.terrainLeft.receiveShadow = true;

    this.terrainGeoRight = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH, 18, 16);
    this.terrainGeoRight.rotateX(-Math.PI / 2);
    this.terrainRight = new THREE.Mesh(this.terrainGeoRight, this.matMgr.terrainMaterial);
    this.terrainRight.position.set(-(roadW / 2 + curbWidth + shoulderWidth + terrainWidth / 2), 0, 0);
    this.terrainRight.receiveShadow = true;

    this.group.add(this.terrainLeft, this.terrainRight);
  }

  initInstancedFoliage() {
    // Limits per chunk
    this.maxPines = 14;
    this.maxOaks = 10;
    this.maxBushes = 16;
    this.maxFerns = 22;
    this.maxLupines = 28;
    this.maxDaisies = 24;
    this.maxFences = 8;
    this.maxStumps = 4;
    this.maxRocks = 6;

    // 1. PINE TREES (Leaves + Trunk)
    this.pineLeavesInst = new THREE.InstancedMesh(this.envAssets.pineLeavesGeo, this.envAssets.pineMaterial, this.maxPines);
    this.pineLeavesInst.castShadow = true;
    this.pineLeavesInst.receiveShadow = true;
    this.pineTrunkInst = new THREE.InstancedMesh(this.envAssets.pineTrunkGeo, this.envAssets.barkMaterial, this.maxPines);
    this.pineTrunkInst.castShadow = true;
    this.pineTrunkInst.receiveShadow = true;
    this.group.add(this.pineLeavesInst, this.pineTrunkInst);

    // 2. OAK TREES (Leaves + Trunk)
    this.oakLeavesInst = new THREE.InstancedMesh(this.envAssets.oakLeavesGeo, this.envAssets.oakMaterial, this.maxOaks);
    this.oakLeavesInst.castShadow = true;
    this.oakLeavesInst.receiveShadow = true;
    this.oakTrunkInst = new THREE.InstancedMesh(this.envAssets.oakTrunkGeo, this.envAssets.barkMaterial, this.maxOaks);
    this.oakTrunkInst.castShadow = true;
    this.oakTrunkInst.receiveShadow = true;
    this.group.add(this.oakLeavesInst, this.oakTrunkInst);

    // 3. BUSHES
    this.bushInst = new THREE.InstancedMesh(this.envAssets.bushGeo, this.envAssets.bushMaterial, this.maxBushes);
    this.bushInst.receiveShadow = true;
    this.group.add(this.bushInst);

    // 4. FERNS
    this.fernInst = new THREE.InstancedMesh(this.envAssets.fernGeo, this.envAssets.fernMaterial, this.maxFerns);
    this.fernInst.receiveShadow = true;
    this.group.add(this.fernInst);

    // 5. PURPLE LUPINES
    this.lupineInst = new THREE.InstancedMesh(this.envAssets.purpleLupineGeo, this.envAssets.flowerPurpleMaterial, this.maxLupines);
    this.lupineInst.receiveShadow = true;
    this.group.add(this.lupineInst);

    // 6. WHITE DAISIES
    this.daisyInst = new THREE.InstancedMesh(this.envAssets.whiteDaisyGeo, this.envAssets.flowerWhiteMaterial, this.maxDaisies);
    this.daisyInst.receiveShadow = true;
    this.group.add(this.daisyInst);

    // 7. RUSTIC WOODEN SPLIT-RAIL FENCES
    this.fenceInst = new THREE.InstancedMesh(this.envAssets.fenceGeo, this.envAssets.fenceMaterial, this.maxFences);
    this.fenceInst.receiveShadow = true;
    this.fenceInst.castShadow = true;
    this.group.add(this.fenceInst);

    // 8. TREE STUMPS & LOGS
    this.stumpInst = new THREE.InstancedMesh(this.envAssets.stumpGeo, this.envAssets.stumpMaterial, this.maxStumps);
    this.stumpInst.receiveShadow = true;
    this.stumpInst.castShadow = true;
    this.group.add(this.stumpInst);

    // 9. BOULDERS & RIVER ROCKS
    this.rockInst = new THREE.InstancedMesh(this.envAssets.rockGeo, this.envAssets.rockMaterial, this.maxRocks);
    this.rockInst.receiveShadow = true;
    this.rockInst.castShadow = true;
    this.group.add(this.rockInst);

    // Initialize all matrices to hidden scale 0 to prevent unassigned instances at (0,0,0)
    const hiddenDummy = new THREE.Object3D();
    hiddenDummy.position.set(0, -9999, 0);
    hiddenDummy.scale.set(0, 0, 0);
    hiddenDummy.updateMatrix();

    const instLists = [
      this.pineLeavesInst, this.pineTrunkInst,
      this.oakLeavesInst, this.oakTrunkInst,
      this.bushInst, this.fernInst,
      this.lupineInst, this.daisyInst,
      this.fenceInst, this.stumpInst, this.rockInst
    ];
    for (const inst of instLists) {
      for (let i = 0; i < inst.count; i++) {
        inst.setMatrixAt(i, hiddenDummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
  }

  setup(chunkIndex, startZ, biomeType) {
    this.chunkIndex = chunkIndex;
    this.biomeType = biomeType;
    this.startZ = startZ;
    this.group.position.set(0, 0, startZ + CHUNK_LENGTH / 2);

    const cfg = BIOME_CONFIGS[biomeType] || BIOME_CONFIGS.EARTH_VALLEY;

    // Apply Rolling Hills Elevation
    this.applyRollingRelief(startZ);

    // Clear old unique objects (mountains & scenery)
    this.clearScenery();

    if (modelLoader.isReady) {
      // Hide primitive procedural foliage meshes
      this.hideProceduralFoliage();
      // Populate with real authentic 3D GLTF models from project
      this.populateRealModels(chunkIndex, startZ);
    } else {
      // Build fallback distant alpine mountains & instanced props
      this.buildDistantMountains(chunkIndex);
      this.populateInstancedFoliage(chunkIndex, startZ);
    }
  }

  hideProceduralFoliage() {
    const list = [
      this.pineLeavesInst, this.pineTrunkInst,
      this.oakLeavesInst, this.oakTrunkInst,
      this.bushInst, this.fernInst,
      this.lupineInst, this.daisyInst,
      this.stumpInst, this.rockInst
    ];
    for (const inst of list) {
      if (inst) {
        inst.count = 0;
        inst.instanceMatrix.needsUpdate = true;
      }
    }
  }

  populateRealModels(chunkIndex, startZ) {
    const halfChunk = CHUNK_LENGTH / 2;
    let rndIdx = 0;
    const rnd = () => {
      rndIdx++;
      const val = Math.sin((chunkIndex + 1) * 37.1 + rndIdx * 91.7);
      return val - Math.floor(val);
    };

    const addScenery = (obj) => {
      this.group.add(obj);
      this.sceneryObjects.push(obj);
    };

    // 1. REAL 3D PINE TREES (pine_tree (1).glb)
    const pineCount = this.qualityPreset === 'LOW' ? 4 : 8;
    for (let i = 0; i < pineCount; i++) {
      const pine = modelLoader.createInstance('tree_pine');
      if (pine) {
        const side = (i % 2 === 0) ? 1 : -1;
        const x = side * (18.5 + rnd() * 26.0);
        const z = -halfChunk + (i / pineCount) * CHUNK_LENGTH + (rnd() - 0.5) * 5.0;
        const yGround = 0.4 + Math.pow(Math.abs(x) / 55, 1.8) * 5.5;
        const scale = 0.031 * (0.8 + rnd() * 0.4);

        pine.position.set(x, yGround, z);
        pine.rotation.set(0, rnd() * Math.PI * 2, 0);
        pine.scale.set(scale, scale, scale);
        pine.traverse(c => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        addScenery(pine);
      }
    }

    // 2. REAL 3D OAK TREES (oak_tree.glb)
    const oakCount = this.qualityPreset === 'LOW' ? 3 : 5;
    for (let i = 0; i < oakCount; i++) {
      const oak = modelLoader.createInstance('tree_oak');
      if (oak) {
        const side = (i % 2 === 0) ? -1 : 1;
        const x = side * (18.0 + rnd() * 24.0);
        const z = -halfChunk + (i / oakCount) * CHUNK_LENGTH + (rnd() - 0.5) * 5.0;
        const yGround = 0.3 + Math.pow(Math.abs(x) / 55, 1.8) * 5.5;
        const scale = 0.95 * (0.8 + rnd() * 0.35);

        oak.position.set(x, yGround, z);
        oak.rotation.set(0, rnd() * Math.PI * 2, 0);
        oak.scale.set(scale, scale, scale);
        oak.traverse(c => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        addScenery(oak);
      }
    }

    // 3. REAL 3D STYLIZED BUSHES (stylized_bush.glb)
    const bushCount = this.qualityPreset === 'LOW' ? 4 : 8;
    for (let i = 0; i < bushCount; i++) {
      const bush = modelLoader.createInstance('bush_stylized');
      if (bush) {
        const side = (i % 2 === 0) ? 1 : -1;
        const x = side * (9.5 + rnd() * 12.0);
        const z = -halfChunk + (i / bushCount) * CHUNK_LENGTH + (rnd() - 0.5) * 4.0;
        const scale = 1.25 * (0.8 + rnd() * 0.4);

        bush.position.set(x, 0.05, z);
        bush.rotation.set(0, rnd() * Math.PI * 2, 0);
        bush.scale.set(scale, scale, scale);
        bush.traverse(c => {
          if (c.isMesh) c.receiveShadow = true;
        });
        addScenery(bush);
      }
    }

    // 4. REAL 3D FERNS (fern.glb)
    const fernCount = this.qualityPreset === 'LOW' ? 4 : 7;
    for (let i = 0; i < fernCount; i++) {
      const fern = modelLoader.createInstance('fern');
      if (fern) {
        const side = (i % 2 === 0) ? 1 : -1;
        const x = side * (8.6 + rnd() * 4.5);
        const z = -halfChunk + (i / fernCount) * CHUNK_LENGTH + (rnd() - 0.5) * 3.5;
        const scale = 0.85 * (0.8 + rnd() * 0.4);

        fern.position.set(x, 0.02, z);
        fern.rotation.set(0, rnd() * Math.PI * 2, 0);
        fern.scale.set(scale, scale, scale);
        fern.traverse(c => {
          if (c.isMesh) c.receiveShadow = true;
        });
        addScenery(fern);
      }
    }

    // 5. REAL 3D GRASS PATCHES WITH WILDFLOWERS (grass_patch.glb)
    const patchCount = this.qualityPreset === 'LOW' ? 4 : 8;
    for (let i = 0; i < patchCount; i++) {
      const patch = modelLoader.createInstance('grass_patch');
      if (patch) {
        const side = (i % 2 === 0) ? -1 : 1;
        const x = side * (8.6 + rnd() * 3.8);
        const z = -halfChunk + (i / patchCount) * CHUNK_LENGTH + (rnd() - 0.5) * 3.0;
        const scale = 0.35 * (0.85 + rnd() * 0.35);

        patch.position.set(x, 0.02, z);
        patch.rotation.set(0, rnd() * Math.PI * 2, 0);
        patch.scale.set(scale, scale, scale);
        patch.traverse(c => {
          if (c.isMesh) c.receiveShadow = true;
        });
        addScenery(patch);
      }
    }

    // 6. REAL 3D MOSSY TREE LOG (mossy_old_tree_log.glb)
    const log = modelLoader.createInstance('mossy_log');
    if (log) {
      const side = (chunkIndex % 2 === 0) ? -1 : 1;
      const x = side * (9.2 + rnd() * 1.5);
      const z = (rnd() - 0.5) * 20.0;

      const wrapper = new THREE.Group();
      wrapper.position.set(x, 0.05, z);
      wrapper.rotation.set(0, rnd() * 1.5, 0);
      const scale = 1.35;
      wrapper.scale.set(scale, scale, scale);

      log.position.set(-0.23, -0.05, -1.92);
      wrapper.add(log);
      wrapper.traverse(c => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
      addScenery(wrapper);
    }

    // 7. REAL 3D BOULDERS (desert_rocks.glb & large_stone.glb)
    const rockCount = this.qualityPreset === 'LOW' ? 1 : 2;
    for (let i = 0; i < rockCount; i++) {
      const modelKey = (i === 0 && modelLoader.has('rock_large')) ? 'rock_large' : 'rock_desert';
      const rock = modelLoader.createInstance(modelKey);
      if (rock) {
        const side = (i % 2 === 0) ? 1 : -1;
        const x = side * (9.4 + rnd() * 8.0);
        const z = -halfChunk + (i + 0.5) * (CHUNK_LENGTH / rockCount) + (rnd() - 0.5) * 5.0;
        const scale = (modelKey === 'rock_large' ? 0.75 : 1.3) * (0.8 + rnd() * 0.4);

        rock.position.set(x, 0.1, z);
        rock.rotation.set(0, rnd() * Math.PI * 2, 0);
        rock.scale.set(scale, scale, scale);
        rock.traverse(c => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        addScenery(rock);
      }
    }

    // 8. REAL 3D MOUNTAINS (low_poly_mountain (1).glb & (2).glb)
    const mtnLeftModel = modelLoader.createInstance('mtn_ridge') || modelLoader.createInstance('mtn_main');
    if (mtnLeftModel) {
      const wrapperL = new THREE.Group();
      wrapperL.position.set(88 + (rnd() - 0.5) * 8, -5, (rnd() - 0.5) * 15);
      wrapperL.scale.set(0.65, 0.65, 0.65);
      mtnLeftModel.position.set(411.4, -105.76, 419.9);
      wrapperL.add(mtnLeftModel);
      this.group.add(wrapperL);
      this.mountainObjects.push(wrapperL);
    }

    const mtnRightModel = modelLoader.createInstance('mtn_peak') || modelLoader.createInstance('mtn_main');
    if (mtnRightModel) {
      const wrapperR = new THREE.Group();
      wrapperR.position.set(-88 + (rnd() - 0.5) * 8, -5, (rnd() - 0.5) * 15);
      wrapperR.scale.set(0.32, 0.32, 0.32);
      mtnRightModel.position.set(0.38, 0, 3.82);
      wrapperR.add(mtnRightModel);
      this.group.add(wrapperR);
      this.mountainObjects.push(wrapperR);
    }

    // 9. RUSTIC WOODEN SPLIT-RAIL FENCE (Roadside boundary)
    const fenceCount = this.maxFences;
    for (let i = 0; i < fenceCount; i++) {
      const side = (i < fenceCount / 2) ? 1 : -1;
      const subIdx = i % (fenceCount / 2);
      const x = side * 8.45;
      const z = -halfChunk + 4.5 + subIdx * 7.5;

      const dummy = new THREE.Object3D();
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();
      this.fenceInst.setMatrixAt(i, dummy.matrix);
    }
    this.fenceInst.count = fenceCount;
    this.fenceInst.instanceMatrix.needsUpdate = true;
  }

  applyRollingRelief(startZ) {
    const terrainStartZ = startZ + CHUNK_LENGTH / 2;
    for (const mesh of [this.terrainLeft, this.terrainRight]) {
      const pos = mesh.geometry.attributes.position;
      const isLeft = mesh === this.terrainLeft;

      for (let i = 0; i < pos.count; i++) {
        const localX = pos.getX(i);
        const distFromRoad = isLeft
          ? (localX + this.terrainWidth / 2)
          : Math.abs(localX - this.terrainWidth / 2);

        const worldX = mesh.position.x + localX;
        const worldZ = terrainStartZ + pos.getZ(i);

        // Smooth elevation rising from 0 at road verge to 6.5m at valley crest
        const slope = Math.pow(distFromRoad / this.terrainWidth, 1.8) * 6.2;
        const rolling = Math.sin(worldZ * 0.045 + worldX * 0.035) * 1.25 +
                        Math.cos(worldZ * 0.082 - worldX * 0.055) * 0.65;
        const blend = THREE.MathUtils.smoothstep(distFromRoad, 1.5, 12.0);

        pos.setY(i, slope + rolling * blend);
      }
      pos.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    }
  }

  buildDistantMountains(chunkIndex) {
    // Deterministic pseudo-random seed per chunk
    const seed = Math.abs(chunkIndex % 10);
    const hasWaterfallLeft = (seed % 2 === 0);
    const hasWaterfallRight = (seed % 3 === 0);

    // Left Alpine Mountain (strictly $|X| \ge 40m$ to preserve road valley corridor)
    const mtnLeft = this.envAssets.createAlpineMountainRange(
      90 + seed * 2,
      65 + seed * 2,
      75,
      hasWaterfallLeft
    );
    mtnLeft.position.set(85 + (seed % 3) * 8, 0, (seed - 5) * 4);
    this.group.add(mtnLeft);
    this.mountainObjects.push(mtnLeft);

    // Right Alpine Mountain
    const mtnRight = this.envAssets.createAlpineMountainRange(
      90 + seed * 2,
      68 + (9 - seed) * 2,
      75,
      hasWaterfallRight
    );
    mtnRight.position.set(-(85 + ((seed + 1) % 3) * 8), 0, (5 - seed) * 4);
    this.group.add(mtnRight);
    this.mountainObjects.push(mtnRight);

    // Drifting anime cumulus cloud overhead
    if (seed % 2 === 0) {
      const cloud = this.envAssets.createCloud();
      cloud.position.set((seed - 4) * 6, 28 + (seed % 3) * 3, (seed - 5) * 4);
      this.group.add(cloud);
      this.sceneryObjects.push(cloud);
    }
  }

  clearScenery() {
    for (const obj of this.sceneryObjects) {
      this.group.remove(obj);
    }
    this.sceneryObjects = [];

    for (const mtn of this.mountainObjects) {
      this.group.remove(mtn);
    }
    this.mountainObjects = [];
  }

  populateInstancedFoliage(chunkIndex, startZ) {
    const dummy = new THREE.Object3D();
    const halfChunk = CHUNK_LENGTH / 2;

    // Pseudo-random helper
    let rndIdx = 0;
    const rnd = () => {
      rndIdx++;
      const val = Math.sin((chunkIndex + 1) * 37.1 + rndIdx * 91.7);
      return val - Math.floor(val);
    };

    // 1. PINE TREES (Midground valley slopes, |X|: 18m to 48m)
    const pineCount = this.qualityPreset === 'LOW' ? 6 : this.maxPines;
    const pineScaleFactor = this.envAssets.pineScaleFactor || 1.0;
    for (let i = 0; i < pineCount; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const x = side * (18.5 + rnd() * 28.0);
      const z = -halfChunk + (i / pineCount) * CHUNK_LENGTH + (rnd() - 0.5) * 6.0;
      const scale = pineScaleFactor * (0.9 + rnd() * 0.45);
      const rotY = rnd() * Math.PI * 2;

      dummy.position.set(x, 0.4 + Math.pow(Math.abs(x) / 55, 1.8) * 5.5, z);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      this.pineLeavesInst.setMatrixAt(i, dummy.matrix);
      this.pineTrunkInst.setMatrixAt(i, dummy.matrix);
    }
    this.pineLeavesInst.count = pineCount;
    this.pineTrunkInst.count = pineCount;
    this.pineLeavesInst.instanceMatrix.needsUpdate = true;
    this.pineTrunkInst.instanceMatrix.needsUpdate = true;

    // 2. OAK TREES (Lush broadleaf canopies on valley slopes, |X|: 17m to 44m)
    const oakCount = this.qualityPreset === 'LOW' ? 4 : this.maxOaks;
    const oakScaleFactor = this.envAssets.oakScaleFactor || 1.0;
    for (let i = 0; i < oakCount; i++) {
      const side = (i % 2 === 0) ? -1 : 1;
      const x = side * (19.0 + rnd() * 24.0);
      const z = -halfChunk + (i / oakCount) * CHUNK_LENGTH + (rnd() - 0.5) * 5.0;
      const scale = oakScaleFactor * (0.85 + rnd() * 0.4);
      const rotY = rnd() * Math.PI * 2;

      dummy.position.set(x, 0.3 + Math.pow(Math.abs(x) / 55, 1.8) * 5.5, z);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      this.oakLeavesInst.setMatrixAt(i, dummy.matrix);
      this.oakTrunkInst.setMatrixAt(i, dummy.matrix);
    }
    this.oakLeavesInst.count = oakCount;
    this.oakTrunkInst.count = oakCount;
    this.oakLeavesInst.instanceMatrix.needsUpdate = true;
    this.oakTrunkInst.instanceMatrix.needsUpdate = true;

    // 3. BUSHES (Roadside & lower hill slopes, |X|: 9.8m to 22m)
    const bushCount = this.qualityPreset === 'LOW' ? 6 : this.maxBushes;
    const bushScaleFactor = this.envAssets.bushScaleFactor || 1.0;
    for (let i = 0; i < bushCount; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const x = side * (9.8 + rnd() * 11.0);
      const z = -halfChunk + (i / bushCount) * CHUNK_LENGTH + (rnd() - 0.5) * 4.0;
      const scale = bushScaleFactor * (0.8 + rnd() * 0.5);

      dummy.position.set(x, 0.05, z);
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.bushInst.setMatrixAt(i, dummy.matrix);
    }
    this.bushInst.count = bushCount;
    this.bushInst.instanceMatrix.needsUpdate = true;

    // 4. FERNS (Road verge edge, |X|: 8.6m to 14m)
    const fernCount = this.qualityPreset === 'LOW' ? 8 : this.maxFerns;
    const fernScaleFactor = this.envAssets.fernScaleFactor || 1.0;
    for (let i = 0; i < fernCount; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const x = side * (8.6 + rnd() * 5.2);
      const z = -halfChunk + (i / fernCount) * CHUNK_LENGTH + (rnd() - 0.5) * 3.5;
      const scale = fernScaleFactor * (0.85 + rnd() * 0.4);

      dummy.position.set(x, 0.02, z);
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.fernInst.setMatrixAt(i, dummy.matrix);
    }
    this.fernInst.count = fernCount;
    this.fernInst.instanceMatrix.needsUpdate = true;

    // 5. PURPLE LUPINES (Wildflowers along roadside verge, |X|: 8.4m to 12.5m)
    const lupineCount = this.qualityPreset === 'LOW' ? 10 : this.maxLupines;
    for (let i = 0; i < lupineCount; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const x = side * (8.5 + rnd() * 4.0);
      const z = -halfChunk + (i / lupineCount) * CHUNK_LENGTH + (rnd() - 0.5) * 3.0;
      const scale = 0.8 + rnd() * 0.5;

      dummy.position.set(x, 0.02, z);
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.lupineInst.setMatrixAt(i, dummy.matrix);
    }
    this.lupineInst.count = lupineCount;
    this.lupineInst.instanceMatrix.needsUpdate = true;

    // 6. WHITE DAISIES (Roadside verge, |X|: 8.5m to 12.5m)
    const daisyCount = this.qualityPreset === 'LOW' ? 8 : this.maxDaisies;
    for (let i = 0; i < daisyCount; i++) {
      const side = (i % 2 === 0) ? -1 : 1;
      const x = side * (8.6 + rnd() * 3.8);
      const z = -halfChunk + (i / daisyCount) * CHUNK_LENGTH + (rnd() - 0.5) * 3.0;
      const scale = 0.85 + rnd() * 0.45;

      dummy.position.set(x, 0.02, z);
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.daisyInst.setMatrixAt(i, dummy.matrix);
    }
    this.daisyInst.count = daisyCount;
    this.daisyInst.instanceMatrix.needsUpdate = true;

    // 7. RUSTIC WOODEN SPLIT-RAIL FENCE (verge boundary, |X|: ~8.4m)
    const fenceCount = this.maxFences;
    for (let i = 0; i < fenceCount; i++) {
      const side = (i < fenceCount / 2) ? 1 : -1;
      const subIdx = i % (fenceCount / 2);
      const x = side * 8.45;
      const z = -halfChunk + 4.5 + subIdx * 7.5;

      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, 0, 0); // Runs parallel to road
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();
      this.fenceInst.setMatrixAt(i, dummy.matrix);
    }
    this.fenceInst.count = fenceCount;
    this.fenceInst.instanceMatrix.needsUpdate = true;

    // 8. TREE STUMPS & LOGS (Roadside verge props, |X|: 8.6m to 14m)
    const stumpCount = this.maxStumps;
    for (let i = 0; i < stumpCount; i++) {
      const side = (i % 2 === 0) ? -1 : 1;
      const x = side * (8.8 + rnd() * 4.5);
      const z = -halfChunk + (i / stumpCount) * CHUNK_LENGTH + (rnd() - 0.5) * 8.0;
      const scale = 0.9 + rnd() * 0.35;

      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.stumpInst.setMatrixAt(i, dummy.matrix);
    }
    this.stumpInst.count = stumpCount;
    this.stumpInst.instanceMatrix.needsUpdate = true;

    // 9. BOULDERS (Roadside & hill slopes, |X|: 9.5m to 25m)
    const rockCount = this.maxRocks;
    for (let i = 0; i < rockCount; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const x = side * (9.5 + rnd() * 14.0);
      const z = -halfChunk + (i / rockCount) * CHUNK_LENGTH + (rnd() - 0.5) * 6.0;
      const scale = 0.8 + rnd() * 0.6;

      dummy.position.set(x, 0, z);
      dummy.rotation.set(rnd() * 2, rnd() * 2, rnd() * 2);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.rockInst.setMatrixAt(i, dummy.matrix);
    }
    this.rockInst.count = rockCount;
    this.rockInst.instanceMatrix.needsUpdate = true;
  }

  refreshGeometries() {
    if (modelLoader.isReady) {
      this.clearScenery();
      this.hideProceduralFoliage();
      const z = (this.startZ !== undefined) ? this.startZ : (this.group.position.z - CHUNK_LENGTH / 2);
      this.populateRealModels(this.chunkIndex, z);
    }
  }

  setQualityPreset(preset) {
    this.qualityPreset = preset;
  }
}
