import fs from 'fs';
import path from 'path';

// Let's inspect the GLTF/GLB files to understand their node structure, meshes, bounding boxes
const modelsDir = path.resolve('public/models');
const files = fs.readdirSync(modelsDir);

console.log('Found model files in public/models:');
for (const f of files) {
  const stat = fs.statSync(path.join(modelsDir, f));
  if (stat.isFile()) {
    console.log(` - ${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  } else if (stat.isDirectory()) {
    console.log(` - [DIR] ${f}`);
  }
}
