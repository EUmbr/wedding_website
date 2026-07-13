// Dev helper: play the connect-the-dots heart and check the countdown.
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

console.log('timer:', JSON.stringify(await page.textContent('#timer')));

// wrong dot first (should be ignored), then dots 1..16 and back to 1
const dots = await page.$$('#heart .heart-dot');
await dots[4].dispatchEvent('pointerdown');
console.log('after wrong tap, lines:', await page.$$eval('.heart-line', (l) => l.length));
for (let i = 0; i < 16; i++) await dots[i].dispatchEvent('pointerdown');
await page.screenshot({ path: 'shots/s8_lines.png' });
await dots[0].dispatchEvent('pointerdown'); // close the loop
console.log('lines:', await page.$$eval('.heart-line', (l) => l.length));
console.log('done:', await page.$eval('#heart', (s) => s.classList.contains('is-done')));
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/s8_done.png' });
await browser.close();
