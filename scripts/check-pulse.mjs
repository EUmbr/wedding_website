// Dev helper: verify the is-next dot pulse animates the radius in place
// (bbox center must not move) and that heart_win.mp3 is decodable.
import { chromium } from 'playwright-core';

const url = process.env.SITE_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.goto(url, { waitUntil: 'load' });
await page.click('#splash').catch(() => {});
await page.waitForTimeout(800);
await page.evaluate(() => document.getElementById('closing').scrollIntoView());
await page.waitForTimeout(2500); // let the smooth scroll finish

const samples = [];
for (let i = 0; i < 6; i++) {
  samples.push(
    await page.$eval('.heart-dot.is-next .heart-point', (c) => {
      const b = c.getBoundingClientRect();
      return {
        r: getComputedStyle(c).r,
        cx: +(b.x + b.width / 2).toFixed(1),
        cy: +(b.y + b.height / 2).toFixed(1),
      };
    }),
  );
  await page.waitForTimeout(160);
}
const rs = new Set(samples.map((s) => s.r));
const centers = new Set(samples.map((s) => `${s.cx},${s.cy}`));
console.log('r values seen:', [...rs].join(' '));
console.log('centers seen:', [...centers].join(' '), centers.size === 1 ? '(stable ✓)' : '(MOVING ✗)');
console.log('r animates:', rs.size > 1);

const mp3 = await page.evaluate(async () => {
  const res = await fetch(new URL('effects/heart_win.mp3', document.baseURI));
  if (!res.ok) return `fetch ${res.status}`;
  const buf = await res.arrayBuffer();
  const ctx = new OfflineAudioContext(2, 1, 44100);
  const audio = await ctx.decodeAudioData(buf);
  return `ok, ${audio.duration.toFixed(1)}s`;
});
console.log('heart_win.mp3 decodes:', mp3);
await browser.close();
