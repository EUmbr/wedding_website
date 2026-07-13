// Connect-the-dots heart (reference: materials/files/slide8/heart_game.png).
// Dots must be tapped strictly in order 1→2→…→16→1; the closing tap fills
// the heart. Touch-first: pointerdown handles both touch and mouse.

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
      if (i !== next % 16) return; // wrong dot — ignore
      if (next > 0) {
        const [px, py] = DOTS[next - 1];
        lines.append(el('line', { x1: px, y1: py, x2: x, y2: y, class: 'heart-line' }));
      }
      dotEls[i].classList.remove('is-next');
      next += 1;
      if (next === 16) {
        dotEls[0].classList.add('is-next'); // loop back to dot 1
      } else if (next === 17) {
        svg.classList.add('is-done'); // fill + celebration
        dotEls[0].classList.remove('is-next');
      } else {
        dotEls[next].classList.add('is-next');
      }
    });
    svg.append(g);
    return g;
  });

  dotEls[0].classList.add('is-next'); // hint: start at 1
}
