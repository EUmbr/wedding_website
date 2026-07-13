// Dev helper: play the connect-the-dots heart (taps + drag drawing) and
// check the countdown. Usage: node scripts/test-heart.mjs
import { chromium } from 'playwright-core';

const DOTS = [
  [203.5, 130], [177.5, 85], [149.5, 50.5], [95, 26], [38, 62], [44.5, 135.5],
  [61.5, 181], [130.5, 264.5], [198.5, 356], [246.5, 311.5], [287, 231.5],
  [326, 169], [326, 111], [304.5, 50.5], [252.5, 50.5], [221, 85],
];

const url = process.env.SITE_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2000);
await page.click('#splash').catch(() => {});
await page.waitForTimeout(1200);
await page.evaluate(() => document.getElementById('closing').scrollIntoView());
await page.waitForTimeout(4500);

console.log('timer:', JSON.stringify((await page.textContent('#timer')).replace(/\s+/g, ' ')));

const box = await (await page.$('#heart')).boundingBox();
const client = ([x, y]) => [box.x + (x / 375) * box.width, box.y + (y / 410) * box.height];

// wrong dot tap is ignored
const dots = await page.$$('#heart .heart-dot');
await dots[4].dispatchEvent('pointerdown');
console.log('after wrong tap, lines:', await page.$$eval('.heart-line', (l) => l.length));

// tap dot 1, then DRAG through dots 2..8 without lifting
await dots[0].dispatchEvent('pointerdown');
await page.mouse.move(...client(DOTS[0]));
await page.mouse.down();
for (let i = 1; i <= 7; i++) {
  await page.mouse.move(...client(DOTS[i]), { steps: 8 });
}
await page.mouse.up();
console.log('lines after drag 2..8:', await page.$$eval('.heart-line', (l) => l.length));

// tap the rest 9..16 and close the loop on dot 1
for (let i = 8; i < 16; i++) await dots[i].dispatchEvent('pointerdown');
await dots[0].dispatchEvent('pointerdown');
console.log('lines total:', await page.$$eval('.heart-line', (l) => l.length));
console.log('done:', await page.$eval('#heart', (s) => s.classList.contains('is-done')));
await page.waitForTimeout(700);
console.log(
  'win video in DOM:',
  await page.evaluate(() => !!document.querySelector('.heart-win-video')),
  '— playing:',
  await page.evaluate(() => {
    const v = document.querySelector('.heart-win-video');
    return v ? !v.paused : false;
  }),
);
await page.screenshot({ path: 'shots/s8_win.png' });
await page.waitForTimeout(4000);
console.log(
  'video removed after end:',
  await page.evaluate(() => !document.querySelector('.heart-win-video')),
);
await browser.close();
