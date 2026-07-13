// Scroll-reveal: fade-in + upward drift on first appearance.
// Elements opt in with the data-reveal attribute.

export function initReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (elements.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // elements entering together (e.g. a whole screen after the splash)
      // appear one by one, top to bottom
      const entering = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      entering.forEach((entry, i) => {
        entry.target.style.transitionDelay = `${i * 0.1}s`;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // animate once
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}
