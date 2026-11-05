import * as THREE from 'three';
import { CHUNK_LENGTH, ROAD_TOTAL_WIDTH, LANE_WIDTH } from '../utils/Constants.js';
import { BIOME_CONFIGS } from './BiomeConfig.js';
import { getMaterialManager } from '../materials/MaterialManager.js';

/**
 * High-Quality 3D Road & Environment Terrain Chunk
 * Reconstructed with downloaded 3D assets:
 * - Layered mountain ranges with distinct silhouettes
 * - Multi-species natural forests (Oak, Conifer Pine, Young Tree clusters)
 * - Roadside boulders, rock slabs, pebble scatter
 * - Layered roadside vegetation (bushes, grass tufts, ferns, flowers)
 * - Natural fallen logs and forest floor debris
 * - PBR asphalt road, dashed lane markings, concrete curbs, gravel shoulders, and river
 */
export class TerrainChunk {
  constructor(envAssets) {
    this.envAssets = envAssets;
    this.matMgr = getMaterialManager();
    this.group = new THREE.Group();
    this.chunkIndex = 0;
    this.biomeType = null;
    this.sceneryObjects = [];
    this.mountainObjects = [];

    this.buildChunkGeometry();
  }

  buildChunkGeometry() {
    const roadW = ROAD_TOTAL_WIDTH; // 12.0m

    // 1. PBR ASPHALT ROAD TRACK
    const roadGeo = new THREE.PlaneGeometry(roadW, CHUNK_LENGTH, 1, 6);
    roadGeo.rotateX(-Math.PI / 2);
    const pos = roadGeo.attributes.position;
    const uvs = roadGeo.attributes.uv;
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

    // 2. DASHED LANE MARKINGS & SOLID EDGE LINES
    this.markingsGroup = new THREE.Group();
    this.markingsGroup.position.y = 0.045;

    const dashLength = 3.2;
    const gapLength = 2.4;
    const totalCycle = dashLength + gapLength;
    const numDashes = Math.floor(CHUNK_LENGTH / totalCycle);

    const dashGeo = new THREE.PlaneGeometry(0.18, dashLength);
    dashGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < numDashes; i++) {
      const z = -CHUNK_LENGTH / 2 + (i + 0.5) * totalCycle;
      // Left lane divider (+1.8)
      const dashL = new THREE.Mesh(dashGeo, this.matMgr.laneLineMaterial);
      dashL.position.set(LANE_WIDTH / 2, 0, z);
      this.markingsGroup.add(dashL);

      // Right lane divider (-1.8)
      const dashR = new THREE.Mesh(dashGeo, this.matMgr.laneLineMaterial);
      dashR.position.set(-LANE_WIDTH / 2, 0, z);
      this.markingsGroup.add(dashR);
    }

    // Solid Edge Lines
    const edgeGeo = new THREE.PlaneGeometry(0.16, CHUNK_LENGTH);
    edgeGeo.rotateX(-Math.PI / 2);
    const edgeL = new THREE.Mesh(edgeGeo, this.matMgr.laneLineMaterial);
    edgeL.position.set(roadW / 2 - 0.4, 0, 0);
    const edgeR = new THREE.Mesh(edgeGeo, this.matMgr.laneLineMaterial);
    edgeR.position.set(-(roadW / 2 - 0.4), 0, 0);
    this.markingsGroup.add(edgeL, edgeR);

    this.group.add(this.markingsGroup);

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

    // 4. GRAVEL & DIRT ROAD SHOULDERS
    const shoulderWidth = 2.4;
    const shoulderGeo = new THREE.PlaneGeometry(shoulderWidth, CHUNK_LENGTH);
    shoulderGeo.rotateX(-Math.PI / 2);

    this.shoulderLeft = new THREE.Mesh(shoulderGeo, this.matMgr.shoulderMaterial);
    this.shoulderLeft.position.set(roadW / 2 + curbWidth + shoulderWidth / 2, 0.02, 0);
    this.shoulderLeft.receiveShadow = true;

