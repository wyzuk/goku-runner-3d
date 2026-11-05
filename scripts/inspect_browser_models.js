import { preview } from 'vite';
import puppeteer from 'puppeteer-core';

async function inspectInBrowser() {
  const server = await preview({ preview: { port: 4173 } });
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    // Access modelLoader
    const cache = window.modelLoader ? window.modelLoader.cache : null;
    if (!cache) return { error: 'No modelLoader on window' };

    const info = {};
    for (const [key, scene] of cache.entries()) {
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      let triCount = 0;
      let meshNames = [];
      scene.traverse((c) => {
        if (c.isMesh) {
          const tris = c.geometry.index ? c.geometry.index.count / 3 : c.geometry.attributes.position.count / 3;
          triCount += tris;
          meshNames.push(`${c.name || 'unnamed'}(${tris} tris, mat:${c.material ? c.material.name : 'none'})`);
        }
      });

      info[key] = {
        size: [parseFloat(size.x.toFixed(2)), parseFloat(size.y.toFixed(2)), parseFloat(size.z.toFixed(2))],
        center: [parseFloat(center.x.toFixed(2)), parseFloat(center.y.toFixed(2)), parseFloat(center.z.toFixed(2))],
        triCount,
        meshes: meshNames
      };
    }
    return info;
  });

  console.log(JSON.stringify(result, null, 2));

  await browser.close();
  await server.close();
}

inspectInBrowser().catch(console.error);
