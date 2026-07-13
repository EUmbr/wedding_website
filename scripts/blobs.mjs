// Dev helper: find connected components ("blobs") of a token color in a
// reference image. Prints each blob's bbox in CSS px and whether it looks
// like a circle (fill ratio ≈ π/4 ≈ 0.79). Useful for the scattered circles.
// Usage: node scripts/blobs.mjs <image.png> <beige|orange|muted|black> [scale]

import sharp from 'sharp';

const [, , refPath, token, scaleArg] = process.argv;
const SCALE = Number(scaleArg) || 4;

const { data, info } = await sharp(refPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const TOKENS = {
  beige: [0xf1, 0xe5, 0xcf],
  orange: [0xf5, 0x5b, 0x29],
  muted: [0xc7, 0xbe, 0xad],
  black: [0, 0, 0],
};

const [tr, tg, tb] = TOKENS[token];
const mask = new Uint8Array(width * height);
for (let i = 0, p = 0; p < width * height; p++, i += channels) {
  if (Math.abs(data[i] - tr) + Math.abs(data[i + 1] - tg) + Math.abs(data[i + 2] - tb) < 90) {
    mask[p] = 1;
  }
}

// iterative flood fill (BFS) over 4-connectivity
const labels = new Int32Array(width * height).fill(-1);
const blobs = [];
const queue = new Int32Array(width * height);

for (let start = 0; start < width * height; start++) {
  if (!mask[start] || labels[start] !== -1) continue;
  const id = blobs.length;
  let head = 0;
  let tail = 0;
  queue[tail++] = start;
  labels[start] = id;
  let n = 0;
  let x0 = width;
  let x1 = -1;
  let y0 = height;
  let y1 = -1;
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p / width) | 0;
    n++;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    if (x > 0 && mask[p - 1] && labels[p - 1] === -1) { labels[p - 1] = id; queue[tail++] = p - 1; }
    if (x < width - 1 && mask[p + 1] && labels[p + 1] === -1) { labels[p + 1] = id; queue[tail++] = p + 1; }
    if (y > 0 && mask[p - width] && labels[p - width] === -1) { labels[p - width] = id; queue[tail++] = p - width; }
    if (y < height - 1 && mask[p + width] && labels[p + width] === -1) { labels[p + width] = id; queue[tail++] = p + width; }
  }
  blobs.push({ n, x0, x1, y0, y1 });
}

const css = (v) => Math.round(v / SCALE);
blobs
  .filter((b) => b.n > 64) // skip specks
  .sort((a, b) => a.y0 - b.y0)
  .forEach((b) => {
    const w = b.x1 - b.x0 + 1;
    const h = b.y1 - b.y0 + 1;
    const fill = b.n / (w * h);
    const shape = fill > 0.72 && Math.abs(w - h) / Math.max(w, h) < 0.12 ? 'CIRCLE' : fill > 0.72 ? 'round' : 'blob';
    console.log(
      `y ${css(b.y0)}..${css(b.y1)} x ${css(b.x0)}..${css(b.x1)}  (${css(w)}x${css(h)})  fill ${fill.toFixed(2)} ${shape}`,
    );
  });
