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

// Desktop/tablet only: keep the CSS zoom of the 375px design column updated
// on window resize (the initial value is set by an inline script in <head>).
// Phones use native viewport scaling (meta width=375, data-scale="native")
// and never need recomputing.
if (document.documentElement.dataset.scale !== 'native') {
  window.addEventListener('resize', () => {
    // pinch zoom also fires resize (the visual viewport shrinks) — ignore
    // it, only react to real window-size changes, or content would reflow
    // under the user's fingers
    if (window.visualViewport && window.visualViewport.scale !== 1) return;
    document.documentElement.style.setProperty(
      '--page-zoom',
      String(Math.min(window.innerWidth / 375, 1.25)),
    );
  });
}

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
