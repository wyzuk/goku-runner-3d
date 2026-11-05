import * as THREE from 'three';
import { CHUNK_LENGTH, ROAD_TOTAL_WIDTH, LANE_WIDTH } from '../utils/Constants.js';
import { BIOME_CONFIGS } from './BiomeConfig.js';
import { getMaterialManager } from '../materials/MaterialManager.js';

/**
 * High-Quality 3D Road & Environment Terrain Chunk
 * Reconstructed 3-lane PBR asphalt road, dashed lane markings, concrete curbs,
 * gravel shoulders, rolling hills, flowing river, multi-faceted mountains, and rich vegetation.
 */
export class TerrainChunk {
  constructor(envAssets) {
    this.envAssets = envAssets;
    this.matMgr = getMaterialManager();
    this.group = new THREE.Group();
    this.chunkIndex = 0;
    this.biomeType = null;
    this.sceneryObjects = [];

    this.buildChunkGeometry();
  }

  buildChunkGeometry() {
    const roadW = ROAD_TOTAL_WIDTH; // 12.0m

    // 1. PBR ASPHALT ROAD TRACK
    const roadGeo = new THREE.PlaneGeometry(roadW, CHUNK_LENGTH, 1, 6);
    roadGeo.rotateX(-Math.PI / 2);
    // Align UVs along world length so texture maps continuously across chunks
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
    this.markingsGroup.position.y = 0.045; // Just above asphalt to avoid z-fighting

    // Left Divider (between Left lane at +3.6 and Center lane at 0 => X = +1.8)
    // Right Divider (between Center lane at 0 and Right lane at -3.6 => X = -1.8)
    const dashLength = 3.2;
    const gapLength = 2.4;
    const totalCycle = dashLength + gapLength;
    const numDashes = Math.floor(CHUNK_LENGTH / totalCycle);

    const dashGeo = new THREE.PlaneGeometry(0.18, dashLength);
    dashGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < numDashes; i++) {
      const z = -CHUNK_LENGTH / 2 + (i + 0.5) * totalCycle;
      // Left lane divider
      const dashL = new THREE.Mesh(dashGeo, this.matMgr.laneLineMaterial);
      dashL.position.set(LANE_WIDTH / 2, 0, z); // +1.8
      this.markingsGroup.add(dashL);

      // Right lane divider
      const dashR = new THREE.Mesh(dashGeo, this.matMgr.laneLineMaterial);
      dashR.position.set(-LANE_WIDTH / 2, 0, z); // -1.8
      this.markingsGroup.add(dashR);
    }

