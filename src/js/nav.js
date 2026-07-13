// Smooth-scroll for any element with data-scroll-to="#target"
// (the ∨ circle, the table of contents links, the back-to-top button).

export function initNav() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (event) => {
      const target = document.querySelector(el.dataset.scrollTo);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  // back-to-top: appears only past the first screen
  const toTop = document.getElementById('to-top');
  const toggle = () => {
    toTop.hidden = window.scrollY <= window.innerHeight;
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}
