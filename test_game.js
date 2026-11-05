import puppeteer from 'puppeteer-core';

async function runTests() {
  console.log('--- Launching Automated Browser QA Test ---');

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
      console.error('[Browser Console Error]:', msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('[Browser Page Error]:', err.message);
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  console.log('Loaded game page.');

  // 1. Capture Main Menu
  await page.screenshot({ path: 'screenshot_menu.png' });
  console.log('Captured screenshot_menu.png');

  // 2. Test About Modal
  await page.click('#menu-about-btn');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_about.png' });
  console.log('Captured screenshot_about.png');
  await page.click('#about-close-btn');
  await new Promise(r => setTimeout(r, 400));

  // 3. Test How To Play / Tutorial Modal
  await page.click('#menu-tutorial-btn');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot_tutorial.png' });
  console.log('Captured screenshot_tutorial.png');

  // Cycle tutorial steps
  for (let i = 0; i < 6; i++) {
    const nextBtn = await page.$('#tut-next-btn');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 200));
    }
  }
  const finishBtn = await page.$('#tut-finish-btn');
  if (finishBtn) await finishBtn.click();
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshot_tutorial_complete.png' });
  console.log('Captured screenshot_tutorial_complete.png');

  // 4. Start Playing
  await page.click('#tut-start-play-btn');
  console.log('Started Run from Tutorial completion!');
  await new Promise(r => setTimeout(r, 1500));

  // Move right, then left, jump, slide
  await page.keyboard.press('KeyD');
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.press('KeyA');
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.press('KeyW');
  await new Promise(r => setTimeout(r, 600));

  // Capture normal gameplay
  await page.screenshot({ path: 'screenshot_gameplay.png' });
  console.log('Captured screenshot_gameplay.png');

  // 5. Test Super Saiyan mode directly
  await page.evaluate(() => {
    if (window.gokuGame) {
      window.gokuGame.player.transformation.addKi(100);
      window.gokuGame.player.transformation.activateTransformation();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshot_ssj.png' });
  console.log('Captured screenshot_ssj.png');

  // 6. Test Game Over
  await page.evaluate(() => {
    if (window.gokuGame) {
      window.gokuGame.player.powerUps.reset();
      window.gokuGame.player.transformation.reset();
      window.gokuGame.handleGameOver();
    }
  });
  await new Promise(r => setTimeout(r, 1600));
  await page.screenshot({ path: 'screenshot_gameover.png' });
  console.log('Captured screenshot_gameover.png');

  await browser.close();

  console.log('--- QA Test Finished. Total Console Errors:', errors.length, '---');
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
    process.exit(1);
  } else {
    console.log('All QA tests passed with 0 errors!');
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
