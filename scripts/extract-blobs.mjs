// One-off: export the orange blob clusters from slide4.png as a transparent
// webp asset (the organic overlapping-circle shapes are impractical to
// rebuild in CSS). Orange text and the button are excluded by rectangle.
// Usage: node scripts/extract-blobs.mjs

import sharp from 'sharp';

const SRC = 'materials/references/slide4.png';
const OUT = 'src/assets/images/location_blobs.webp';

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// rectangles (reference px = CSS*4) to exclude: body text block and button
const EXCLUDE = [
  [200, 1230, 1500, 1790], // text block x50..375 y307..447
  [280, 2950, 950, 3140], // button x70..237 y737..785
];

const out = Buffer.alloc(width * height * 4);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const o = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const excluded = EXCLUDE.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
    if (!excluded && Math.abs(r - 0xf5) + Math.abs(g - 0x5b) + Math.abs(b - 0x29) < 150) {
      out[o] = 0xf5;
      out[o + 1] = 0x5b;
      out[o + 2] = 0x29;
      out[o + 3] = 255;
    }
  }
}

const info2 = await sharp(out, { raw: { width, height, channels: 4 } })
  .resize({ width: 750 }) // 2x CSS resolution is plenty for flat shapes
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile(OUT);
console.log(`saved ${OUT} (${info2.width}x${info2.height}, ${(info2.size / 1024).toFixed(0)} KB)`);
