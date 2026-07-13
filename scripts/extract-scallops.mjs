// One-off: export the scalloped orange transition band at the top of
// section 8 from slide8.png as a transparent webp (organic overlapping
// arcs + detached circles are impractical to rebuild in CSS).
//
// The band is slide8 rows 178..460 CSS (section-8-local 0..282). The orange
// timer digits poke into the bottom of that band, so small connected
// components are dropped — the scallop mass and circles are huge.
// Usage: node scripts/extract-scallops.mjs

import sharp from 'sharp';

const SRC = 'materials/references/slide8.png';
const OUT = 'src/assets/images/closing_scallops.webp';
const TOP = 178 * 4; // ref px
const HEIGHT = 282 * 4;
const MIN_AREA = 5000; // digit glyphs are ~2000 ref px², circles are ≥ 12k

const { data, info } = await sharp(SRC)
  .extract({ left: 0, top: TOP, width: 1500, height: HEIGHT })
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const N = width * height;

const isOrange = (p) => {
  const i = p * channels;
  return Math.abs(data[i] - 0xf5) + Math.abs(data[i + 1] - 0x5b) + Math.abs(data[i + 2] - 0x29) < 150;
};

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

const out = Buffer.alloc(N * 4);
for (let p = 0; p < N; p++) {
  const id = labels[p];
  if (id !== -1 && areas[id] >= MIN_AREA) {
    const o = p * 4;
    out[o] = 0xf5;
    out[o + 1] = 0x5b;
    out[o + 2] = 0x29;
    out[o + 3] = 255;
  }
}

const info2 = await sharp(out, { raw: { width, height, channels: 4 } })
  .resize({ width: 750 })
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(OUT);
console.log(
  `saved ${OUT} (${info2.width}x${info2.height}, ${(info2.size / 1024).toFixed(0)} KB) — ` +
    `${areas.filter((a) => a >= MIN_AREA).length}/${areas.length} components kept`,
);
