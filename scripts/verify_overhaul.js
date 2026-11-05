import { preview } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function testAndCapture() {
  console.log('--- Launching Vite Preview Server ---');
  const server = await preview();
  const port = server.httpServer ? server.httpServer.address().port : 4173;
  console.log(`--- Server running on port ${port} ---`);
  
  console.log('--- Launching Chrome via Puppeteer ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('[Browser Error]:', msg.text());
    } else {
      console.log('[Browser Log]:', msg.text());
    }
  });

  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  // Wait for 3D models to finish preloading
  await page.waitForFunction(() => window.modelLoader && window.modelLoader.isReady, { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  fs.mkdirSync('docs/screenshots', { recursive: true });

  // 1. Screenshot Main Menu (Goku from front)
  await page.screenshot({ path: 'docs/screenshots/01_menu_with_new_goku.png' });
  console.log('Saved 01_menu_with_new_goku.png');

  // 2. Click Play
  await page.click('#menu-play-btn');
  console.log('Clicked Play button!');
  await new Promise(r => setTimeout(r, 3200));

  // Run forward and take gameplay screenshot
  await page.screenshot({ path: 'docs/screenshots/02_running_gameplay_overhaul.png' });
  console.log('Saved 02_running_gameplay_overhaul.png');

  // 3. Jump
  await page.keyboard.press('KeyW');
  await new Promise(r => setTimeout(r, 350));
  await page.screenshot({ path: 'docs/screenshots/03_jump_overhaul.png' });
  console.log('Saved 03_jump_overhaul.png');
  await new Promise(r => setTimeout(r, 600));

  // 4. Slide
  await page.keyboard.press('KeyS');
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'docs/screenshots/04_slide_overhaul.png' });
  console.log('Saved 04_slide_overhaul.png');
  await new Promise(r => setTimeout(r, 1200));

  // 5. Activate Super Saiyan
  await page.evaluate(() => {
    if (window.gokuGame) {
      window.gokuGame.player.transformation.addKi(100);
      window.gokuGame.player.transformation.activateTransformation();
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'docs/screenshots/05_super_saiyan_overhaul.png' });
  console.log('Saved 05_super_saiyan_overhaul.png');

  // 6. Turn on Debug HUD to verify FPS, Draw Calls, Triangles
  await page.keyboard.press('KeyB');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'docs/screenshots/06_debug_hud_metrics.png' });
  console.log('Saved 06_debug_hud_metrics.png');

  // Switch to Gogeta Adult Saiyan skin and take screenshot
  await page.evaluate(() => {
    if (window.gokuGame) {
      window.gokuGame.setPlayerSkin('GOGETA');
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'docs/screenshots/07_gogeta_running.png' });
  console.log('Saved 07_gogeta_running.png');

  // 7. Measure performance over 3 seconds
  console.log('Measuring performance over 3 seconds...');
  const metrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      let totalDrawCalls = 0;
      let totalTriangles = 0;
      let totalGeometries = 0;
      let totalTextures = 0;
      let minFps = 999;
      let lastTime = performance.now();
      const startTime = performance.now();

      function checkFrame(now) {
        frames++;
        const delta = now - lastTime;
        lastTime = now;
        if (delta > 0) {
          const instantFps = 1000 / delta;
          if (instantFps < minFps && frames > 5) minFps = instantFps;
        }

        if (window.gokuGame && window.gokuGame.renderer) {
          const info = window.gokuGame.renderer.info;
          totalDrawCalls += info.render.calls;
          totalTriangles += info.render.triangles;
          totalGeometries = info.memory.geometries;
          totalTextures = info.memory.textures;
        }

        if (now - startTime < 3000) {
          requestAnimationFrame(checkFrame);
        } else {
          const dur = (now - startTime) / 1000;
          resolve({
            avgFps: Math.round(frames / dur),
            minFps: Math.round(minFps),
            avgDrawCalls: Math.round(totalDrawCalls / frames),
            avgTriangles: Math.round(totalTriangles / frames),
            geometries: totalGeometries,
            textures: totalTextures
          });
        }
      }
      requestAnimationFrame(checkFrame);
    });
  });

  console.log('OPTIMIZED_METRICS:', JSON.stringify(metrics, null, 2));

  await browser.close();
  await server.close();
}

testAndCapture().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
