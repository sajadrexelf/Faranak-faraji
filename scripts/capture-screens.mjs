import { chromium } from 'playwright';
import fs from 'node:fs';

async function capture() {
  if (!fs.existsSync('.playwright-cli')) {
    fs.mkdirSync('.playwright-cli', { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Desktop
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '.playwright-cli/desktop_hero.png' });

  // Scroll to stage 1 (Chest)
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: '.playwright-cli/desktop_chest.png' });

  // Scroll to Sights Slider (Stage 4)
  await page.evaluate(() => window.scrollTo(0, 4600));
  await page.waitForTimeout(600);
  await page.screenshot({ path: '.playwright-cli/desktop_sights.png' });

  // Mobile
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: '.playwright-cli/mobile_hero.png' });

  await browser.close();
  console.log('[Screenshots] Captured successfully.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
