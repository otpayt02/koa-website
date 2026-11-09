// V6 Hero Sequence Controller
// AP Music & Audio AWWWARDS-Grade

(function() {
  'use strict';

  // Hero sequence is primarily CSS-driven with this minimal JS for:
  // - Word-by-word typewriter timing
  // - Skip on interaction
  // - Completion handling

  const state = {
    heroEl: null,
    words: [],
    completed: false,
    startTime: 0,
  };

  function init() {
    state.heroEl = document.getElementById('hero-sequence');
    if (!state.heroEl) return;

    state.words = [...state.heroEl.querySelectorAll('.hero-headline .word')];
    state.startTime = performance.now();

    // Stagger word animations via CSS custom property
    state.words.forEach((word, index) => {
      word.style.setProperty('--word-index', index);
    });

    // Auto-complete after 6s
    setTimeout(complete, 6000);

    // Skip on click/tap
    state.heroEl.addEventListener('click', complete, { once: true });
    state.heroEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') complete();
    }, { once: true });

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      complete();
    }
  }

  function complete() {
    if (state.completed) return;
    state.completed = true;
    state.heroEl.classList.add('complete');
    document.body.classList.remove('hero-lock');

    // Trigger scroll film start
    window.dispatchEvent(new CustomEvent('ap:hero-complete'));
  }

  // Expose for core engine
  window.AP = window.AP || {};
  window.AP.hero = { complete };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();