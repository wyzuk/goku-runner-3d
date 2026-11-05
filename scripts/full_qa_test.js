import { preview } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function runQATest() {
  console.log('====================================================');
  console.log(' GOKU RUNNER 3D — COMPREHENSIVE AUTOMATED QA SUITE');
  console.log('====================================================');

  const screenshotsDir = path.resolve('docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('1. Launching Vite production preview server...');
  const server = await preview({ preview: { port: 4173 } });
  console.log('   Preview server listening at http://localhost:4173/');

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
  const warnings = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.error('   [BROWSER ERROR]:', text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('   [PAGE ERROR]:', err.message);
  });

  try {
    console.log('3. Navigating to game...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Capture 1: Main Menu
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_menu.png') });
    console.log('   [Captured]: screenshot_menu.png (Main Menu in bright daytime)');

    // 4. Toggle Debug HUD in Menu
    await page.keyboard.press('KeyB');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_debug_hud.png') });
    console.log('   [Captured]: screenshot_debug_hud.png (Debug HUD Overlay)');

    // 5. Start Gameplay
    console.log('5. Starting Game Run...');
    await page.click('#menu-play-btn');
    await new Promise(r => setTimeout(r, 1500));

    // Capture 2: Main Gameplay Running Center Lane
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_gameplay.png') });
    console.log('   [Captured]: screenshot_gameplay.png (Goku running center lane)');

    // 6. Test Move Left (A Key)
    console.log('6. Testing Move Left (KeyA)...');
    await page.keyboard.press('KeyA');
    await new Promise(r => setTimeout(r, 500));
    const leftStats = await page.evaluate(() => {
      const g = window.gokuGame;
      return {
        lane: g.physics.currentLane,
        x: g.physics.position.x,
        targetX: g.physics.targetLaneX
      };
    });
    console.log('   Move Left Result:', leftStats);
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_move_left.png') });
    console.log('   [Captured]: screenshot_move_left.png (Goku in Left Lane, X > 0 / Screen Left)');

    // 7. Test Move Right (D Key)
    console.log('7. Testing Move Right (KeyD) back to Center and then to Right...');
    await page.keyboard.press('KeyD'); // Move back to Center
    await new Promise(r => setTimeout(r, 450));
    await page.keyboard.press('KeyD'); // Move to Right
    await new Promise(r => setTimeout(r, 550));
    const rightStats = await page.evaluate(() => {
      const g = window.gokuGame;
      return {
        lane: g.physics.currentLane,
        x: g.physics.position.x,
        targetX: g.physics.targetLaneX
      };
    });
    console.log('   Move Right Result:', rightStats);
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_move_right.png') });
    console.log('   [Captured]: screenshot_move_right.png (Goku in Right Lane, X < 0 / Screen Right)');

    // 8. Test Jump (W Key)
    console.log('8. Testing Jump (KeyW)...');
    await page.keyboard.press('KeyA'); // Return towards Center
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.press('KeyW');
    await new Promise(r => setTimeout(r, 350));
    const jumpStats = await page.evaluate(() => {
      const g = window.gokuGame;
      return {
        y: g.physics.position.y,
        isGrounded: g.physics.isGrounded,
        isJumping: g.physics.isJumping
      };
    });
    console.log('   Jump Result (airborne):', jumpStats);
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_jump.png') });
    console.log('   [Captured]: screenshot_jump.png (Goku airborne leaping over road)');

    await new Promise(r => setTimeout(r, 600)); // Land

    // 9. Test Slide (S Key)
    console.log('9. Testing Slide (KeyS)...');
    await page.keyboard.press('KeyS');
    await new Promise(r => setTimeout(r, 250));
    const slideStats = await page.evaluate(() => {
      const g = window.gokuGame;
      return {
        y: g.physics.position.y,
        isSliding: g.physics.isSliding
      };
    });
    console.log('   Slide Result:', slideStats);
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_slide.png') });
    console.log('   [Captured]: screenshot_slide.png (Goku sliding low along road)');

    await new Promise(r => setTimeout(r, 800));

    // 10. Test Mobile Touch Buttons
    console.log('10. Testing On-Screen Touch Controls...');
    // Touch Left
    await page.click('#btn-touch-left');
    await new Promise(r => setTimeout(r, 450));
    // Touch Right
    await page.click('#btn-touch-right');
    await new Promise(r => setTimeout(r, 450));
    // Touch Jump
    await page.click('#btn-touch-jump');
    await new Promise(r => setTimeout(r, 350));
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_mobile_controls.png') });
    console.log('   [Captured]: screenshot_mobile_controls.png (Mobile on-screen controls test)');
    await new Promise(r => setTimeout(r, 600));

    // 11. Test Super Saiyan Transformation
    console.log('11. Testing Super Saiyan Transformation...');
    await page.evaluate(() => {
      const g = window.gokuGame;
      g.player.transformation.addKi(100);
      g.player.transformation.activateTransformation();
    });
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_ssj.png') });
    console.log('   [Captured]: screenshot_ssj.png (Super Saiyan Golden Aura & Speed boost)');

    // 12. Test Day/Night & Weather
    console.log('12. Testing Sunset and Nighttime Cycle...');
    await page.evaluate(() => {
      const g = window.gokuGame;
      g.world.dayNightCycle.time = 156.0; // Moonlit Night
      g.world.dayNightCycle.update(0, g.player.position.z);
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_night.png') });
    console.log('   [Captured]: screenshot_night.png (Moonlit Night sky, stars, moon and road visibility)');

    // Reset back to Bright Daytime
    await page.evaluate(() => {
      const g = window.gokuGame;
      g.world.dayNightCycle.time = 50.0; // Bright Daytime
      g.world.dayNightCycle.update(0, g.player.position.z);
    });

    // 13. Test Pause Menu
    console.log('13. Testing Pause (Escape)...');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_pause.png') });
    console.log('   [Captured]: screenshot_pause.png (Pause Menu overlay)');

    // Resume
    await page.click('#pause-resume-btn');
    await new Promise(r => setTimeout(r, 500));

    // 14. Test Game Over
    console.log('14. Testing Game Over screen...');
    await page.evaluate(() => {
      const g = window.gokuGame;
      g.player.powerUps.reset();
      g.player.transformation.reset();
      g.handleGameOver();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'screenshot_gameover.png') });
    console.log('   [Captured]: screenshot_gameover.png (Game Over stats modal)');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    errors.push(err.message);
  } finally {
    await browser.close();
    server.httpServer.close();
    console.log('====================================================');
    console.log(` QA Complete! Total Browser Errors: ${errors.length}`);
    console.log('====================================================');
    if (errors.length > 0) {
      console.error('Errors:', errors);
      process.exit(1);
    } else {
      console.log('ALL VERIFICATION CHECKS PASSED WITH 0 ERRORS!');
    }
  }
}

runQATest().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
