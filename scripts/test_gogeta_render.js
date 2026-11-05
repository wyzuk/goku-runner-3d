import { preview } from 'vite';
import puppeteer from 'puppeteer-core';

async function testGogetaView() {
  const server = await preview({ preview: { port: 4175 } });
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4175/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Spawn Gogeta in front of camera
  await page.evaluate(() => {
    const scene = window.gokuGame.scene;
    const gogeta = window.modelLoader.createInstance('gogeta');
    if (gogeta) {
      gogeta.scale.set(1.8, 1.8, 1.8);
      gogeta.position.set(0, 0.9, 5); // 5m ahead of camera
      gogeta.rotation.set(0, Math.PI, 0); // Face camera
      scene.add(gogeta);
    }
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'docs/screenshots/test_gogeta_render.png' });
  console.log('Saved test_gogeta_render.png');

  await browser.close();
  await server.close();
}

testGogetaView().catch(console.error);
