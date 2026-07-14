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
// margins show whole circles instead of vertical cuts. A circle cut by an
// edge sticks out at most 2R beyond it, so PAD = 2R covers every case.
//
// Each cut circle is reconstructed by FITTING a circle to its visible arc:
// from both endpoints of every vertical run of orange along a side edge, the
// mask boundary is walked inward and a least-squares circle (free center AND
// radius) is fitted to the walked arc — the drawn completion then continues
// the existing arc seamlessly (the old fixed-radius chord heuristic produced
// visibly crooked, lumpy completions). Runs the fits fail to cover fall back
// to the chord estimate with the design's grid radius.
const R = 232; // the design's grid circle radius, ref px (58 CSS px)
const PAD = 2 * R + 16; // 480 ref px = 120 CSS px each side

// boundary = mask pixel with an empty 4-neighbor INSIDE the image (pixels
// hugging the image edge don't count, so arc walks never run along the edge)
const boundary = new Uint8Array(N);
for (let p = 0; p < N; p++) {
  if (!keepPixel(p)) continue;
  const x = p % width;
  const y = (p / width) | 0;
  if (
    (x > 0 && !keepPixel(p - 1)) ||
    (x < width - 1 && !keepPixel(p + 1)) ||
    (y > 0 && !keepPixel(p - width)) ||
    (y < height - 1 && !keepPixel(p + width))
  ) {
    boundary[p] = 1;
  }
}

const NB8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// walk the boundary chain starting near (sx, sy), up to maxPts points
const walkArc = (sx, sy, maxPts) => {
  let start = -1;
  outer: for (let r = 0; r <= 8 && start === -1; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = sx + dx;
        const y = sy + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (boundary[y * width + x]) {
          start = y * width + x;
          break outer;
        }
      }
    }
  }
  if (start === -1) return [];
  const pts = [];
  const seen = new Set([start]);
  let cur = start;
  while (pts.length < maxPts) {
    pts.push([cur % width, (cur / width) | 0]);
    const x = cur % width;
    const y = (cur / width) | 0;
    let nxt = -1;
    for (const [dx, dy] of NB8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const np = ny * width + nx;
      if (boundary[np] && !seen.has(np)) {
        nxt = np;
        break;
      }
    }
    if (nxt === -1) break;
    seen.add(nxt);
    cur = nxt;
  }
  return pts;
};

// Kasa least-squares circle fit; returns { cx, cy, r, rms }
const fitCircle = (pts) => {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
  for (const [x, y] of pts) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
    sxz += x * z; syz += y * z; sz += z;
  }
  const n = pts.length;
  // solve [sxx sxy sx; sxy syy sy; sx sy n] * [D E F]ᵀ = [sxz syz sz]ᵀ (·-1)
  const A = [
    [sxx, sxy, sx, sxz],
    [sxy, syy, sy, syz],
    [sx, sy, n, sz],
  ];
  for (let i = 0; i < 3; i++) {
    let piv = i;
    for (let j = i + 1; j < 3; j++) if (Math.abs(A[j][i]) > Math.abs(A[piv][i])) piv = j;
    [A[i], A[piv]] = [A[piv], A[i]];
    if (Math.abs(A[i][i]) < 1e-9) return null;
    for (let j = i + 1; j < 3; j++) {
      const f = A[j][i] / A[i][i];
      for (let k = i; k < 4; k++) A[j][k] -= f * A[i][k];
    }
  }
  const c = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    c[i] = A[i][3];
    for (let k = i + 1; k < 3; k++) c[i] -= A[i][k] * c[k];
    c[i] /= A[i][i];
  }
  const cx = c[0] / 2;
  const cy = c[1] / 2;
  const r = Math.sqrt(cx * cx + cy * cy + c[2]);
  if (!Number.isFinite(r)) return null;
  let rss = 0;
  for (const [x, y] of pts) {
    const d = Math.hypot(x - cx, y - cy) - r;
    rss += d * d;
  }
  return { cx, cy, r, rms: Math.sqrt(rss / n) };
};

