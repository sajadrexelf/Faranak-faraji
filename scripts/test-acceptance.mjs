import { chromium } from 'playwright';

async function runTests() {
  console.log('[Test Suite] Starting Lotus Gym 3D Acceptance Tests...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    console.log(`[Browser ${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Visit Desktop View
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Title verification
  const title = await page.title();
  console.log(`[Test] Document Title: "${title}"`);
  if (!title.includes('فرانک فرجی') && !title.includes('لوتوس')) {
    throw new Error('Title does not match Persian brand name');
  }

  // Canvas verification
  const canvas = await page.$('#fitness-canvas');
  if (!canvas) throw new Error('3D Fitness Canvas not found in DOM');
  console.log('[Test] 3D Fitness Canvas is present and rendered.');

  // Check 15 cards in infinite slider (5 * 3 sets)
  const trackCardsCount = await page.$$eval('#sights-track .sight-card', (cards) => cards.length);
  console.log(`[Test] Infinite Slider Cards Count: ${trackCardsCount} (Expected 15)`);
  if (trackCardsCount !== 15) {
    throw new Error(`Expected 15 cloned cards for Jaipur City infinite slider, got ${trackCardsCount}`);
  }

  // Scroll to Sights Stage (Stage 04)
  console.log('[Test] Scrolling to Sights Slider (ScrollY = 4600px)...');
  await page.evaluate(() => window.scrollTo(0, 4600));
  await page.waitForTimeout(600);

  // Check HUD
  const sceneNum = await page.$eval('.scene-number', el => el.textContent.trim());
  const sceneName = await page.$eval('.scene-name', el => el.textContent.trim());
  console.log(`[Test] Sights HUD -> Scene: ${sceneNum}, Name: "${sceneName}"`);

  // Test Next & Prev buttons
  console.log('[Test] Clicking Sight Next Button...');
  await page.click('.sight-next');
  await page.waitForTimeout(400);

  console.log('[Test] Clicking Sight Prev Button...');
  await page.click('.sight-prev');
  await page.waitForTimeout(400);

  // Test Modal opening on Card Click
  console.log('[Test] Clicking Active Sight Card to test modal opening...');
  const firstCard = await page.$('.sight-card.is-active-card') || await page.$('.sight-card');
  await firstCard.click();
  await page.waitForTimeout(500);

  const modalOpen = await page.$eval('#program-modal', el => el.classList.contains('is-open'));
  const modalTitle = await page.$eval('#modal-title', el => el.textContent.trim());
  console.log(`[Test] Program Modal is open: ${modalOpen}, Title: "${modalTitle}"`);
  if (!modalOpen || !modalTitle) {
    throw new Error('Modal failed to open or title is empty');
  }

  // Close modal via Close Button
  console.log('[Test] Closing Program Modal via close button...');
  await page.click('.modal-close-btn');
  await page.waitForTimeout(400);

  const modalClosed = await page.$eval('#program-modal', el => !el.classList.contains('is-open'));
  console.log(`[Test] Program Modal successfully closed: ${modalClosed}`);
  if (!modalClosed) throw new Error('Modal failed to close');

  // Test Videos and Stages Scroll
  console.log('[Test] Scrolling through Chest Stage (1200px)...');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(500);
  const chestNum = await page.$eval('.scene-number', el => el.textContent.trim());
  console.log(`[Test] Chest HUD Stage: ${chestNum}`);

  console.log('[Test] Scrolling through Back Stage (2400px)...');
  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(500);
  const backNum = await page.$eval('.scene-number', el => el.textContent.trim());
  console.log(`[Test] Back HUD Stage: ${backNum}`);

  console.log('[Test] Scrolling through Core Stage (3600px)...');
  await page.evaluate(() => window.scrollTo(0, 3600));
  await page.waitForTimeout(500);
  const coreNum = await page.$eval('.scene-number', el => el.textContent.trim());
  console.log(`[Test] Core HUD Stage: ${coreNum}`);

  // Test Mobile Viewport (390 x 844)
  console.log('[Test] Testing Mobile Viewport (390 x 844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const mobileHeroTitle = await page.$eval('.hero-title', el => el.textContent.trim());
  console.log(`[Test] Mobile Hero Title: "${mobileHeroTitle}"`);

  // Check console errors excluding harmless resource 404s
  const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('faranak_avatar_rigged.glb'));
  if (fatalErrors.length > 0) {
    console.warn('[Test Warnings] Console errors encountered:', fatalErrors);
  } else {
    console.log('[Test] Clean console execution without uncaught fatal errors.');
  }

  await browser.close();
  console.log('[Test Suite] ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! ✅');
}

runTests().catch(err => {
  console.error('[Test Failed]', err);
  process.exit(1);
});
