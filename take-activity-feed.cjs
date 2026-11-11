const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const screenshotsDir = '/Users/Olaniyi/Documents/Dev/Codes/Personal/tiny-office-life/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // The activity feed is on the right side, let's capture it by taking a full page screenshot
  // and cropping, or just capture the whole view which includes it
  await page.screenshot({ path: path.join(screenshotsDir, 'activity-feed.png'), fullPage: false });
  console.log('✓ activity-feed.png');
  
  await browser.close();
}

takeScreenshot().catch(console.error);