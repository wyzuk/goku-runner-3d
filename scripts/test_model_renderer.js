import { preview } from 'vite';
import puppeteer from 'puppeteer-core';

async function testRealModels() {
  const server = await preview({ preview: { port: 4173 } });
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Let's spawn each real model in front of the camera and screenshot it
  const modelKeys = ['gogeta', 'tree_oak', 'tree_pine', 'bush_stylized', 'fern', 'grass_patch', 'mossy_log', 'rock_desert', 'mtn_ridge'];
  
  for (const key of modelKeys) {
    const info = await page.evaluate((k) => {
      if (!window.modelLoader || !window.modelLoader.has(k)) return null;
      const clone = window.modelLoader.createInstance(k);
      if (!clone) return null;

      // Compute bounding box
      clone.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      return {
        key: k,
        size: [size.x, size.y, size.z],
        center: [center.x, center.y, center.z]
      };
    }, key);

    console.log(`Inspected ${key}:`, info);
  }

  await browser.close();
  await server.close();
}

testRealModels().catch(console.error);
