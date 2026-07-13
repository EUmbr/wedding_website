// Dev helper: verify the layout never exceeds the viewport width and grab
// section screenshots at a given width. Usage:
//   node scripts/test-width.mjs <width> <height> [outPrefix]
import { chromium } from 'playwright-core';

const [, , w = '412', h = '915', prefix = 'w'] = process.argv;
const url = process.env.SITE_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
});

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2000);
await page.click('#splash').catch(() => {});
await page.waitForTimeout(1500);

const metrics = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  bodyScrollWidth: document.body.scrollWidth,
  zoom: getComputedStyle(document.getElementById('page')).zoom,
}));
console.log(JSON.stringify(metrics));
if (metrics.scrollWidth > metrics.innerWidth) {
  console.log('!!! LAYOUT OVERFLOWS THE VIEWPORT');
} else {
  console.log('layout width OK');
}

// bottom of section 8 (scallops + heart area), section 1, section 6
const zoom = Number(metrics.zoom) || 1;
for (const [name, cssY] of [['s1', 0], ['s6', 4057], ['s8', 6019]]) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), cssY * zoom);
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `shots/${prefix}${w}_${name}.png` });
  console.log(`saved shots/${prefix}${w}_${name}.png`);
}
await browser.close();
