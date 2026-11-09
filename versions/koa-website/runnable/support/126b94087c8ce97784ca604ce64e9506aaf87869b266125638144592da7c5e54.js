// V6 Tracker — Vertical story tracker + top timeline
// AP Music & Audio AWWWARDS-Grade

(function() {
  'use strict';

  const state = {
    trackerItems: [],
    markers: [],
    progressFill: null,
    film: null,
    scenes: [],
    totalFrames: 5000,
    openingHold: 0.04,
  };

  function init() {
    state.trackerItems = [...document.querySelectorAll('.tracker-item')];
    state.markers = [...document.querySelectorAll('.top-timeline .marker')];
    state.progressFill = document.querySelector('.top-timeline .progress-fill');
    state.film = document.querySelector('[data-film]');
    state.scenes = [...document.querySelectorAll('[data-scene]')];

    if (!state.film || !state.scenes.length) return;

    // Tracker click handlers
    state.trackerItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToChapter(index);
      });
    });

    // Marker click handlers
    state.markers.forEach((marker, index) => {
      marker.addEventListener('click', () => {
        scrollToChapter(index);
      });
    });

    // Update on scroll (called from core engine)
    window.addEventListener('ap:film-progress', (e) => {
      updateTracker(e.detail.progress);
      updateTimeline(e.detail.progress);
    });

    // Also listen to core engine's renderFilm
    // We'll use a simpler approach: poll on scroll
    let lastProgress = -1;
    function checkProgress() {
      if (!state.film) return;
      const max = Math.max(1, state.film.offsetHeight - window.innerHeight);
      const raw = Math.max(0, Math.min(1, (window.scrollY - state.film.offsetTop) / max));
      const progress = (raw - state.openingHold) / (1 - state.openingHold);
      const clamped = Math.max(0, Math.min(1, progress));

      if (Math.abs(clamped - lastProgress) > 0.001) {
        lastProgress = clamped;
        updateTracker(clamped);
        updateTimeline(clamped);
      }
      requestAnimationFrame(checkProgress);
    }
    checkProgress();
  }

  function cinematicProgress(raw) {
    return Math.max(0, Math.min(1, (raw - state.openingHold) / (1 - state.openingHold)));
  }

  function updateTracker(progress) {
    const span = 1 / state.scenes.length;
    const chapterIndex = Math.min(state.scenes.length - 1, Math.floor(progress / span));

    state.trackerItems.forEach((item, i) => {
      item.classList.toggle('active', i === chapterIndex);
    });
    state.markers.forEach((marker, i) => {
      marker.classList.toggle('active', i === chapterIndex);
    });
  }

  function updateTimeline(progress) {
    if (state.progressFill) {
      state.progressFill.style.transform = `scaleX(${progress})`;
    }
  }

  function scrollToChapter(chapterIndex) {
    const span = 1 / state.scenes.length;
    const targetProgress = state.openingHold + ((chapterIndex + 0.02) / state.scenes.length) * (1 - state.openingHold);
    const max = Math.max(1, state.film.offsetHeight - window.innerHeight);
    const targetY = state.film.offsetTop + targetProgress * max;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();