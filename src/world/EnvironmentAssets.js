import * as THREE from 'three';
import { getMaterialManager } from '../materials/MaterialManager.js';

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

  createOakTree() {
    const tree = new THREE.Group();
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 2.6, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.trunk);
    trunk.position.y = 1.3;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Fluffy anime foliage clusters
    const canopy = new THREE.Group();
    canopy.position.y = 2.9;

    const mainFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), this.materials.oakLeaves);
    mainFoliage.castShadow = true;
    mainFoliage.receiveShadow = true;
    canopy.add(mainFoliage);

    const puff1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 1), this.materials.oakLeaves);
    puff1.position.set(-0.9, -0.2, 0.4);
    puff1.castShadow = true;
    canopy.add(puff1);

    const puff2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), this.materials.oakLeaves);
    puff2.position.set(0.9, -0.25, -0.3);
    puff2.castShadow = true;
    canopy.add(puff2);

    tree.add(canopy);
    return tree;
  }

  createPineTree() {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.38, 2.2, 8),
      this.materials.trunk
    );
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // 3 tiered cones for stylized pine
    const tiers = [
      { y: 2.3, r: 1.5, h: 1.6 },
      { y: 3.3, r: 1.2, h: 1.4 },
      { y: 4.2, r: 0.8, h: 1.2 }
    ];

    tiers.forEach(t => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(t.r, t.h, 7),
        this.materials.pineLeaves
      );
      cone.position.y = t.y;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    });

    return tree;
  }

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

    const puff1 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), mat);
    puff1.position.set(-1.8, 0.4, 0);
    const puff2 = new THREE.Mesh(new THREE.SphereGeometry(1.9, 8, 8), mat);
    puff2.position.set(1.5, 0.3, 0.2);
    const topPuff = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), mat);
    topPuff.position.set(0, 1.0, -0.1);

    cloud.add(puff1, puff2, topPuff);
    return cloud;
  }

  createFloatingIsland() {
    const island = new THREE.Group();
    const topGeo = new THREE.CylinderGeometry(3.5, 3.2, 0.6, 8);
    const topMesh = new THREE.Mesh(topGeo, this.materials.oakLeaves);
    island.add(topMesh);

    const bottomGeo = new THREE.ConeGeometry(3.2, 4.0, 7);
    bottomGeo.rotateX(Math.PI);
    const bottomMesh = new THREE.Mesh(bottomGeo, this.materials.rock);
    bottomMesh.position.y = -2.0;
    island.add(bottomMesh);

    return island;
  }
}
