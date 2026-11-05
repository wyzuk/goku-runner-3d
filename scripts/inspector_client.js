import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let renderer, scene, camera, modelGroup, gridHelper;
const canvas = document.getElementById('viewport');
const statusEl = document.getElementById('status');

function init() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });
  renderer.setSize(800, 600);
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 5000);
  camera.position.set(3, 2, 4);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 1.2);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x88bbff, 1.0);
  fillLight.position.set(-15, 10, -10);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
  backLight.position.set(0, -10, -15);
  scene.add(backLight);

  modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // Subdued circular pedestal or grid
  gridHelper = new THREE.GridHelper(10, 20, 0x00e5ff, 0x334455);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  window.__INSPECTOR_READY__ = true;
  statusEl.textContent = 'Inspector Ready';
}

window.inspectModel = async function (modelUrl) {
  statusEl.textContent = `Loading ${modelUrl}...`;
  const startTime = performance.now();

  // Clear previous model
  while (modelGroup.children.length > 0) {
    const obj = modelGroup.children[0];
    modelGroup.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
  }

  const loader = new GLTFLoader();

  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        modelUrl,
        resolve,
        undefined,
        (err) => reject(new Error(err.message || String(err)))
      );
    });

    const loadTimeMs = Math.round(performance.now() - startTime);

    const model = gltf.scene;
    modelGroup.add(model);

    // Geometry & Hierarchy Analysis
    let meshCount = 0;
    let skinnedMeshCount = 0;
    let totalTriangles = 0;
    let totalVertices = 0;
    const materialsMap = new Map();
    const bones = [];

    model.traverse((child) => {
      if (child.isBone) {
        bones.push(child.name || 'unnamed_bone');
      }

      if (child.isMesh || child.isSkinnedMesh) {
        meshCount++;
        if (child.isSkinnedMesh) skinnedMeshCount++;

        const geom = child.geometry;
        if (geom) {
          const vertCount = geom.attributes.position ? geom.attributes.position.count : 0;
          totalVertices += vertCount;

          if (geom.index) {
            totalTriangles += geom.index.count / 3;
          } else {
            totalTriangles += vertCount / 3;
          }
        }

        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of mats) {
          if (!m) continue;
          if (!materialsMap.has(m.uuid)) {
            const textureMaps = [];
            if (m.map) textureMaps.push('diffuse/color');
            if (m.normalMap) textureMaps.push('normal');
            if (m.roughnessMap) textureMaps.push('roughness');
            if (m.metalnessMap) textureMaps.push('metalness');
            if (m.emissiveMap) textureMaps.push('emissive');
            if (m.alphaMap) textureMaps.push('alpha');
            if (m.aoMap) textureMaps.push('ao');

            materialsMap.set(m.uuid, {
              name: m.name || 'unnamed_mat',
              type: m.type,
              transparent: !!m.transparent,
              opacity: m.opacity,
              wireframe: !!m.wireframe,
              side: m.side === THREE.DoubleSide ? 'DoubleSide' : (m.side === THREE.BackSide ? 'BackSide' : 'FrontSide'),
              textures: textureMaps
            });
          }
        }
      }
    });

    // Animations Analysis
    const animations = (gltf.animations || []).map((clip) => ({
      name: clip.name,
      duration: Math.round(clip.duration * 100) / 100,
      tracksCount: clip.tracks.length
    }));

    // Bounding Box & Centering
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Center model at origin
    model.position.x = -center.x;
    model.position.y = -box.min.y; // Sit on the ground plane (y=0)
    model.position.z = -center.z;

    const maxDim = Math.max(size.x, size.y, size.z, 0.001);

    // Update grid scale to match object size
    gridHelper.scale.set(maxDim, 1, maxDim);

    // Auto-frame camera
    const dist = maxDim * 2.2;
    camera.near = maxDim * 0.01;
    camera.far = maxDim * 50;
    camera.position.set(dist * 0.9, dist * 0.6 + size.y * 0.5, dist * 1.1);
    camera.lookAt(0, size.y * 0.45, 0);
    camera.updateProjectionMatrix();

    // Render 2 frames
    renderer.render(scene, camera);
    renderer.render(scene, camera);

    statusEl.textContent = `Loaded ${modelUrl} (${totalTriangles.toLocaleString()} tris)`;

    return {
      success: true,
      loadTimeMs,
      geometry: {
        meshCount,
        skinnedMeshCount,
        totalTriangles: Math.round(totalTriangles),
        totalVertices
      },
      dimensions: {
        x: Math.round(size.x * 100) / 100,
        y: Math.round(size.y * 100) / 100,
        z: Math.round(size.z * 100) / 100,
        maxDim: Math.round(maxDim * 100) / 100
      },
      center: {
        x: Math.round(center.x * 100) / 100,
        y: Math.round(center.y * 100) / 100,
        z: Math.round(center.z * 100) / 100
      },
      materials: Array.from(materialsMap.values()),
      animations,
      skeleton: {
        hasSkeleton: bones.length > 0 || skinnedMeshCount > 0,
        boneCount: bones.length,
        bonesSample: bones.slice(0, 10)
      }
    };
  } catch (error) {
    statusEl.textContent = `Error loading ${modelUrl}: ${error.message}`;
    return {
      success: false,
      error: error.message
    };
  }
};

init();
