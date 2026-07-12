// Splash screen: any tap/click (or Enter/Space) opens the invitation —
// starts the music and smoothly fades into the page.

export function initSplash(onOpen) {
  const splash = document.getElementById('splash');
  if (!splash) return false;

  document.body.classList.add('no-scroll');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opened = false;

  function open() {
    if (opened) return;
    opened = true;

    onOpen();
    document.body.classList.remove('no-scroll');

    if (reducedMotion) {
      splash.remove();
      return;
    }

    splash.classList.add('is-hidden');
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    // safety net in case transitionend never fires
    setTimeout(() => splash.remove(), 1200);
  }

  splash.addEventListener('click', open);
  splash.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });

  return true;
}
