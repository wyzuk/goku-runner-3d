import * as THREE from 'three';
import { AnimeMaterials } from '../materials/AnimeMaterials.js';

/**
 * 3D Stylized Anime Goku Character Model
 * Detailed anatomy, multi-layered Saiyan hair, martial arts Gi, boots, hands, cel-shading,
 * and Super Saiyan transformation visuals.
 */
export class GokuModel {
  constructor() {
    this.materials = new AnimeMaterials();
    this.group = new THREE.Group();
    this.isSuperSaiyan = false;
    this.hairMeshes = [];
    this.eyeMeshes = [];
    this.sparkMeshes = [];

    this.joints = {};
    this.buildCharacter();
  }

  buildCharacter() {
    // Master offset so character feet stand naturally on ground (y = 0)
    const masterOffset = new THREE.Group();
    masterOffset.position.y = 0;
    this.group.add(masterOffset);

    // 1. ROOT / HIPS (Pelvis)
    this.joints.root = new THREE.Group();
    this.joints.root.position.y = 0.95;
    masterOffset.add(this.joints.root);

    // Pelvis Mesh
    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.2, 8);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.materials.giOrange);
    pelvisMesh.castShadow = true;
    this.joints.root.add(pelvisMesh);

    // Blue Belt / Sash around waist
    const beltGeo = new THREE.CylinderGeometry(0.255, 0.25, 0.12, 10);
    const beltMesh = new THREE.Mesh(beltGeo, this.materials.blueClothing);
    beltMesh.position.y = 0.05;
    beltMesh.castShadow = true;
    this.joints.root.add(beltMesh);

    // Belt Knot and flowing tails
    const knotGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const knotMesh = new THREE.Mesh(knotGeo, this.materials.blueClothing);
    knotMesh.position.set(0.12, 0.05, 0.24);
    this.joints.root.add(knotMesh);

    this.joints.beltTails = new THREE.Group();
    this.joints.beltTails.position.set(0.12, 0.03, 0.25);
    const tailGeo = new THREE.BoxGeometry(0.065, 0.38, 0.02);
    const tailMesh1 = new THREE.Mesh(tailGeo, this.materials.blueClothing);
    tailMesh1.position.set(0, -0.16, 0);
    tailMesh1.rotation.z = 0.15;
    const tailMesh2 = new THREE.Mesh(tailGeo, this.materials.blueClothing);
    tailMesh2.position.set(0.05, -0.15, 0.01);
    tailMesh2.rotation.z = -0.18;
    this.joints.beltTails.add(tailMesh1);
    this.joints.beltTails.add(tailMesh2);
    this.joints.root.add(this.joints.beltTails);

    // 2. SPINE / TORSO
    this.joints.spine = new THREE.Group();
    this.joints.spine.position.y = 0.12;
    this.joints.root.add(this.joints.spine);

    // Torso (Orange Gi + Blue Undershirt)
    const torsoGeo = new THREE.CylinderGeometry(0.3, 0.24, 0.44, 8);
    const torsoMesh = new THREE.Mesh(torsoGeo, this.materials.giOrange);
    torsoMesh.position.y = 0.22;
    torsoMesh.castShadow = true;
    this.joints.spine.add(torsoMesh);

    // Blue Undershirt visible at V-neck chest opening
    const undershirtGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.32, 6);
    const undershirtMesh = new THREE.Mesh(undershirtGeo, this.materials.blueClothing);
    undershirtMesh.position.set(0, 0.25, 0.04);
    undershirtMesh.scale.set(0.75, 0.9, 0.55);
    this.joints.spine.add(undershirtMesh);

    // Muscular Chest definition (Pectorals)
    const pecGeo = new THREE.BoxGeometry(0.15, 0.13, 0.09);
    const pecLeft = new THREE.Mesh(pecGeo, this.materials.giOrange);
    pecLeft.position.set(-0.08, 0.28, 0.15);
    pecLeft.rotation.y = 0.12;
    const pecRight = new THREE.Mesh(pecGeo, this.materials.giOrange);
    pecRight.position.set(0.08, 0.28, 0.15);
    pecRight.rotation.y = -0.12;
    this.joints.spine.add(pecLeft);
    this.joints.spine.add(pecRight);

    // Kanji circle badge on chest
    const kanjiGeo = new THREE.CircleGeometry(0.065, 12);
    const kanjiMesh = new THREE.Mesh(kanjiGeo, this.materials.kanjiEmblem);
    kanjiMesh.position.set(-0.11, 0.30, 0.19);
    kanjiMesh.rotation.y = 0.15;
    this.joints.spine.add(kanjiMesh);

    // Large Kanji circle badge on back
    const backKanjiGeo = new THREE.CircleGeometry(0.13, 16);
    const backKanjiMesh = new THREE.Mesh(backKanjiGeo, this.materials.kanjiEmblem);
    backKanjiMesh.position.set(0, 0.27, -0.17);
    backKanjiMesh.rotation.y = Math.PI;
    this.joints.spine.add(backKanjiMesh);

    // 3. NECK
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.12, 8);
    const neckMesh = new THREE.Mesh(neckGeo, this.materials.skin);
    neckMesh.position.y = 0.45;
    this.joints.spine.add(neckMesh);

    // 4. HEAD & ANIME FACE
    this.joints.head = new THREE.Group();
    this.joints.head.position.y = 0.54;
    this.joints.spine.add(this.joints.head);

    // Face / Head Base
    const headGeo = new THREE.SphereGeometry(0.195, 14, 14);
    headGeo.scale(1.0, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeo, this.materials.skin);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    this.joints.head.add(headMesh);

    // Anime V-Line Chin / Jawline
    const chinGeo = new THREE.ConeGeometry(0.145, 0.19, 6);
    const chinMesh = new THREE.Mesh(chinGeo, this.materials.skin);
    chinMesh.position.set(0, 0.05, 0.065);
    chinMesh.rotation.x = Math.PI * 0.9;
    this.joints.head.add(chinMesh);

    // Anime Eyes
    const createEye = (xPos) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xPos, 0.155, 0.165);

      // Sclera (White)
      const scleraGeo = new THREE.PlaneGeometry(0.068, 0.048);
      const scleraMesh = new THREE.Mesh(scleraGeo, this.materials.eyeWhite);
      eyeGroup.add(scleraMesh);

      // Colored Iris & Pupil
      const pupilGeo = new THREE.PlaneGeometry(0.038, 0.042);
      const pupilMesh = new THREE.Mesh(pupilGeo, this.materials.eyeNormal);
      pupilMesh.position.z = 0.002;
      eyeGroup.add(pupilMesh);
      this.eyeMeshes.push(pupilMesh);

      // Fierce Saiyan Eyebrow
      const browGeo = new THREE.BoxGeometry(0.085, 0.02, 0.025);
      const browMesh = new THREE.Mesh(browGeo, this.materials.hairNormal);
      browMesh.position.set(0, 0.036, 0.01);
      browMesh.rotation.z = xPos < 0 ? -0.28 : 0.28; // Piercing warrior glare
      eyeGroup.add(browMesh);
      this.hairMeshes.push(browMesh);

      return eyeGroup;
    };

    this.joints.head.add(createEye(-0.068));
    this.joints.head.add(createEye(0.068));

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.022, 0.045, 4);
    const noseMesh = new THREE.Mesh(noseGeo, this.materials.skin);
    noseMesh.position.set(0, 0.125, 0.2);
    noseMesh.rotation.x = 0.38;
    this.joints.head.add(noseMesh);

    // Ears
    const earGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.02, 6);
    const earLeft = new THREE.Mesh(earGeo, this.materials.skin);
    earLeft.position.set(-0.21, 0.14, 0);
    earLeft.rotation.z = 0.3;
    const earRight = new THREE.Mesh(earGeo, this.materials.skin);
    earRight.position.set(0.21, 0.14, 0);
    earRight.rotation.z = -0.3;
    this.joints.head.add(earLeft);
    this.joints.head.add(earRight);

    // 5. SIGNATURE SAIYAN SPIKY HAIR
    this.buildGokuHair(this.joints.head);

    // 6. SHOULDERS & ARMS
    this.buildArms(this.joints.spine);

    // 7. LEGS & BOOTS
    this.buildLegs(this.joints.root);

    // 8. SUPER SAIYAN AURA SHELL MESH
    const auraGeo = new THREE.SphereGeometry(1.25, 18, 18);
    auraGeo.scale(0.85, 1.45, 0.85);
    this.auraMesh = new THREE.Mesh(auraGeo, this.materials.auraMaterial);
    this.auraMesh.position.set(0, 0.9, 0);
    this.auraMesh.visible = false;
    this.group.add(this.auraMesh);

    // SSJ Point Light for intense gold glow
    this.ssjLight = new THREE.PointLight(0xffea44, 0, 12);
    this.ssjLight.position.set(0, 1.2, 0);
    this.group.add(this.ssjLight);

    // SSJ Crackling Electrical Sparks Group
    this.joints.sparksGroup = new THREE.Group();
    this.buildLightningArcs(this.joints.sparksGroup);
    this.group.add(this.joints.sparksGroup);
  }

  buildGokuHair(parentHead) {
    const hairSpikes = [
      // Top Center Main Crown Spike
      { pos: [0, 0.34, 0.02], rot: [0.1, 0, 0.05], scale: [0.13, 0.45, 0.13] },
      // Top Left Spike
      { pos: [-0.13, 0.32, -0.02], rot: [-0.1, 0, 0.35], scale: [0.12, 0.4, 0.12] },
      // Top Right Spike
      { pos: [0.13, 0.32, -0.02], rot: [-0.1, 0, -0.35], scale: [0.12, 0.4, 0.12] },
      // Iconic Huge Left Saiyan Flare Spike
      { pos: [-0.24, 0.26, 0.02], rot: [0.15, 0.2, 0.78], scale: [0.14, 0.48, 0.14] },
      // Far Left Sweep Spike
      { pos: [-0.3, 0.17, -0.06], rot: [-0.1, 0.3, 1.08], scale: [0.12, 0.39, 0.12] },
      // Upper Right Spike
      { pos: [0.24, 0.25, 0.02], rot: [0.15, -0.2, -0.75], scale: [0.13, 0.45, 0.13] },
      // Far Right Sweep Spike
      { pos: [0.29, 0.16, -0.06], rot: [-0.1, -0.3, -1.05], scale: [0.11, 0.38, 0.11] },
      // Back Crown Spike
      { pos: [0, 0.28, -0.17], rot: [-0.4, 0, 0], scale: [0.14, 0.42, 0.14] },
      // Back Left Spike
      { pos: [-0.15, 0.23, -0.16], rot: [-0.35, 0.2, 0.35], scale: [0.12, 0.38, 0.12] },
      // Back Right Spike
      { pos: [0.15, 0.23, -0.16], rot: [-0.35, -0.2, -0.35], scale: [0.12, 0.38, 0.12] },
      // Lower Back Nape Spike
      { pos: [0, 0.12, -0.19], rot: [-0.6, 0, 0], scale: [0.11, 0.3, 0.11] },
      // Forehead Bang Left
      { pos: [-0.075, 0.24, 0.17], rot: [0.35, -0.2, 0.25], scale: [0.07, 0.24, 0.07] },
      // Forehead Bang Right
      { pos: [0.075, 0.24, 0.17], rot: [0.35, 0.2, -0.25], scale: [0.07, 0.24, 0.07] },
      // Forehead Center Tuft
      { pos: [0, 0.27, 0.18], rot: [0.4, 0, 0], scale: [0.075, 0.22, 0.075] }
    ];

    hairSpikes.forEach(spec => {
      const spikeGeo = new THREE.ConeGeometry(1.0, 1.0, 6);
      spikeGeo.translate(0, 0.5, 0);
      const mesh = new THREE.Mesh(spikeGeo, this.materials.hairNormal);
      mesh.position.set(...spec.pos);
      mesh.rotation.set(...spec.rot);
      mesh.scale.set(...spec.scale);
      mesh.castShadow = true;
      parentHead.add(mesh);
      this.hairMeshes.push(mesh);
    });
  }

  buildArms(parentSpine) {
    const buildArm = (isLeft) => {
      const side = isLeft ? -1 : 1;
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.29, 0.36, 0);
      parentSpine.add(shoulderGroup);

      // Blue undershirt shoulder wrap
      const wrapGeo = new THREE.SphereGeometry(0.115, 8, 8);
      const wrapMesh = new THREE.Mesh(wrapGeo, this.materials.blueClothing);
      shoulderGroup.add(wrapMesh);

      // Muscular Upper Arm (Bicep/Tricep)
      const armGroup = new THREE.Group();
      shoulderGroup.add(armGroup);

      const bicepGeo = new THREE.CylinderGeometry(0.085, 0.078, 0.27, 8);
      const bicepMesh = new THREE.Mesh(bicepGeo, this.materials.skin);
      bicepMesh.position.y = -0.135;
      bicepMesh.castShadow = true;
      armGroup.add(bicepMesh);

      // Forearm & Blue Wristband
      const forearmGroup = new THREE.Group();
      forearmGroup.position.y = -0.27;
      armGroup.add(forearmGroup);

      const forearmGeo = new THREE.CylinderGeometry(0.078, 0.072, 0.25, 8);
      const forearmMesh = new THREE.Mesh(forearmGeo, this.materials.skin);
      forearmMesh.position.y = -0.125;
      forearmMesh.castShadow = true;
      forearmGroup.add(forearmMesh);

      // Blue Martial Arts Wristband
      const wristGeo = new THREE.CylinderGeometry(0.085, 0.082, 0.12, 8);
      const wristMesh = new THREE.Mesh(wristGeo, this.materials.blueClothing);
      wristMesh.position.y = -0.175;
      wristMesh.castShadow = true;
      forearmGroup.add(wristMesh);

      // Hand / Fist with shaped knuckles and thumb
      const handGroup = new THREE.Group();
      handGroup.position.y = -0.27;
      forearmGroup.add(handGroup);

      const palmGeo = new THREE.BoxGeometry(0.085, 0.08, 0.075);
      const palmMesh = new THREE.Mesh(palmGeo, this.materials.skin);
      handGroup.add(palmMesh);

      const thumbGeo = new THREE.BoxGeometry(0.03, 0.04, 0.04);
      const thumbMesh = new THREE.Mesh(thumbGeo, this.materials.skin);
      thumbMesh.position.set(side * 0.045, -0.01, 0.02);
      handGroup.add(thumbMesh);

      return { shoulder: shoulderGroup, arm: armGroup, forearm: forearmGroup, hand: handGroup };
    };

    const left = buildArm(true);
    const right = buildArm(false);

    this.joints.leftArm = left.arm;
    this.joints.leftForearm = left.forearm;
    this.joints.leftHand = left.hand;
    this.joints.rightArm = right.arm;
    this.joints.rightForearm = right.forearm;
    this.joints.rightHand = right.hand;
  }

  buildLegs(parentRoot) {
    const buildLeg = (isLeft) => {
      const side = isLeft ? -1 : 1;
      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.135, -0.06, 0);
      parentRoot.add(hipJoint);

      // Thigh (Baggy Martial Arts Orange Pants)
      const thighGeo = new THREE.CylinderGeometry(0.13, 0.115, 0.44, 8);
      const thighMesh = new THREE.Mesh(thighGeo, this.materials.giOrange);
      thighMesh.position.y = -0.22;
      thighMesh.castShadow = true;
      hipJoint.add(thighMesh);

      // Shin / Knee
      const shinJoint = new THREE.Group();
      shinJoint.position.y = -0.44;
      hipJoint.add(shinJoint);

      const shinGeo = new THREE.CylinderGeometry(0.11, 0.098, 0.4, 8);
      const shinMesh = new THREE.Mesh(shinGeo, this.materials.giOrange);
      shinMesh.position.y = -0.17;
      shinMesh.castShadow = true;
      shinJoint.add(shinMesh);

      // Goku Blue Boot
      const bootJoint = new THREE.Group();
      bootJoint.position.y = -0.38;
      shinJoint.add(bootJoint);

      // Boot Shaft (Dark Blue)
      const bootShaftGeo = new THREE.CylinderGeometry(0.098, 0.082, 0.24, 8);
      const bootShaftMesh = new THREE.Mesh(bootShaftGeo, this.materials.boots);
      bootShaftMesh.position.y = 0.04;
      bootShaftMesh.castShadow = true;
      bootJoint.add(bootShaftMesh);

      // Red Trim on top collar of boot
      const trimGeo = new THREE.TorusGeometry(0.092, 0.018, 6, 12);
      trimGeo.rotateX(Math.PI / 2);
      const trimMesh = new THREE.Mesh(trimGeo, this.materials.bootTrim);
      trimMesh.position.y = 0.12;
      bootJoint.add(trimMesh);

      // Foot Base / Sole (Blue Saiyan Boot with Defined Profile)
      const footGeo = new THREE.BoxGeometry(0.125, 0.095, 0.24);
      const footMesh = new THREE.Mesh(footGeo, this.materials.boots);
      footMesh.position.set(0, -0.065, 0.055);
      footMesh.castShadow = true;
      bootJoint.add(footMesh);

      // Yellow Rope Lace on front of boot
      const laceGeo = new THREE.BoxGeometry(0.03, 0.14, 0.02);
      const laceMesh = new THREE.Mesh(laceGeo, this.materials.hairSSJ);
      laceMesh.position.set(0, 0.02, 0.09);
      bootJoint.add(laceMesh);

      return { hip: hipJoint, shin: shinJoint, boot: bootJoint };
    };

    const left = buildLeg(true);
    const right = buildLeg(false);

    this.joints.leftThigh = left.hip;
    this.joints.leftShin = left.shin;
    this.joints.leftFoot = left.boot;
    this.joints.rightThigh = right.hip;
    this.joints.rightShin = right.shin;
    this.joints.rightFoot = right.boot;
  }

  buildLightningArcs(parentGroup) {
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0 });
    for (let i = 0; i < 4; i++) {
      const arcGeo = new THREE.BoxGeometry(0.03, 0.35, 0.03);
      const arcMesh = new THREE.Mesh(arcGeo, sparkMat);
      arcMesh.visible = false;
      parentGroup.add(arcMesh);
      this.sparkMeshes.push(arcMesh);
    }
  }

  setSuperSaiyan(isSSJ) {
    this.isSuperSaiyan = isSSJ;
    const hairMat = isSSJ ? this.materials.hairSSJ : this.materials.hairNormal;
    const eyeMat = isSSJ ? this.materials.eyeSSJ : this.materials.eyeNormal;

    this.hairMeshes.forEach(mesh => {
      mesh.material = hairMat;
      if (isSSJ) {
        mesh.scale.multiplyScalar(1.08); // Flared Saiyan spike expansion
      } else {
        mesh.scale.multiplyScalar(1 / 1.08);
      }
    });

    this.eyeMeshes.forEach(mesh => {
      mesh.material = eyeMat;
    });

    this.auraMesh.visible = isSSJ;
    this.ssjLight.intensity = isSSJ ? 3.5 : 0;
    this.sparkMeshes.forEach(m => { m.visible = isSSJ; });
  }

  update(time, deltaTime) {
    this.materials.update(time, deltaTime);

    // Flowing sash / belt flutter with speed
    if (this.joints.beltTails) {
      this.joints.beltTails.rotation.x = Math.sin(time * 14.0) * 0.28 - 0.2;
    }

    if (this.isSuperSaiyan) {
      if (this.auraMesh.visible) {
        this.ssjLight.intensity = 2.8 + Math.sin(time * 18.0) * 0.7;
        this.auraMesh.rotation.y = time * 2.5;
      }

      // Crackling lightning arcs orbiting Goku
      if (this.sparkMeshes.length > 0) {
        for (let i = 0; i < this.sparkMeshes.length; i++) {
          const arc = this.sparkMeshes[i];
          if (Math.random() > 0.4) {
            arc.visible = true;
            const angle = time * 8.0 + (i * Math.PI) / 2;
            const radius = 0.5 + Math.random() * 0.35;
            arc.position.set(Math.cos(angle) * radius, 0.6 + Math.random() * 0.8, Math.sin(angle) * radius);
            arc.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
          } else {
            arc.visible = false;
          }
        }
      }
    }
  }
}