    this.shoulderRight = new THREE.Mesh(shoulderGeo, this.matMgr.shoulderMaterial);
    this.shoulderRight.position.set(-(roadW / 2 + curbWidth + shoulderWidth / 2), 0.02, 0);
    this.shoulderRight.receiveShadow = true;

    this.group.add(this.shoulderLeft, this.shoulderRight);

    // 5. ROLLING SURROUNDING TERRAIN WITH ELEVATION
    const terrainWidth = 55.0;
    const terrainGeoLeft = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH, 8, 8);
    terrainGeoLeft.rotateX(-Math.PI / 2);
    const tPosL = terrainGeoLeft.attributes.position;
    for (let i = 0; i < tPosL.count; i++) {
      const distFromRoad = tPosL.getX(i) + terrainWidth / 2;
      const zVal = tPosL.getZ(i);
      const elevation = Math.sin(zVal * 0.12) * 0.5 + Math.pow(distFromRoad / terrainWidth, 2.0) * 5.0;
      tPosL.setY(i, elevation);
    }
    terrainGeoLeft.computeVertexNormals();

    this.terrainLeft = new THREE.Mesh(terrainGeoLeft, this.matMgr.terrainMaterial);
    this.terrainLeft.position.set(roadW / 2 + curbWidth + shoulderWidth + terrainWidth / 2, 0, 0);
    this.terrainLeft.receiveShadow = true;

    const terrainGeoRight = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH, 8, 8);
    terrainGeoRight.rotateX(-Math.PI / 2);
    const tPosR = terrainGeoRight.attributes.position;
    for (let i = 0; i < tPosR.count; i++) {
      const distFromRoad = Math.abs(tPosR.getX(i) - terrainWidth / 2);
      const zVal = tPosR.getZ(i);
      const elevation = Math.cos(zVal * 0.12) * 0.5 + Math.pow(distFromRoad / terrainWidth, 2.0) * 5.0;
      tPosR.setY(i, elevation);
    }
    terrainGeoRight.computeVertexNormals();

    this.terrainRight = new THREE.Mesh(terrainGeoRight, this.matMgr.terrainMaterial);
    this.terrainRight.position.set(-(roadW / 2 + curbWidth + shoulderWidth + terrainWidth / 2), 0, 0);
    this.terrainRight.receiveShadow = true;

    this.group.add(this.terrainLeft, this.terrainRight);

    // 6. ANIMATED FLOWING VALLEY RIVER
    const riverWidth = 8.0;
    const riverGeo = new THREE.PlaneGeometry(riverWidth, CHUNK_LENGTH, 1, 4);
    riverGeo.rotateX(-Math.PI / 2);
    this.riverMesh = new THREE.Mesh(riverGeo, this.matMgr.waterMaterial);
    this.riverMesh.position.set(-(roadW / 2 + curbWidth + shoulderWidth + 14.0), -0.25, 0);
    this.riverMesh.receiveShadow = true;
    this.group.add(this.riverMesh);
  }

  setup(chunkIndex, startZ, biomeType) {
    this.chunkIndex = chunkIndex;
    this.biomeType = biomeType;
    this.group.position.set(0, 0, startZ + CHUNK_LENGTH / 2);

    const cfg = BIOME_CONFIGS[biomeType] || BIOME_CONFIGS.EARTH_VALLEY;

    // Update biome-specific ground tint
    if (this.terrainLeft && this.terrainRight) {
      this.matMgr.terrainMaterial.color.setHex(cfg.groundColor);
    }

    // Toggle river in desert
    if (this.riverMesh) {
      this.riverMesh.visible = (biomeType !== 'DESERT' && biomeType !== 'KAMIS_REALM');
    }

    // Clear old scenery & mountains
    this.clearScenery();

    // Reconstruct layered mountains
    this.buildLayeredMountains(chunkIndex);

    // Populate layered scenery
    this.populateScenery(cfg, startZ);
  }

  buildLayeredMountains(chunkIndex) {
    // Determine alternating mountain seeds for varied silhouettes
    const seed = (chunkIndex % 6);

    // Left Mountain Range (Far Background: X: +70 to +95)
    const mtnLeftType = seed % 3; // 0: main, 1: ridge, 2: peak
    const mtnLeft = this.envAssets.createMountain(mtnLeftType, 0.9 + (seed % 2) * 0.25);
    if (mtnLeft) {
      mtnLeft.position.set(76 + (seed * 3) % 15, 0, -CHUNK_LENGTH / 4 + ((seed * 7) % 20));
      this.group.add(mtnLeft);
      this.mountainObjects.push(mtnLeft);
    }

    // Right Mountain Range (Far Background: X: -72 to -96)
    const mtnRightType = (seed + 1) % 3;
    const mtnRight = this.envAssets.createMountain(mtnRightType, 0.85 + ((seed + 1) % 2) * 0.3);
    if (mtnRight) {
      mtnRight.position.set(-(78 + ((seed * 5) % 16)), 0, CHUNK_LENGTH / 4 - ((seed * 4) % 18));
      this.group.add(mtnRight);
      this.mountainObjects.push(mtnRight);
    }

    // Midground Rocky Foothills / Crags (X: ~ +44 or -44)
    if (seed % 2 === 0) {
      const crag = this.envAssets.createMountain(3, 1.0); // mtn_crag
      if (crag) {
        const side = (seed % 4 === 0) ? 1 : -1;
        crag.position.set(side * 42, 0, (seed - 3) * 5);
        this.group.add(crag);
        this.mountainObjects.push(crag);
      }
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

  populateScenery(cfg, startZ) {
    const isDesert = this.biomeType === 'DESERT';
    const isKami = this.biomeType === 'KAMIS_REALM';
    const isSky = this.biomeType === 'SKY_ISLANDS';

    // -------------------------------------------------------------
    // LAYER 1: FOREGROUND (Roadside Shoulders, |X| = 6.8m to 10.5m)
    // -------------------------------------------------------------
    const numRoadsideProps = 4;
    for (let i = 0; i < numRoadsideProps; i++) {
      const zNorm = (i / numRoadsideProps) * CHUNK_LENGTH - CHUNK_LENGTH / 2 + 6;

      // Left Shoulder (+X)
      const leftX = 7.2 + Math.random() * 2.8;
      const leftZ = zNorm + (Math.random() - 0.5) * 4;
      let leftFg;

      if (isDesert) {
        leftFg = Math.random() > 0.4 ? this.envAssets.createSmallRockGroup() : this.envAssets.createDesertRock(0.7);
      } else if (isKami) {
        leftFg = this.envAssets.createFlowerPatch();
      } else {
        const roll = Math.random();
        if (roll < 0.35) leftFg = this.envAssets.createStylizedBush();
        else if (roll < 0.65) leftFg = this.envAssets.createGrassTuft();
        else if (roll < 0.85) leftFg = this.envAssets.createFern();
        else leftFg = this.envAssets.createFlowerPatch();
      }

      if (leftFg) {
        leftFg.position.set(leftX, 0, leftZ);
        this.group.add(leftFg);
        this.sceneryObjects.push(leftFg);
      }

      // Right Shoulder (-X)
      const rightX = -(7.2 + Math.random() * 2.8);
      const rightZ = zNorm + (Math.random() - 0.5) * 4;
      let rightFg;

      if (isDesert) {
        rightFg = Math.random() > 0.5 ? this.envAssets.createSmallRockGroup() : this.envAssets.createBrokenBranchProp(0.7);
      } else if (isKami) {
        rightFg = this.envAssets.createGrassTuft();
      } else {
        const roll = Math.random();
        if (roll < 0.35) rightFg = this.envAssets.createGrassTuft();
        else if (roll < 0.65) rightFg = this.envAssets.createStylizedBush();
        else if (roll < 0.82) rightFg = this.envAssets.createSmallRockGroup();
        else rightFg = this.envAssets.createBrokenBranchProp();
      }

      if (rightFg) {
        rightFg.position.set(rightX, 0, rightZ);
        this.group.add(rightFg);
        this.sceneryObjects.push(rightFg);
      }
    }

    // -------------------------------------------------------------
    // LAYER 2: MIDGROUND (Terrain & Forests, |X| = 12m to 32m)
    // -------------------------------------------------------------
    const numMidProps = 3;
    for (let i = 0; i < numMidProps; i++) {
      const zPos = (i / numMidProps) * CHUNK_LENGTH - CHUNK_LENGTH / 2 + 8;

      // Visual Left (+X)
      const leftMidX = 13.5 + Math.random() * 14.0;
      let leftMid;

      if (isKami) {
        leftMid = this.envAssets.createMarblePillar();
      } else if (isDesert) {
        leftMid = Math.random() > 0.5 ? this.envAssets.createCactus() : this.envAssets.createDesertRock(1.2);
      } else {
        const treeRoll = Math.random();
        if (treeRoll < 0.40) leftMid = this.envAssets.createOakTree(0.9 + Math.random() * 0.3);
        else if (treeRoll < 0.70) leftMid = this.envAssets.createPineTree(0.9 + Math.random() * 0.35);
        else if (treeRoll < 0.88) leftMid = this.envAssets.createSmallTreeCluster();
        else leftMid = this.envAssets.createRockTreeVignette();
      }

      if (leftMid) {
        leftMid.position.set(leftMidX, 0, zPos);
        this.group.add(leftMid);
        this.sceneryObjects.push(leftMid);
      }

      // Visual Right (-X)
      const rightMidX = -(13.5 + Math.random() * 14.0);
      let rightMid;

      if (isKami) {
        rightMid = this.envAssets.createMarblePillar();
      } else if (isDesert) {
        rightMid = Math.random() > 0.45 ? this.envAssets.createDeadTreeCluster() : this.envAssets.createLargeBoulder();
      } else {
        const treeRoll = Math.random();
        if (treeRoll < 0.40) rightMid = this.envAssets.createPineTree(0.9 + Math.random() * 0.3);
        else if (treeRoll < 0.70) rightMid = this.envAssets.createOakTree(0.9 + Math.random() * 0.3);
        else if (treeRoll < 0.85) rightMid = this.envAssets.createLargeBoulder();
        else rightMid = this.envAssets.createMossyLogProp();
      }

      if (rightMid) {
        rightMid.position.set(rightMidX, 0, zPos + 5);
        this.group.add(rightMid);
        this.sceneryObjects.push(rightMid);
      }
    }

    // Occasional special rock cluster or flat rock slab
    if (Math.random() > 0.4) {
      const rock = Math.random() > 0.5 ? this.envAssets.createFlatRockFormation() : this.envAssets.createLargeBoulder();
      const side = Math.random() > 0.5 ? 1 : -1;
      rock.position.set(side * (12.0 + Math.random() * 8.0), 0, (Math.random() - 0.5) * 26);
      this.group.add(rock);
      this.sceneryObjects.push(rock);
    }

    // Occasional glowing Ki Crystal cluster along scenic landscape
    if (Math.random() > 0.65) {
      const crystal = this.envAssets.createCrystalCluster();
      const side = Math.random() > 0.5 ? 1 : -1;
      crystal.position.set(side * (11.0 + Math.random() * 7.0), 0, (Math.random() - 0.5) * 20);
      this.group.add(crystal);
      this.sceneryObjects.push(crystal);
    }

    // Drifting anime cumulus clouds
    if (Math.random() > 0.45) {
      const cloud = this.envAssets.createCloud();
      cloud.position.set((Math.random() - 0.5) * 45, 26 + Math.random() * 8, (Math.random() - 0.5) * 30);
      this.group.add(cloud);
      this.sceneryObjects.push(cloud);
    }
  }
}
