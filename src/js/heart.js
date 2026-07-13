// Connect-the-dots heart (reference: materials/files/slide8/heart_game.png).
// Dots must be tapped strictly in order 1→2→…→16→1; the closing tap fills
// the heart. Touch-first: pointerdown handles both touch and mouse.

// Dot coordinates in the 375x380 viewBox, in play order (1 = center notch,
// counterclockwise, 9 = bottom tip). Measured from slide8.png.
const DOTS = [
  [202, 108], [176, 62], [148, 29], [94, 7], [37, 40], [44, 113], [61, 157],
  [130, 240], [197, 339], [246, 285], [286, 203], [324, 144], [325, 89],
  [303, 30], [253, 27], [220, 62],
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
    points: DOTS.map((p) => p.join(',')).join(' '),
    class: 'heart-fill',
  });
  svg.append(fill);

  const lines = el('g', { class: 'heart-lines' });
  svg.append(lines);

  // centroid, to push number labels outward from the outline
  const cx = DOTS.reduce((s, p) => s + p[0], 0) / DOTS.length;
  const cy = DOTS.reduce((s, p) => s + p[1], 0) / DOTS.length;

  let next = 0; // index into DOTS of the next expected dot

  const dotEls = DOTS.map(([x, y], i) => {
    const g = el('g', { class: 'heart-dot' });
    const d = Math.hypot(x - cx, y - cy) || 1;
    const label = el('text', {
      x: x + ((x - cx) / d) * 18,
      y: y + ((y - cy) / d) * 18 + 6,
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
