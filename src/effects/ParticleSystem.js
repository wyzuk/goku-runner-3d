import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Shared materials
    this.dustMat = new THREE.MeshBasicMaterial({ color: 0xddc8a0, transparent: true, opacity: 0.6 });
    this.goldMat = new THREE.MeshBasicMaterial({ color: 0xffea33, transparent: true, opacity: 0.9 });
    this.cyanMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.9 });
    this.ssjLightningMat = new THREE.LineBasicMaterial({ color: 0x66ffff, linewidth: 2 });

    // Lightning arcs for SSJ
    this.lightningGroup = new THREE.Group();
    this.scene.add(this.lightningGroup);
    this.lightningLines = [];
    this.buildLightningLines();
  }

  buildLightningLines() {
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(18); // 6 vertices
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const line = new THREE.Line(geo, this.ssjLightningMat);
      line.visible = false;
      this.lightningGroup.add(line);
      this.lightningLines.push(line);
    }
  }

  spawnBurst(pos, colorType = 'GOLD', count = 12) {
    const mat = colorType === 'GOLD' ? this.goldMat : (colorType === 'CYAN' ? this.cyanMat : this.dustMat);
    const geo = new THREE.SphereGeometry(0.1, 4, 4);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.position.copy(pos);
      
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6.0,
        Math.random() * 5.0 + 1.0,
        (Math.random() - 0.5) * 6.0
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
        scaleSpeed: -0.4
      });
    }
  }

  spawnFootstepDust(pos) {
    const geo = new THREE.SphereGeometry(0.12, 4, 4);
    const mesh = new THREE.Mesh(geo, this.dustMat.clone());
    mesh.position.set(pos.x + (Math.random() - 0.5) * 0.4, 0.05, pos.z - 0.3);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, 0.5 + Math.random() * 0.5, -2.0),
      life: 0.35,
      maxLife: 0.35,
      scaleSpeed: 0.8
    });
  }

  update(dt, playerPos, isSuperSaiyan = false) {
    // 1. Update general particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.y -= 9.8 * dt; // Gravity
      
      const t = p.life / p.maxLife;
      if (p.mesh.material) {
        p.mesh.material.opacity = t;
      }
      p.mesh.scale.addScalar(p.scaleSpeed * dt);
      if (p.mesh.scale.x < 0.01) p.mesh.scale.set(0.01, 0.01, 0.01);
    }

    // 2. SSJ Sparks and Lightning
    if (isSuperSaiyan && playerPos) {
      this.lightningGroup.position.copy(playerPos);

      // Random sparks around Goku
      if (Math.random() > 0.3) {
        const sparkPos = new THREE.Vector3(
          playerPos.x + (Math.random() - 0.5) * 1.6,
          playerPos.y + Math.random() * 2.2,
          playerPos.z + (Math.random() - 0.5) * 1.6
        );
        this.spawnBurst(sparkPos, 'GOLD', 2);
      }

      // Dynamic jagged lightning arcs
      this.lightningLines.forEach((line) => {
        if (Math.random() > 0.4) {
          line.visible = true;
          const posAttr = line.geometry.attributes.position;
          const arr = posAttr.array;
          let lx = (Math.random() - 0.5) * 0.6;
          let ly = Math.random() * 0.4;
          let lz = (Math.random() - 0.5) * 0.6;

          for (let v = 0; v < 6; v++) {
            arr[v * 3] = lx;
            arr[v * 3 + 1] = ly;
            arr[v * 3 + 2] = lz;
            lx += (Math.random() - 0.5) * 0.5;
            ly += 0.35 + Math.random() * 0.15;
            lz += (Math.random() - 0.5) * 0.5;
          }
          posAttr.needsUpdate = true;
        } else {
          line.visible = false;
        }
      });
    } else {
      this.lightningLines.forEach(l => l.visible = false);
    }
  }

  reset() {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
    }
    this.particles = [];
    this.lightningLines.forEach(l => l.visible = false);
  }
}
