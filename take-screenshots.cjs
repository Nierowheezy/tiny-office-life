const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Create screenshots directory
  const screenshotsDir = '/Users/Olaniyi/Documents/Dev/Codes/Personal/tiny-office-life/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Navigate to the app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for PixiJS to initialize and render
  await page.waitForTimeout(3000);
  
  // Screenshot 1: Full office view
  await page.screenshot({ path: path.join(screenshotsDir, 'office-view.png'), fullPage: false });
  console.log('✓ office-view.png');
  
  // Click on a character (Alex) to open panel
  await page.click('canvas', { position: { x: 400, y: 350 } });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'character-panel.png'), fullPage: false });
  console.log('✓ character-panel.png');
  
  // Close character panel - click empty space
  await page.click('canvas', { position: { x: 100, y: 100 } });
  await page.waitForTimeout(300);
  
  // Click coffee machine
  await page.click('canvas', { position: { x: 200, y: 200 } });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'furniture-panel.png'), fullPage: false });
  console.log('✓ furniture-panel.png');
  
  // Close furniture panel
  await page.click('canvas', { position: { x: 100, y: 100 } });
  await page.waitForTimeout(300);
  
  // Open About panel (press H)
  await page.keyboard.press('H');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'about-panel.png'), fullPage: false });
  console.log('✓ about-panel.png');
  
  // Close About panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  
  // Rotate camera (press E)
  await page.keyboard.press('E');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'rotated-view.png'), fullPage: false });
  console.log('✓ rotated-view.png');
  
  // Zoom in
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'zoomed-view.png'), fullPage: false });
  console.log('✓ zoomed-view.png');
  
  // Reset view (press R)
  await page.keyboard.press('R');
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: path.join(screenshotsDir, 'evening-lighting.png'), fullPage: false });
  console.log('✓ evening-lighting.png');
  
  await browser.close();
  console.log('All screenshots saved to', screenshotsDir);
}

takeScreenshots().catch(console.error);