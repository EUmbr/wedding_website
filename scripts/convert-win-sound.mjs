// One-off: convert materials/audio/heart_win.opus to public/effects/heart_win.mp3.
// iOS Safari cannot play a bare .opus file, mp3 plays everywhere — so the site
// ships a single universal mp3. No ffmpeg on this machine: the opus is decoded
// to PCM by the browser (Edge via Playwright) and encoded to mp3 with lamejs
// (pure JS) inside the same page. Usage: node scripts/convert-win-sound.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const SRC = 'materials/audio/heart_win.opus';
const OUT = 'public/effects/heart_win.mp3';
const KBPS = 128;

const opusB64 = (await readFile(SRC)).toString('base64');

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
await page.addScriptTag({ path: 'node_modules/lamejs/lame.min.js' });

const mp3B64 = await page.evaluate(
  async ([b64, kbps]) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const ctx = new OfflineAudioContext(2, 1, 44100); // only used for decoding
    const buf = await ctx.decodeAudioData(bytes.buffer);

    const toInt16 = (f32) => {
      const i16 = new Int16Array(f32.length);
      for (let i = 0; i < f32.length; i++) {
        i16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767)));
      }
      return i16;
    };
    const left = toInt16(buf.getChannelData(0));
    const right = toInt16(buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0));

    const enc = new lamejs.Mp3Encoder(2, buf.sampleRate, kbps);
    const chunks = [];
    const BLOCK = 1152;
    for (let i = 0; i < left.length; i += BLOCK) {
      const out = enc.encodeBuffer(left.subarray(i, i + BLOCK), right.subarray(i, i + BLOCK));
      if (out.length) chunks.push(out);
    }
    const end = enc.flush();
    if (end.length) chunks.push(end);

    let binary = '';
    for (const chunk of chunks) {
      // chunks are Int8Array — mask to 0..255 for btoa
      for (let i = 0; i < chunk.length; i++) binary += String.fromCharCode(chunk[i] & 0xff);
    }
    return { b64: btoa(binary), seconds: buf.duration, rate: buf.sampleRate };
  },
  [opusB64, KBPS],
);
await browser.close();

await writeFile(OUT, Buffer.from(mp3B64.b64, 'base64'));
console.log(
  `saved ${OUT}: ${(mp3B64.b64.length * 0.75 / 1024).toFixed(0)} KB, ` +
    `${mp3B64.seconds.toFixed(1)}s @ ${mp3B64.rate} Hz, ${KBPS} kbps`,
);
