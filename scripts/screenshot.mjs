// Dev helper: take a screenshot of the local site with Edge (Chromium).
// Usage: node scripts/screenshot.mjs <out.png> [mode] [width] [height]
//   mode: "splash"   — capture the splash screen (viewport only)
//         "full"     — dismiss splash, capture the whole page (default)
//         "viewport" — dismiss splash, capture one viewport
//         "y=<px>"   — dismiss splash, scroll to page y, capture one viewport
// Optionally set URL via SITE_URL env var (default http://localhost:5173).

import { chromium } from 'playwright-core';

const [, , out = 'shot.png', mode = 'full', width = '375', height = '812'] = process.argv;
const url = process.env.SITE_URL || 'http://localhost:5173';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: 2,
});

// 'load' + settle delay instead of networkidle: the Yandex map iframe keeps
// making requests forever, so networkidle never fires
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2500);

if (mode !== 'splash') {
  await page.click('#splash', { timeout: 3000 }).catch(() => {});
  // wait out the splash fade + reveal animations
  await page.waitForTimeout(1600);
}

if (mode.startsWith('y=')) {
  const y = Number(mode.slice(2));
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  // let reveal animations in this screen finish
  await page.waitForTimeout(2200);
}

await page.screenshot({ path: out, fullPage: mode === 'full' });
await browser.close();
console.log(`saved ${out} (${mode}, ${width}x${height})`);
