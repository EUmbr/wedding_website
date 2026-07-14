// Connect-the-dots heart (reference: materials/files/slide8/heart_game.png).
// Dots are connected strictly in order 1→2→…→16→1 by tapping each dot.
// Tapping any other dot does nothing; the next expected dot pulses as a hint.
// Closing the loop fills the heart and plays the win video effect.

import { setMusicDucked } from './audio.js';

// Dots in the 375x410 viewBox, in play order (1 = center notch,
// counterclockwise, 9 = bottom tip). Each entry is
// [dot x, dot y, number x (center), number y (baseline)] — dot centers and
// number positions are both measured from slide8.png.
const DOTS = [
  [203.5, 130, 197, 168], [177.5, 85, 158.5, 116], [149.5, 50.5, 136.5, 84],
  [95, 26, 95, 65], [38, 62, 54.5, 81], [44.5, 135.5, 66.5, 138],
  [61.5, 181, 80.5, 185], [130.5, 264.5, 152, 273], [198.5, 356, 218, 397],
  [246.5, 311.5, 224, 291], [287, 231.5, 255.5, 223], [326, 169, 293, 175],
  [326, 111, 293, 115], [304.5, 50.5, 310, 28], [252.5, 50.5, 253, 40],
  [221, 85, 244, 116],
];

const SVG_NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

// --- win effect: transparent webm overlay + separate opus sound ------------

let winVideo = null;

function prepareWinEffect() {
  if (winVideo) return;
  const video = document.createElement('video');
  // iOS Safari cannot play webm with alpha — skip the effect there entirely
  if (!video.canPlayType('video/webm')) return;
  video.src = '/effects/heart_win.webm';
  video.preload = 'auto';
  video.muted = true; // the sound track ships separately as .opus
  video.playsInline = true;
  video.className = 'heart-win-video';
  winVideo = video;
}

function playWinEffect() {
  if (!winVideo) return;
  const sound = new Audio('/effects/heart_win.opus');
  document.body.append(winVideo);
  setMusicDucked(true);

  const cleanup = () => {
    winVideo.remove();
    setMusicDucked(false);
  };
  winVideo.addEventListener('ended', cleanup);
  winVideo.addEventListener('error', cleanup);
  winVideo.play().catch(cleanup);
  sound.play().catch(() => {});
}

// ---------------------------------------------------------------------------

export function initHeart() {
  const svg = document.getElementById('heart');
  if (!svg) return;

  // fill polygon (hidden until the loop closes)
  const fill = el('polygon', {
    points: DOTS.map(([x, y]) => `${x},${y}`).join(' '),
    class: 'heart-fill',
  });
  svg.append(fill);

  const lines = el('g', { class: 'heart-lines' });
  svg.append(lines);

  let next = 0; // index into DOTS of the next expected dot
  let done = false;

  const advance = () => {
    const [x, y] = DOTS[next % 16];
    if (next > 0) {
      const [px, py] = DOTS[next - 1];
      lines.append(el('line', { x1: px, y1: py, x2: x, y2: y, class: 'heart-line' }));
    }
    dotEls[next % 16].classList.remove('is-next');
    prepareWinEffect(); // start loading the video on the first tap
    next += 1;
    if (next === 16) {
      dotEls[0].classList.add('is-next'); // loop back to dot 1
    } else if (next === 17) {
      done = true;
      svg.classList.add('is-done');
      dotEls[0].classList.remove('is-next');
      playWinEffect();
    } else {
      dotEls[next].classList.add('is-next');
    }
  };

  const dotEls = DOTS.map(([x, y, numX, numY], i) => {
    const g = el('g', { class: 'heart-dot' });
    const label = el('text', {
      x: numX,
      y: numY,
      class: 'heart-num',
      'text-anchor': 'middle',
    });
    label.textContent = String(i + 1);
    g.append(
      el('circle', { cx: x, cy: y, r: 6, class: 'heart-point' }),
      el('circle', { cx: x, cy: y, r: 20, class: 'heart-hit' }), // big tap target
      label,
    );
    g.addEventListener('pointerdown', () => {
      if (done || i !== next % 16) return; // wrong dot — ignore
      advance();
    });
    svg.append(g);
    return g;
  });

  dotEls[0].classList.add('is-next'); // hint: start at 1
}
