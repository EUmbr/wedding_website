// Dev helper: play the connect-the-dots heart (taps only) and check the
// countdown. Usage: node scripts/test-heart.mjs
import { chromium } from 'playwright-core';

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

// wrong dot tap is ignored
const dots = await page.$$('#heart .heart-dot');
await dots[4].dispatchEvent('pointerdown');
console.log('after wrong tap, lines:', await page.$$eval('.heart-line', (l) => l.length));

// tap dots 1..16 in order, then close the loop on dot 1
for (let i = 0; i < 16; i++) await dots[i].dispatchEvent('pointerdown');
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
