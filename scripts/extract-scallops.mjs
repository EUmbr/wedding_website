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

// bboxes, to find small detached circles touching the band's side edges —
// mirror-tiling those would create lens-shaped artifacts at tile joins
const minX = new Int32Array(areas.length).fill(width);
const maxX = new Int32Array(areas.length).fill(-1);
for (let p = 0; p < N; p++) {
  const id = labels[p];
  if (id === -1) continue;
  const x = p % width;
  if (x < minX[id]) minX[id] = x;
  if (x > maxX[id]) maxX[id] = x;
}
const touchesEdge = (id) =>
  areas[id] < 200000 && (minX[id] === 0 || maxX[id] === width - 1);

const paint = (keepEdge) => {
  const buf = Buffer.alloc(N * 4);
  for (let p = 0; p < N; p++) {
    const id = labels[p];
    if (id !== -1 && areas[id] >= MIN_AREA && (keepEdge || !touchesEdge(id))) {
      const o = p * 4;
      buf[o] = 0xf5;
      buf[o + 1] = 0x5b;
      buf[o + 2] = 0x29;
      buf[o + 3] = 255;
    }
  }
  return buf;
};

// All tiles are painted WITHOUT the small circles touching the band's side
// edges; those are re-added afterwards as full circles spanning tile joins
// (in the reference they are full circles whose centers sit near the screen
// edge — mirror-tiling their slivers would create lens artifacts).
const outSide = paint(false);

const edgeCircles = [];
for (let id = 0; id < areas.length; id++) {
  if (areas[id] < MIN_AREA || !touchesEdge(id)) continue;
  let minY = height;
  let maxY = -1;
  for (let p = 0; p < N; p++) {
    if (labels[p] === id) {
      const y = (p / width) | 0;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const r = (maxY - minY + 1) / 2;
  const cy = (minY + maxY + 1) / 2;
  // center x from the visible sliver: circle sticks out past the touched edge
  const cx = minX[id] === 0 ? maxX[id] + 1 - r : minX[id] + r;
  edgeCircles.push({ cx, cy, r });
}

// Tile the 375px band sideways with mirrored copies (7 tiles = 2625 CSS px)
// so the scallop edge continues across wide desktop viewports. Mirroring
// keeps the pattern continuous at every join.
const sideBand = await sharp(outSide, { raw: { width, height, channels: 4 } })
  .resize({ width: 750 })
  .png()
  .toBuffer();
const sideFlipped = await sharp(sideBand).flop().png().toBuffer();

const TILES = 7;
const CENTER = 3;
const composites = [];
for (let t = 0; t < TILES; t++) {
  composites.push({ input: t % 2 === 1 ? sideBand : sideFlipped, left: t * 750, top: 0 });
}

// the reference edge circles, drawn whole across the center tile's joins
// (output scale: 750 tile px for 1500 source px = 0.5)
const bandH = Math.round((height / width) * 750);
const circleSvg = edgeCircles
  .map(({ cx, cy, r }) => {
    const x = (CENTER * 750 + cx * 0.5).toFixed(1);
    return `<circle cx="${x}" cy="${(cy * 0.5).toFixed(1)}" r="${(r * 0.5).toFixed(1)}" fill="#F55B29"/>`;
  })
  .join('');
composites.push({
  input: Buffer.from(`<svg width="${750 * TILES}" height="${bandH}">${circleSvg}</svg>`),
  left: 0,
  top: 0,
});

const info2 = await sharp({
  create: { width: 750 * TILES, height: bandH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(OUT);
console.log(
  `saved ${OUT} (${info2.width}x${info2.height}, ${(info2.size / 1024).toFixed(0)} KB) — ` +
    `${areas.filter((a) => a >= MIN_AREA).length}/${areas.length} components kept`,
);
