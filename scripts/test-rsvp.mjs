// Dev helper: end-to-end test of the RSVP form UI.
// NOTE: a successful run submits ONE real test row to the owner's Google Form
// (marked "тест сайта — эту строку можно удалить").
// Usage: node scripts/test-rsvp.mjs   (SITE_URL env var overrides the URL)

import { chromium } from 'playwright-core';

const url = process.env.SITE_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });

page.on('response', (r) => {
  if (r.url().includes('formResponse')) console.log('POST formResponse:', r.status());
});

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2000);
await page.click('#splash').catch(() => {});
await page.waitForTimeout(1200);
await page.evaluate(() => window.scrollTo({ top: 5300, behavior: 'instant' }));
await page.waitForTimeout(4500);

// 1) empty submit -> validation message
await page.evaluate(() => document.getElementById('rsvp').requestSubmit());
await page.waitForTimeout(300);
console.log('empty submit status:', JSON.stringify(await page.textContent('#rsvp-status')));

// 2) radio exclusivity: нет then да
await page.click('.s7__yn--no');
await page.click('.s7__yn--yes');
console.log(
  'attendance radios:',
  JSON.stringify(
    await page.evaluate(() =>
      [...document.querySelectorAll('input[name="entry.100062412"]')].map((i) => [i.value, i.checked]),
    ),
  ),
);

// 3) checkboxes: check two, toggle one off
await page.click('.s7__opt--champagne');
await page.click('.s7__opt--vodka');
await page.click('.s7__opt--vodka');
await page.click('.s7__opt--soft');
console.log(
  'drinks checked:',
  JSON.stringify(
    await page.evaluate(() =>
      [...document.querySelectorAll('input[name="entry.1865058381"]:checked')].map((i) => i.value),
    ),
  ),
);

// 4) fill the rest and submit for real
await page.fill('#rsvp-name', 'тест сайта — эту строку можно удалить');
await page.click('.s7__opt--fish');
await page.click('.s7__submit');
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(1000);
  const msg = await page.textContent('#rsvp-status');
  if (msg !== 'отправляем...') {
    console.log(`status after ${i + 1}s:`, JSON.stringify(msg));
    break;
  }
  if (i === 19) console.log('still pending after 20s');
}
console.log('button hidden:', await page.evaluate(() => document.querySelector('.s7__submit').hidden));
await page.screenshot({ path: 'shots/s7_sent.png' });
await browser.close();