// best circle explaining the arc from one run endpoint: fit growing prefixes
// of the walked chain, keep the longest one that still fits tightly (the
// chain eventually crosses onto a neighboring circle of the cluster and the
// residual jumps — stop before that)
const fitFromEndpoint = (edgeX, y) => {
  const chain = walkArc(edgeX, y, 460);
  let best = null;
  for (let n = 90; n <= chain.length; n += 30) {
    const fit = fitCircle(chain.slice(4, n));
    if (!fit) continue;
    if (fit.rms < 2.5 && fit.r > 140 && fit.r < 500) best = fit;
  }
  // the circle must actually cross the edge it was cut by
  if (best && Math.abs(best.cx - edgeX) >= best.r) return null;
  return best;
};

// a row counts as touching the edge if orange sits anywhere in the first few
// columns — the mask's antialiased rim often starts at x=1..6, not exactly 0
const EDGE_BAND = 5;
const edgeOn = (edgeX, y) => {
  for (let i = 0; i < EDGE_BAND; i++) {
    const x = edgeX === 0 ? i : width - 1 - i;
    if (keepPixel(y * width + x)) return true;
  }
  return false;
};

const edgeRuns = (edgeX, band) => {
  const runs = [];
  let runStart = -1;
  for (let y = 0; y <= height; y++) {
    const on =
      y < height && (band ? edgeOn(edgeX, y) : keepPixel(y * width + edgeX));
    if (on && runStart === -1) runStart = y;
    if (!on && runStart !== -1) {
      if (y - runStart > 40) runs.push([runStart, y]);
      runStart = -1;
    }
  }
  return runs;
};

const edgeCircles = [];
const addCircle = (c) => {
  for (const o of edgeCircles) {
    if (Math.hypot(o.cx - c.cx, o.cy - c.cy) < 40 && Math.abs(o.r - c.r) < 30) return; // dup
  }
  edgeCircles.push(c);
};

for (const [edgeX, dir] of [[0, 1], [width - 1, -1]]) {
  // fit arcs from the endpoints of BOTH run flavors: strict-column runs see
  // the junctions between merged circles, band runs see the antialiased rim
  const endpointYs = new Set();
  for (const [y0, y1] of [...edgeRuns(edgeX, false), ...edgeRuns(edgeX, true)]) {
    endpointYs.add(y0);
    endpointYs.add(y1 - 1);
  }
  for (const y of endpointYs) {
    const fit = fitFromEndpoint(edgeX, y);
    if (fit) addCircle({ cx: fit.cx, cy: fit.cy, r: fit.r, fitted: true });
  }
  // chord fallback for the run parts no fitted circle covers
  const covered = (y) =>
    edgeCircles.some((c) => Math.hypot(c.cx - edgeX, c.cy - y) <= c.r + 2);
  for (const [y0, y1] of edgeRuns(edgeX, true)) {
    let gapStart = -1;
    for (let y = y0; y <= y1; y++) {
      const gap = y < y1 && !covered(y);
      if (gap && gapStart === -1) gapStart = y;
      if (!gap && gapStart !== -1) {
        const c = y - gapStart;
        if (c > 40) {
          const d = Math.sqrt(Math.max(0, R * R - (c / 2) * (c / 2)));
          addCircle({ cx: edgeX - dir * d, cy: gapStart + c / 2, r: R, fitted: false });
        }
        gapStart = -1;
      }
    }
  }
}

console.log(
  'edge circles:',
  edgeCircles
    .map((c) => `(${c.cx | 0},${c.cy | 0}) r${c.r | 0}${c.fitted ? '' : ' (chord)'}`)
    .join('\n              '),
);

const OUT_W = width + PAD * 2;
const OUT_CSS_W2X = (OUT_W / 4) * 2; // 2x CSS resolution (ref px are 4x)
const scale = OUT_CSS_W2X / OUT_W;
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
  create: { width: OUT_CSS_W2X, height: outH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    { input: Buffer.from(`<svg width="${OUT_CSS_W2X}" height="${outH}">${circleSvg}</svg>`), left: 0, top: 0 },
    { input: base, left: Math.round(PAD * scale), top: 0 },
  ])
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(OUT);
console.log(
  `saved ${OUT} (${info2.width}x${info2.height}, ${(info2.size / 1024).toFixed(0)} KB) — ` +
    `${areas.filter((a) => a >= MIN_AREA).length}/${areas.length} components kept`,
);
