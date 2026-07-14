// Dev helper: verify the native-viewport scaling scheme.
// Phones (any width): the layout must be exactly the 375px canvas, the text
// line wrapping must be IDENTICAL across widths, and the s8 scallop band
// must span the full viewport. Desktop: capped CSS zoom applies.
// Usage: node scripts/check-viewport.mjs
import { chromium } from 'playwright-core';

const url = process.env.SITE_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge' });

async function inspect(w, h, phone) {
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    screen: { width: w, height: h },
    isMobile: phone,
    hasTouch: phone,
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.click('#splash').catch(() => {});
  await page.waitForTimeout(1200);
  const data = await page.evaluate(() => {
    // line-wrap signature: number of rendered line boxes of every <p>
    const wrap = [...document.querySelectorAll('#page p')].map((p) => {
      const range = document.createRange();
      range.selectNodeContents(p);
      const ys = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
      return ys.size;
    });
    const scallops = document.querySelector('.s8__scallops');
    const sb = scallops ? scallops.getBoundingClientRect() : null;
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      zoom: getComputedStyle(document.getElementById('page')).zoom,
      scallops: sb ? `${Math.round(sb.left)}..${Math.round(sb.right)}` : 'n/a',
      wrap: wrap.join(','),
    };
  });
  await page.close();
  return data;
}

let refWrap = null;
let ok = true;
for (const [w, h] of [[320, 690], [375, 812], [393, 852], [412, 915], [430, 932]]) {
  const d = await inspect(w, h, true);
  const wrapSame = refWrap === null || d.wrap === refWrap;
  if (refWrap === null) refWrap = d.wrap;
  const widthOk = d.clientWidth === 375 && d.scrollWidth === 375;
  const scallopsOk = d.scallops === '0..375';
  if (!wrapSame || !widthOk || !scallopsOk) ok = false;
  console.log(
    `phone ${w}x${h}: layout=${d.clientWidth}/${d.scrollWidth} zoom=${d.zoom} ` +
      `scallops=${d.scallops} wrap ${wrapSame ? 'identical' : 'DIFFERS!'} ` +
      (widthOk && scallopsOk && wrapSame ? '✓' : '✗'),
  );
}
for (const [w, h] of [[1280, 800], [1920, 1080]]) {
  const d = await inspect(w, h, false);
  const overflow = d.scrollWidth > d.clientWidth;
  if (overflow) ok = false;
  console.log(`desktop ${w}x${h}: layout=${d.clientWidth}/${d.scrollWidth} zoom=${d.zoom} ${overflow ? '✗ overflow' : '✓'}`);
}
await browser.close();
if (!ok) {
  console.log('!!! CHECK FAILED');
  process.exit(1);
}
console.log('all viewport checks passed');
