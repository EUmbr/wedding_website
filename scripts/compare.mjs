// Dev helper: overlay a screenshot on a reference image at 50% opacity to
// spot layout differences ("ghosting" = misalignment).
// Usage: node scripts/compare.mjs <reference.png> <screenshot.png> <out.png>

import sharp from 'sharp';

const [, , refPath, shotPath, outPath] = process.argv;

const ref = sharp(refPath).resize({ width: 750 });
const { height: refH } = await ref.metadata().then(async () => {
  const buf = await sharp(refPath).resize({ width: 750 }).toBuffer();
  return sharp(buf).metadata();
});

const shot = await sharp(shotPath).resize({ width: 750 }).ensureAlpha(0.5).toBuffer();

await sharp(await sharp(refPath).resize({ width: 750 }).toBuffer())
  .composite([{ input: shot, top: 0, left: 0 }])
  .toFile(outPath);

console.log(`saved ${outPath} (reference height at 750w: ${refH}px)`);
