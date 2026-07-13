// One-time local step: convert the heavy PNG exports from materials/files
// into small WebP files in src/assets/images. Run with: npm run optimize-images
//
// Widths are 2x the CSS size each image occupies in the 375px-wide layout,
// so photos stay sharp on high-DPI phone screens.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC_DIR = 'materials/files';
const OUT_DIR = 'src/assets/images';

// [source (relative to materials/files), output name, target width px, quality]
const images = [
  // Splash screen
  ['opening_slide/couple_kiss.png', 'couple_kiss.webp', 700, 82],
  ['opening_slide/orange_heart_pattern.png', 'orange_heart_pattern.webp', 700, 90],

  // Section 1 — title
  ['slide1/couple_image1.png', 'couple_image1.webp', 500, 82],
  ['slide1/couple_image2.png', 'couple_image2.webp', 750, 82],
  ['slide1/couple_image3.png', 'couple_image3.webp', 400, 82],
  ['slide1/couple_image4.png', 'couple_image4.webp', 650, 82],

  // Section 2 — table of contents folder icons
  ['slide2/folder_icon1.png', 'folder_icon1.webp', 580, 90],
  ['slide2/folder_icon2.png', 'folder_icon2.webp', 580, 90],
  ['slide2/folder_icon3.png', 'folder_icon3.webp', 580, 90],
  ['slide2/folder_icon4.png', 'folder_icon4.webp', 580, 90],
  ['slide2/folder_icon5.png', 'folder_icon5.webp', 580, 90],

  // Section 3 — timeline background photo (object-fit: cover at 812px tall
  // needs ~500 CSS px width → 1000px at 2x)
  ['slide3/couple_image.png', 'timing_photo.webp', 1000, 80],

  // Section 5 — details
  ['slide5/mail.png', 'mail.webp', 600, 85],
  ['slide5/flower.png', 'flower.webp', 600, 85],
  ['slide5/phone.png', 'phone.webp', 650, 85],

  // Fixed mute button icons
  ['slide1/music_on_icon.png', 'music_on_icon.webp', 176, 90],
  ['slide1/music_off_icon.png', 'music_off_icon.webp', 176, 90],
];

await mkdir(OUT_DIR, { recursive: true });

let total = 0;
for (const [src, out, width, quality] of images) {
  const info = await sharp(path.join(SRC_DIR, src))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(path.join(OUT_DIR, out));
  total += info.size;
  console.log(`${out.padEnd(28)} ${(info.size / 1024).toFixed(0).padStart(5)} KB  (${info.width}x${info.height})`);
}
console.log(`${'TOTAL'.padEnd(28)} ${(total / 1024).toFixed(0).padStart(5)} KB`);
