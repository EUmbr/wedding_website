// Background music: not loaded until the splash screen is tapped (satisfies
// autoplay policies and saves bandwidth), then looped. The fixed button
// toggles mute with a clear icon state.

import musicOnIcon from '../assets/images/music_on_icon.webp';
import musicOffIcon from '../assets/images/music_off_icon.webp';

const AUDIO_SRC = '/audio/track.mp3';

let audio = null;

export function startMusic() {
  if (!audio) {
    audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    // attached (invisible) so playback state is inspectable in devtools
    audio.hidden = true;
    document.body.append(audio);
  }
  // play() can reject (e.g. very old browsers) — the site must not break
  audio.play().catch(() => {});
}

// Temporarily lower the background music (e.g. while the heart win video
// plays its own sound), then restore it.
export function setMusicDucked(ducked) {
  if (audio) {
    audio.volume = ducked ? 0.1 : 1;
  }
}

export function initMuteButton() {
  const button = document.getElementById('mute-btn');
  const icon = button.querySelector('img');

  // preload the "off" icon so the first toggle doesn't flash
  new Image().src = musicOffIcon;

  button.addEventListener('click', () => {
    if (!audio) return;
    audio.muted = !audio.muted;
    // if the browser paused playback (e.g. after an interruption), resume on unmute
    if (!audio.muted && audio.paused) {
      audio.play().catch(() => {});
    }
    icon.src = audio.muted ? musicOffIcon : musicOnIcon;
    button.setAttribute('aria-pressed', String(audio.muted));
    button.setAttribute(
      'aria-label',
      audio.muted ? 'включить музыку' : 'выключить музыку',
    );
  });

  return {
    show() {
      button.hidden = false;
    },
  };
}
