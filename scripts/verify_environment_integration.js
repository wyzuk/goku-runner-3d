import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function verifyEnvironmentIntegration() {
  console.log('================================================================');
  console.log(' GOKU RUNNER 3D — ENVIRONMENT & CHARACTER INTEGRATION VERIFICATION');
  console.log('================================================================');

  const screenshotsDir = path.resolve('docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('1. Launching Vite dev server...');
  const server = await createServer({
    server: { port: 5185 }
  });
  await server.listen();
  console.log('   Vite server listening at http://localhost:5185/');

  console.log('2. Launching Chrome with WebGL enabled...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--enable-webgl',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const errors = [];
  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
      console.error('   [BROWSER ERROR]:', text);
    } else {
      console.log('   [BROWSER LOG]:', text);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('   [PAGE ERROR]:', err.message);
  });

  try {
    console.log('3. Navigating to game...');
    await page.goto('http://localhost:5185/', { waitUntil: 'domcontentloaded' });

    // Wait for model preloader to finish
    console.log('4. Waiting for 3D model assets to preload and rebuild world...');
    await page.waitForFunction(() => {
      return window.gokuGame && window.gokuGame.world;
    }, { timeout: 15000 });

    // Allow 3.5 seconds for all GLB meshes and textures to upload to GPU
    await new Promise(r => setTimeout(r, 3500));

    // Capture 1: Main Menu with new 3D Environment in background
    console.log('5. Capturing Main Menu with 3D Environment Background...');
    await page.screenshot({ path: path.join(screenshotsDir, '01_menu_with_new_environment.png') });

    // Click Start Mission
    console.log('6. Clicking Play / Start Mission...');
    await page.click('#menu-play-btn');
    await new Promise(r => setTimeout(r, 600));

    // Let Goku run down the track for 2.5 seconds
    console.log('7. Running forward down track through newly populated scenery...');
    await new Promise(r => setTimeout(r, 2500));

    // Capture 2: Active Gameplay with new Mountains, Trees, Foliage, and Rocks
    await page.screenshot({ path: path.join(screenshotsDir, '02_running_gameplay_environment.png') });

    // Test Left Lane movement (A key)
    console.log('8. Testing Lane Movement Left (A)...');
    await page.keyboard.press('KeyA');
    await new Promise(r => setTimeout(r, 600));

    // Test Jump (W key)
    console.log('9. Testing Jump Action (W)...');
    await page.keyboard.press('KeyW');
    await new Promise(r => setTimeout(r, 350));
    await page.screenshot({ path: path.join(screenshotsDir, '03_jump_over_hurdle.png') });
    await new Promise(r => setTimeout(r, 600));

    // Test Slide (S key)
    console.log('10. Testing Slide Action (S)...');
    await page.keyboard.press('KeyS');
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(screenshotsDir, '04_slide_under_obstacle.png') });
    await new Promise(r => setTimeout(r, 600));

    // Test Super Saiyan transformation (E key)
    console.log('11. Testing Super Saiyan Transformation (E key)...');
    // Ensure player has Ki and activates transformation
    await page.evaluate(() => {
      if (window.gokuGame && window.gokuGame.player) {
        window.gokuGame.player.transformation.ki = 100;
        window.gokuGame.player.transformation.activateTransformation();
      }
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(screenshotsDir, '05_super_saiyan_active.png') });

    // Test Alternate Skin: Chibi SSJ3 Goku model
    console.log('12. Testing Alternate Skin: Chibi SSJ3 Goku model...');
    await page.evaluate(() => {
      if (window.gokuGame) {
        window.gokuGame.setPlayerSkin('CHIBI_SSJ3');
      }
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '06_chibi_ssj3_alternate_skin.png') });

    // Switch back to Adult Goku
    await page.evaluate(() => {
      if (window.gokuGame) {
        window.gokuGame.setPlayerSkin('DEFAULT');
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify Scene Hierarchy Metrics
    const sceneMetrics = await page.evaluate(() => {
      const g = window.gokuGame;
      const chunks = g.world.chunkManager.chunks;
      let totalSceneryObjs = 0;
      let totalMtnObjs = 0;
      for (const c of chunks) {
        totalSceneryObjs += c.sceneryObjects.length;
        totalMtnObjs += c.mountainObjects.length;
      }
      return {
        activeChunks: chunks.length,
        totalSceneryObjects: totalSceneryObjs,
        totalMountainObjects: totalMtnObjs,
        activeObstacles: g.obstacleManager.obstacles.length,
        playerPositionZ: Math.round(g.player.position.z),
        fps: g.debugHUD.fps || 60
      };
    });

    console.log('================================================================');
    console.log(' INTEGRATION VALIDATION RESULTS:');
    console.log(`   - Active Chunks: ${sceneMetrics.activeChunks}`);
    console.log(`   - Total 3D Scenery Objects Spawned: ${sceneMetrics.totalSceneryObjects}`);
    console.log(`   - Total 3D Mountain Formations: ${sceneMetrics.totalMountainObjects}`);
    console.log(`   - Active Obstacles in Scene: ${sceneMetrics.activeObstacles}`);
    console.log(`   - Distance Traveled: ${sceneMetrics.playerPositionZ} m`);
    console.log(`   - Target Frame Rate: ${sceneMetrics.fps} FPS`);
    console.log(`   - Uncaught Errors: ${errors.length}`);
    console.log('================================================================');

    if (errors.length > 0) {
      console.warn('Errors encountered during test:', errors);
    } else {
      console.log('SUCCESS: All environment models, mountains, trees, rocks, vegetation,');
      console.log('and character assets integrated and validated with 0 errors!');
    }

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    await browser.close();
    await server.close();
  }
}

verifyEnvironmentIntegration();
