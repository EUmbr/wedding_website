import '../styles/base.css';
import '../styles/splash.css';
import '../styles/sections.css';
import { initReveal } from './reveal.js';
import { startMusic, initMuteButton } from './audio.js';
import { initSplash } from './splash.js';
import { initNav } from './nav.js';

const muteButton = initMuteButton();
initNav();

const hasSplash = initSplash(() => {
  startMusic();
  muteButton.show();
  // reveal animations start only once the page is actually visible
  initReveal();
});

if (!hasSplash) {
  initReveal();
}
