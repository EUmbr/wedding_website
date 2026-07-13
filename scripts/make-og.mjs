// One-off: build the 1200x630 Open Graph preview image (public/og.jpg)
// from the splash photo. Usage: node scripts/make-og.mjs

import sharp from 'sharp';

const info = await sharp('materials/files/opening_slide/couple_kiss.png')
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
  .jpeg({ quality: 80 })
  .toFile('public/og.jpg');
console.log(`saved public/og.jpg (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB)`);
