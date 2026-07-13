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

const out = Buffer.alloc(N * 4);
let kept = 0;
for (let p = 0; p < N; p++) {
  const id = labels[p];
  if (id !== -1 && areas[id] >= MIN_AREA && !inButton(p)) {
    const o = p * 4;
    out[o] = 0xf5;
    out[o + 1] = 0x5b;
    out[o + 2] = 0x29;
    out[o + 3] = 255;
    kept++;
  }
}

const info2 = await sharp(out, { raw: { width, height, channels: 4 } })
  .resize({ width: 750 }) // 2x CSS resolution is plenty for flat shapes
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(OUT);
console.log(
  `saved ${OUT} (${info2.width}x${info2.height}, ${(info2.size / 1024).toFixed(0)} KB) — ` +
    `${areas.filter((a) => a >= MIN_AREA).length}/${areas.length} components kept`,
);
