// V6 Chapters — Chapter transitions, scroll spy, beat reveals
// AP Music & Audio AWWWARDS-Grade

(function() {
  'use strict';

  const state = {
    scenes: [],
    sceneCopies: [],
    currentChapter: -1,
    transitioning: false,
  };

  function init() {
    state.scenes = [...document.querySelectorAll('[data-scene]')];
    state.sceneCopies = [...document.querySelectorAll('.scene-copy')];

    // Initialize beat reveals for each scene copy
    state.sceneCopies.forEach(copy => {
      const beats = [...copy.querySelectorAll('[data-beat]')];
      beats.forEach((beat, i) => {
        beat.style.transitionDelay = `${i * 80}ms`;
      });
    });

    // Scroll spy for chapter changes
    if ('IntersectionObserver' in window) {
      const chapterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const chapter = parseInt(entry.target.dataset.chapter, 10);
            if (chapter !== state.currentChapter && !isNaN(chapter)) {
              onChapterChange(chapter, entry.target);
            }
          }
        });
      }, {
        rootMargin: '0px 0px -50% 0px',
        threshold: [0.1, 0.3, 0.5, 0.7]
      });

      state.scenes.forEach(scene => chapterObserver.observe(scene));
    }

    // Listen for hero complete to start film
    window.addEventListener('ap:hero-complete', () => {
      // Film starts automatically via core engine
    });
  }

  function onChapterChange(chapterIndex, sceneEl) {
    state.currentChapter = chapterIndex;

    // Update tracker
    document.querySelectorAll('.tracker-item').forEach((item, i) => {
      item.classList.toggle('active', i === chapterIndex);
    });

    // Update top timeline markers
    document.querySelectorAll('.top-timeline .marker').forEach((marker, i) => {
      marker.classList.toggle('active', i === chapterIndex);
    });

    // Trigger beat reveals for this scene's copy
    const copy = sceneEl.querySelector('.scene-copy');
    if (copy) {
      const beats = [...copy.querySelectorAll('[data-beat]')];
      beats.forEach((beat, i) => {
        // Reset then trigger
        beat.style.opacity = '0';
        beat.style.transform = 'translate3d(0, 28px, 0) scale(0.975)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            beat.classList.add('is-visible');
          });
        });
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('ap:chapter-change', {
      detail: { chapter: chapterIndex, scene: sceneEl }
    }));
  }

  // Smooth scroll to chapter (used by tracker, dots, timeline)
  function scrollToChapter(chapterIndex) {
    const film = document.querySelector('[data-film]');
    if (!film || !state.scenes.length) return;

    const totalFrames = parseInt(film.dataset.total, 10) || 5000;
    const openingHold = 0.04;
    const span = 1 / state.scenes.length;
    const targetProgress = openingHold + ((chapterIndex + 0.02) / state.scenes.length) * (1 - openingHold);
    const max = Math.max(1, film.offsetHeight - window.innerHeight);
    const targetY = film.offsetTop + targetProgress * max;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  // Expose
  window.AP = window.AP || {};
  window.AP.chapters = { scrollToChapter, onChapterChange };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();