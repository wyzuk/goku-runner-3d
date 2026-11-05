import fs from 'fs';
import path from 'path';

const gogetaPath = path.resolve('public/models/extracted_gogeta/source/a931b105-49c4-43f6-9362-51f3478d2624.glb');
if (fs.existsSync(gogetaPath)) {
  const stat = fs.statSync(gogetaPath);
  console.log(`Gogeta file exists! Size: ${(stat.size / 1024).toFixed(1)} KB`);
} else {
  console.log('Gogeta file does not exist at:', gogetaPath);
}
