// One-off: export the orange blob clusters from slide4.png as a transparent
// webp asset (the organic overlapping-circle shapes are impractical to
// rebuild in CSS).
//
// The orange body text is the same color as the circles, so a plain color
// filter captures the glyphs too. Instead of a rectangular cutout (which also
// clips real circles and leaves straight black edges), we flood-fill the
// orange mask into connected components and keep only large ones — circles and
// clusters survive, thin text glyphs are dropped. The orange text is rendered
// live as HTML on top, so it must NOT be baked in here.
// Usage: node scripts/extract-blobs.mjs

import sharp from 'sharp';

const SRC = 'materials/references/slide4.png';
const OUT = 'src/assets/images/location_blobs.webp';
// Component areas split cleanly: text glyphs are all < 2300 px², circles and
// clusters are all > 43000 px². 5000 sits safely in that gap.
const MIN_AREA = 5000;

// The "открыть карту" button is a large orange blob too, but it is rendered
// live as an HTML button, so drop it. No circle overlaps this region.
const BUTTON = [290, 2960, 930, 3130]; // ref px, x76..232 y740..782

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const N = width * height;

const isOrange = (p) => {
  const i = p * channels;
  return Math.abs(data[i] - 0xf5) + Math.abs(data[i + 1] - 0x5b) + Math.abs(data[i + 2] - 0x29) < 150;
};

// label connected components (4-connectivity) and measure their areas
const labels = new Int32Array(N).fill(-1);
const areas = [];
const queue = new Int32Array(N);
for (let start = 0; start < N; start++) {
  if (!isOrange(start) || labels[start] !== -1) continue;
  const id = areas.length;
  let head = 0;
  let tail = 0;
  queue[tail++] = start;
  labels[start] = id;
  let area = 0;
  while (head < tail) {
    const p = queue[head++];
    area++;
    const x = p % width;
    if (x > 0 && isOrange(p - 1) && labels[p - 1] === -1) { labels[p - 1] = id; queue[tail++] = p - 1; }
    if (x < width - 1 && isOrange(p + 1) && labels[p + 1] === -1) { labels[p + 1] = id; queue[tail++] = p + 1; }
    if (p >= width && isOrange(p - width) && labels[p - width] === -1) { labels[p - width] = id; queue[tail++] = p - width; }
    if (p < N - width && isOrange(p + width) && labels[p + width] === -1) { labels[p + width] = id; queue[tail++] = p + width; }
  }
  areas.push(area);
}

const inButton = (p) => {
  const x = p % width;
  const y = (p / width) | 0;
  return x >= BUTTON[0] && x < BUTTON[2] && y >= BUTTON[1] && y < BUTTON[3];
};

const keepPixel = (p) => {
  const id = labels[p];
  return id !== -1 && areas[id] >= MIN_AREA && !inButton(p);
};

const out = Buffer.alloc(N * 4);
let kept = 0;
for (let p = 0; p < N; p++) {
  if (keepPixel(p)) {
    const o = p * 4;
    out[o] = 0xf5;
    out[o + 1] = 0x5b;
    out[o + 2] = 0x29;
    out[o + 3] = 255;
    kept++;
  }
}

// --- complete the circles the reference cuts at the screen edges ----------
// The asset is exported wider than the column (PAD on each side) so desktop
// margins show whole circles instead of vertical cuts. Every circle in the
// design has the SAME radius R (matches the section-3 grid), so each vertical
// run of orange along a side edge is completed with uniform-R circles whose
// centers sit outside the edge: chord c ⇒ center distance d = √(R²−(c/2)²).
// Runs longer than one circle's chord get several evenly spread circles.
const PAD = 240; // ref px = 60 CSS px each side
const R = 232; // uniform circle radius, ref px (58 CSS px)

const edgeCirclesFor = (edgeX, dir) => {
  const circles = [];
  let runStart = -1;
  for (let y = 0; y <= height; y++) {
    const on = y < height && keepPixel(y * width + edgeX);
    if (on && runStart === -1) runStart = y;
    if (!on && runStart !== -1) {
      const c = y - runStart;
      if (c > 40) {
        const k = Math.max(1, Math.round(c / (1.8 * R)));
        const cs = c / k;
        // -20px inward bias: the completion arc overlaps the base pattern a
        // little, hiding seam steps where the true center wasn't exactly
        // outside the edge
        const d = Math.max(0, Math.sqrt(Math.max(0, R * R - (cs / 2) * (cs / 2))) - 20);
        for (let i = 0; i < k; i++) {
          circles.push({ cx: edgeX - dir * d, cy: runStart + cs * (i + 0.5), r: R });
        }
      }
      runStart = -1;
    }
  }
  return circles;
};

const edgeCircles = [...edgeCirclesFor(0, 1), ...edgeCirclesFor(width - 1, -1)];
console.log(
  'edge circles:',
  edgeCircles.map((c) => `(${c.cx | 0},${c.cy | 0}) r${c.r | 0}`).join(' '),
);

const OUT_W = width + PAD * 2;
const scale = 990 / OUT_W; // 2x CSS resolution for the 495 CSS px asset
const circleSvg = edgeCircles
  .map(
    ({ cx, cy, r }) =>
      `<circle cx="${((cx + PAD) * scale).toFixed(1)}" cy="${(cy * scale).toFixed(1)}" r="${(r * scale).toFixed(1)}" fill="#F55B29"/>`,
  )
  .join('');
const outH = Math.round(height * scale);

const base = await sharp(out, { raw: { width, height, channels: 4 } })
  .resize({ width: Math.round(width * scale) })
  .png()
  .toBuffer();

const info2 = await sharp({
  create: { width: 990, height: outH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    { input: Buffer.from(`<svg width="990" height="${outH}">${circleSvg}</svg>`), left: 0, top: 0 },
    { input: base, left: Math.round(PAD * scale), top: 0 },
  ])
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(OUT);
console.log(
  `saved ${OUT} (${info2.width}x${info2.height}, ${(info2.size / 1024).toFixed(0)} KB) — ` +
    `${areas.filter((a) => a >= MIN_AREA).length}/${areas.length} components kept`,
);
