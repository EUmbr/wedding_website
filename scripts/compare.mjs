// Dev helper: overlay a screenshot on a reference image at 50% opacity to
// spot layout differences ("ghosting" = misalignment).
// Usage: node scripts/compare.mjs <reference.png> <screenshot.png> <out.png>

import sharp from 'sharp';

const [, , refPath, shotPath, outPath] = process.argv;

const refBuf = await sharp(refPath).resize({ width: 750 }).toBuffer();
const shotBuf = await sharp(shotPath).resize({ width: 750 }).toBuffer();

const refH = (await sharp(refBuf).metadata()).height;
const shotH = (await sharp(shotBuf).metadata()).height;
const h = Math.min(refH, shotH);

const crop = (buf) => sharp(buf).extract({ left: 0, top: 0, width: 750, height: h });

await crop(refBuf)
  .composite([{ input: await crop(shotBuf).ensureAlpha(0.5).toBuffer(), top: 0, left: 0 }])
  .toFile(outPath);

console.log(`saved ${outPath} (compared height: ${h}px at 750w)`);
