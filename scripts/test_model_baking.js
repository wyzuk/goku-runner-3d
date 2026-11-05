import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import path from 'path';

// Helper to inspect GLB hierarchy in Node.js
function readGLB(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(arrayBuffer, '', resolve, reject);
  });
}

async function inspectAll() {
  const models = [
    { name: 'pine_tree_1', path: 'public/models/pine_tree (1).glb' },
    { name: 'oak_tree', path: 'public/models/oak_tree.glb' },
    { name: 'stylized_bush', path: 'public/models/stylized_bush.glb' },
    { name: 'fern', path: 'public/models/fern.glb' },
    { name: 'flowering_plant', path: 'public/models/flowering_plant.glb' },
    { name: 'grass_patch', path: 'public/models/grass_patch.glb' },
    { name: 'mossy_log', path: 'public/models/mossy_old_tree_log.glb' },
    { name: 'large_stone', path: 'public/models/large_stone.glb' },
    { name: 'mountain_1', path: 'public/models/low_poly_mountain (1).glb' },
    { name: 'gogeta', path: 'public/models/extracted_gogeta/source/a931b105-49c4-43f6-9362-51f3478d2624.glb' },
    { name: 'baby_goku', path: 'public/models/baby_goku_super_saiyan_iii.glb' }
  ];

  for (const m of models) {
    try {
      const gltf = await readGLB(m.path);
      const root = gltf.scene;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      let meshCount = 0;
      let totalTris = 0;
      const meshInfos = [];

      root.traverse((c) => {
        if (c.isMesh) {
          meshCount++;
          const tris = c.geometry.index ? c.geometry.index.count / 3 : c.geometry.attributes.position.count / 3;
          totalTris += tris;
          meshInfos.push({
            name: c.name,
            tris,
            mat: c.material ? c.material.name || c.material.type : 'none',
            hasMap: !!(c.material && c.material.map)
          });
        }
      });

      console.log(`=== ${m.name} ===`);
      console.log(` Size: [${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}]`);
      console.log(` Center: [${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}]`);
      console.log(` Meshes: ${meshCount}, Total Tris: ${totalTris}`);
      console.log(` Details:`, meshInfos.slice(0, 4));
    } catch (e) {
      console.error(`Failed ${m.name}:`, e.message);
    }
  }
}

inspectAll();