    // Solid Edge Lines (Left edge at +5.6, Right edge at -5.6)
    const edgeGeo = new THREE.PlaneGeometry(0.16, CHUNK_LENGTH);
    edgeGeo.rotateX(-Math.PI / 2);
    const edgeL = new THREE.Mesh(edgeGeo, this.matMgr.laneLineMaterial);
    edgeL.position.set(roadW / 2 - 0.4, 0, 0); // +5.6
    const edgeR = new THREE.Mesh(edgeGeo, this.matMgr.laneLineMaterial);
    edgeR.position.set(-(roadW / 2 - 0.4), 0, 0); // -5.6
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
    const terrainWidth = 40.0;
    const terrainGeoLeft = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH, 6, 6);
    terrainGeoLeft.rotateX(-Math.PI / 2);
    // Subtle procedural rolling elevation on terrain edges
    const tPosL = terrainGeoLeft.attributes.position;
    for (let i = 0; i < tPosL.count; i++) {
      const distFromRoad = tPosL.getX(i) + terrainWidth / 2;
      const zVal = tPosL.getZ(i);
      const elevation = Math.sin(zVal * 0.15) * 0.4 + Math.pow(distFromRoad / terrainWidth, 1.8) * 3.5;
      tPosL.setY(i, elevation);
    }
    terrainGeoLeft.computeVertexNormals();

    this.terrainLeft = new THREE.Mesh(terrainGeoLeft, this.matMgr.terrainMaterial);
    this.terrainLeft.position.set(roadW / 2 + curbWidth + shoulderWidth + terrainWidth / 2, 0, 0);
    this.terrainLeft.receiveShadow = true;

    const terrainGeoRight = new THREE.PlaneGeometry(terrainWidth, CHUNK_LENGTH, 6, 6);
    terrainGeoRight.rotateX(-Math.PI / 2);
    const tPosR = terrainGeoRight.attributes.position;
    for (let i = 0; i < tPosR.count; i++) {
      const distFromRoad = Math.abs(tPosR.getX(i) - terrainWidth / 2);
      const zVal = tPosR.getZ(i);
      const elevation = Math.cos(zVal * 0.15) * 0.4 + Math.pow(distFromRoad / terrainWidth, 1.8) * 3.5;
      tPosR.setY(i, elevation);
    }
    terrainGeoRight.computeVertexNormals();

    this.terrainRight = new THREE.Mesh(terrainGeoRight, this.matMgr.terrainMaterial);
    this.terrainRight.position.set(-(roadW / 2 + curbWidth + shoulderWidth + terrainWidth / 2), 0, 0);
    this.terrainRight.receiveShadow = true;

    this.group.add(this.terrainLeft, this.terrainRight);

    // 6. ANIMATED FLOWING VALLEY RIVER
    const riverWidth = 7.0;
    const riverGeo = new THREE.PlaneGeometry(riverWidth, CHUNK_LENGTH, 1, 4);
    riverGeo.rotateX(-Math.PI / 2);
    this.riverMesh = new THREE.Mesh(riverGeo, this.matMgr.waterMaterial);
    this.riverMesh.position.set(-(roadW / 2 + curbWidth + shoulderWidth + 12.0), -0.2, 0);
    this.riverMesh.receiveShadow = true;
    this.group.add(this.riverMesh);

    // 7. MULTI-FACETED STYLIZED MOUNTAINS
    this.buildMountains();
  }

  buildMountains() {
    // Multi-faceted stylized mountain geometry (replacing 4-sided cones)
    const createMountainGeometry = (radius, height) => {
      const geo = new THREE.ConeGeometry(radius, height, 8, 3);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y > 0 && y < height * 0.9) {
          // Asymmetrical crags and ridges
          const angle = Math.atan2(p.getZ(i), p.getX(i));
          const disp = Math.sin(angle * 3.0) * (radius * 0.18) + (Math.random() - 0.5) * (radius * 0.1);
          p.setX(i, p.getX(i) + Math.cos(angle) * disp);
          p.setZ(i, p.getZ(i) + Math.sin(angle) * disp);
        }
      }
      geo.computeVertexNormals();
      return geo;
    };

    const mtnGeo1 = createMountainGeometry(28, 42);
    const mtnGeo2 = createMountainGeometry(24, 36);

    this.leftMtn = new THREE.Mesh(mtnGeo1, this.matMgr.mountainMaterial);
    this.leftMtn.position.set(58, 16, -6);
    this.leftMtn.receiveShadow = true;

    this.rightMtn = new THREE.Mesh(mtnGeo2, this.matMgr.mountainMaterial);
    this.rightMtn.position.set(-62, 14, 8);
    this.rightMtn.receiveShadow = true;

    // Distant background ridge peak
    const farMtnGeo = createMountainGeometry(38, 55);
    this.farMtn = new THREE.Mesh(farMtnGeo, this.matMgr.mountainMaterial);
    this.farMtn.position.set(85, 20, 20);
    this.farMtn.receiveShadow = true;

    this.group.add(this.leftMtn, this.rightMtn, this.farMtn);
  }

  setup(chunkIndex, startZ, biomeType) {
    this.chunkIndex = chunkIndex;
    this.biomeType = biomeType;
    this.group.position.set(0, 0, startZ + CHUNK_LENGTH / 2);

    const cfg = BIOME_CONFIGS[biomeType] || BIOME_CONFIGS.EARTH_VALLEY;

    // Update biome-specific tinting
    if (this.terrainLeft && this.terrainRight) {
      this.matMgr.terrainMaterial.color.setHex(cfg.groundColor);
    }
    if (this.leftMtn && this.rightMtn) {
      this.matMgr.mountainMaterial.color.setHex(cfg.mountainColor);
    }

    // Toggle river visibility in non-desert biomes
    if (this.riverMesh) {
      this.riverMesh.visible = (biomeType !== 'DESERT' && biomeType !== 'KAMIS_REALM');
    }

    // Clear old scenery
    this.clearScenery();

    // Populate scenery based on biome
    this.populateScenery(cfg, startZ);
  }

  clearScenery() {
    for (const obj of this.sceneryObjects) {
      this.group.remove(obj);
    }
    this.sceneryObjects = [];
  }

  populateScenery(cfg, startZ) {
    const isDesert = this.biomeType === 'DESERT';
    const isKami = this.biomeType === 'KAMIS_REALM';
    const isSky = this.biomeType === 'SKY_ISLANDS';

    // Spawn 3 roadside natural scenery elements on each side
    const count = 3;
    for (let i = 0; i < count; i++) {
      const zOffset = (i / count) * CHUNK_LENGTH - CHUNK_LENGTH / 2 + 5;

      // Visual Left (+X in world coords)
      const leftX = 8.8 + Math.random() * 10.0;
      let leftProp;
      if (isKami) {
        leftProp = this.envAssets.createMarblePillar();
      } else if (isDesert) {
        leftProp = Math.random() > 0.4 ? this.envAssets.createCactus() : this.envAssets.createSceneryRock(true);
      } else if (isSky) {
        leftProp = this.envAssets.createFloatingIsland();
        leftProp.position.y = 8 + Math.random() * 6;
      } else {
        leftProp = Math.random() > 0.45 ? this.envAssets.createOakTree() : this.envAssets.createPineTree();
      }
      if (leftProp) {
        leftProp.position.x = leftX;
        if (!isSky) leftProp.position.y = 0;
        leftProp.position.z = zOffset;
        this.group.add(leftProp);
        this.sceneryObjects.push(leftProp);
      }

      // Visual Right (-X in world coords)
      const rightX = -(8.8 + Math.random() * 10.0);
      let rightProp;
      if (isKami) {
        rightProp = this.envAssets.createMarblePillar();
      } else if (isDesert) {
        rightProp = Math.random() > 0.4 ? this.envAssets.createCactus() : this.envAssets.createSceneryRock(true);
      } else if (isSky) {
        rightProp = this.envAssets.createFloatingIsland();
        rightProp.position.y = 6 + Math.random() * 7;
      } else {
        rightProp = Math.random() > 0.4 ? this.envAssets.createPineTree() : this.envAssets.createOakTree();
      }
      if (rightProp) {
        rightProp.position.x = rightX;
        if (!isSky) rightProp.position.y = 0;
        rightProp.position.z = zOffset + 6;
        this.group.add(rightProp);
        this.sceneryObjects.push(rightProp);
      }
    }

    // Roadside rocks / boulders
    if (Math.random() > 0.35) {
      const rock = this.envAssets.createSceneryRock(isDesert);
      const side = Math.random() > 0.5 ? 1 : -1;
      rock.position.set(side * (7.2 + Math.random() * 2.5), 0, (Math.random() - 0.5) * 30);
      this.group.add(rock);
      this.sceneryObjects.push(rock);
    }

    // Drifting anime cumulus clouds
    if (Math.random() > 0.5) {
      const cloud = this.envAssets.createCloud();
      cloud.position.set((Math.random() - 0.5) * 40, 24 + Math.random() * 8, (Math.random() - 0.5) * 30);
      this.group.add(cloud);
      this.sceneryObjects.push(cloud);
    }
  }
}
