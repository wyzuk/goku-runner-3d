import puppeteer from 'puppeteer-core';

async function testModals() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Open Profile
  await page.click('#menu-profile-btn');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshot_profile.png' });
  console.log('Captured screenshot_profile.png');
  await page.click('#profile-close-btn');
  await new Promise(r => setTimeout(r, 400));

  // Open Settings
  await page.click('#menu-settings-btn');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshot_settings.png' });
  console.log('Captured screenshot_settings.png');

  await browser.close();
  console.log('Modals test done.');
}

testModals();
