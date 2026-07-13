// Dev helper: stitch two reference crops vertically to check a section seam.
// Usage: node scripts/stitch.mjs <imgA> <cropTopA_refpx> <imgB> <height_refpx> <out>
// Takes the bottom (height) of A from cropTopA and the top (height) of B.

import sharp from 'sharp';

const [, , aPath, aTop, bPath, hArg, out] = process.argv;
const h = Number(hArg);

const a = await sharp(aPath).extract({ left: 0, top: Number(aTop), width: 1500, height: h }).toBuffer();
const b = await sharp(bPath).extract({ left: 0, top: 0, width: 1500, height: h }).toBuffer();
await sharp({ create: { width: 1500, height: h * 2, channels: 3, background: '#000000' } })
  .composite([
    { input: a, top: 0, left: 0 },
    { input: b, top: h, left: 0 },
  ])
  .toFile(out);
console.log(`saved ${out}`);
