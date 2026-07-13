// Dev helper: extract precise element geometry from a reference screenshot.
// Classifies pixels by design-token color and prints vertical runs (bands)
// with column extents, in CSS px (reference is 4x: 1500px wide = 375 CSS px).
// Usage: node scripts/analyze-reference.mjs <image.png> [class] [scale] [rowsY0 rowsY1] [bg]
//   class: beige|orange|muted|black|other (default: all)
//   scale: px per CSS px in the image (default 4 for references; use 2 for
//          deviceScaleFactor-2 Playwright screenshots)
//   rowsY0 rowsY1: optional CSS y-range — prints per-CSS-row column extents
//                  instead of merged bands (for decomposing overlapping text)
//   bg: which token color is the background to ignore (default black;
//       pass "orange" for orange sections, "beige" for beige ones)

import sharp from 'sharp';

const [, , refPath, only, scaleArg, rowsY0, rowsY1, bgArg] = process.argv;
const SCALE = Number(scaleArg) || 4;
const BG = bgArg || 'black';

const { data, info } = await sharp(refPath)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

const TOKENS = {
  beige: [0xf1, 0xe5, 0xcf],
  orange: [0xf5, 0x5b, 0x29],
  muted: [0xc7, 0xbe, 0xad],
};

function classify(r, g, b) {
  for (const [name, [tr, tg, tb]] of Object.entries(TOKENS)) {
    if (Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb) < 90) return name;
  }
  if (r + g + b < 90) return 'black';
  return 'other'; // photos etc.
}

// per-row pixel counts and column extents for each class (minus the background)
const classes = ['beige', 'orange', 'muted', 'black', 'other'].filter((c) => c !== BG);
const rows = {};
for (const c of classes) rows[c] = [];

for (let y = 0; y < height; y++) {
  const counts = { beige: 0, orange: 0, muted: 0, black: 0, other: 0 };
  const min = { beige: width, orange: width, muted: width, black: width, other: width };
  const max = { beige: -1, orange: -1, muted: -1, black: -1, other: -1 };
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const c = classify(data[i], data[i + 1], data[i + 2]);
    if (c === BG) continue;
    counts[c]++;
    if (x < min[c]) min[c] = x;
    if (x > max[c]) max[c] = x;
  }
  for (const c of classes) {
    rows[c].push({ n: counts[c], min: min[c], max: max[c] });
  }
}

// per-row dump mode: aggregate each CSS row, print column extents
// (pass "-" for rowsY0/rowsY1 to skip row mode, e.g. when only setting bg)
if (rowsY0 !== undefined && rowsY0 !== '-') {
  const c = only;
  const y0 = Number(rowsY0);
  const y1 = Number(rowsY1);
  console.log(`=== ${c} per-row extents, CSS y ${y0}..${y1} ===`);
  for (let cy = y0; cy <= y1; cy++) {
    let n = 0;
    let min = width;
    let max = -1;
    for (let y = cy * SCALE; y < (cy + 1) * SCALE && y < height; y++) {
      const r = rows[c][y];
      if (r.n === 0) continue;
      n += r.n;
      if (r.min < min) min = r.min;
      if (r.max > max) max = r.max;
    }
    if (n > SCALE * 2) {
      console.log(`y ${cy}  x ${Math.round(min / SCALE)}..${Math.round(max / SCALE)}  n ${n}`);
    }
  }
  process.exit(0);
}

// merge consecutive rows with enough pixels into bands
const MIN_PIXELS = 8;
const MAX_GAP = 6; // rows

for (const c of classes) {
  if (only && c !== only) continue;
  console.log(`\n=== ${c} bands (CSS px = image/${SCALE}) ===`);
  let band = null;
  let gap = 0;
  const flush = () => {
    if (!band) return;
    const css = (v) => Math.round(v / SCALE);
    console.log(
      `y ${css(band.y0)}..${css(band.y1)} (h ${css(band.y1 - band.y0)})  x ${css(band.x0)}..${css(band.x1)} (w ${css(band.x1 - band.x0)})`,
    );
    band = null;
  };
  for (let y = 0; y < height; y++) {
    const r = rows[c][y];
    if (r.n >= MIN_PIXELS) {
      gap = 0;
      if (!band) band = { y0: y, y1: y, x0: r.min, x1: r.max };
      band.y1 = y;
      if (r.min < band.x0) band.x0 = r.min;
      if (r.max > band.x1) band.x1 = r.max;
    } else if (band && ++gap > MAX_GAP) {
      flush();
    }
  }
  flush();
}
