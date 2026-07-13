import '../styles/base.css';
import '../styles/splash.css';
import '../styles/sections.css';
import { initReveal } from './reveal.js';
import { startMusic, initMuteButton } from './audio.js';
import { initSplash } from './splash.js';
import { initNav } from './nav.js';
import { initRsvp } from './rsvp.js';
import { initCountdown } from './countdown.js';
import { initHeart } from './heart.js';

// Scale the fixed 375px design column to the viewport, like scaling a whole
// Figma group: every element keeps its exact relative position. Phones get
// an edge-to-edge layout; larger screens are capped at a moderate 1.25x.
// The initial value is set by an inline script in <head> (avoids a layout
// shift); this only keeps it updated on resize/rotation.
window.addEventListener('resize', () => {
  document.documentElement.style.setProperty(
    '--page-zoom',
    String(Math.min(window.innerWidth / 375, 1.25)),
  );
});

const muteButton = initMuteButton();
initNav();
initRsvp();
initCountdown();
initHeart();

const hasSplash = initSplash(() => {
  startMusic();
  muteButton.show();
  // reveal animations start only once the page is actually visible
  initReveal();
});

if (!hasSplash) {
  initReveal();
}
