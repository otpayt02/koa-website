// V6 Core Engine — State, observers, performance utilities
// AP Music & Audio AWWWARDS-Grade

(function() {
  'use strict';

  // ===== GLOBAL STATE =====
  window.AP = window.AP || {};
  const state = {
    // Scroll film
    film: null,
    filmStage: null,
    scenes: [],
    frameEl: null,
    dots: [],
    totalFrames: 5000,
    openingHold: 0.04,
    targetProgress: 0,
    visualProgress: 0,
    momentum: 0,
    animationFrame: 0,
    lastFrameTime: 0,
    lastTarget: 0,

    // Hero sequence
    heroSequence: null,
    heroComplete: false,

    // Tracker
    trackerItems: [],
    currentChapter: 0,

    // Top timeline
    topTimeline: null,
    progressFill: null,
    markers: [],

    // Motion
    motionReduced: false,

    // Search
    searchDialog: null,
    searchInput: null,
    searchResults: null,

    // Navigation
    header: null,
    menuBtn: null,
    nav: null,
    motionBtn: null,

    // Intersection Observers
    revealObserver: null,
    chapterObserver: null,
    trackerObserver: null,

    // Performance
    rafScheduled: false,
    scrollScheduled: false,
  };

  // ===== UTILITIES =====
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const smoothstep = (t) => { const x = clamp(t); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;

  // ===== CSS VAR HELPERS =====
  const root = document.documentElement;
  const setVar = (name, value) => root.style.setProperty(name, value);
  const getVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  // ===== MOTION PREFERENCE =====
  function initMotion() {
    const stored = localStorage.getItem('ap-motion');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.motionReduced = stored === 'reduced' || (!stored && prefersReduced);
    root.dataset.motion = state.motionReduced ? 'reduced' : 'full';
    updateMotionButton();
  }

  function setMotion(reduced) {
    state.motionReduced = reduced;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    localStorage.setItem('ap-motion', reduced ? 'reduced' : 'full');
    updateMotionButton();
  }

  function updateMotionButton() {
    if (state.motionBtn) {
      state.motionBtn.setAttribute('aria-pressed', String(state.motionReduced));
      state.motionBtn.textContent = state.motionReduced ? 'Motion off' : 'Motion on';
    }
  }

  function toggleMotion() {
    setMotion(!state.motionReduced);
  }

  // ===== SCROLL FILM ENGINE =====
  function readFilmProgress() {
    if (!state.film) return 0;
    const max = Math.max(1, state.film.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - state.film.offsetTop) / max);
  }

  function cinematicProgress(raw) {
    return clamp((raw - state.openingHold) / (1 - state.openingHold));
  }

  function rawProgress(progress) {
    return state.openingHold + clamp(progress) * (1 - state.openingHold);
  }

  function renderFilm(raw) {
    if (!state.film || !state.scenes.length) return;

    const progress = cinematicProgress(raw);
    const span = 1 / state.scenes.length;

    // Update CSS vars
    setVar('--progress', progress.toFixed(5));
    setVar('--momentum', String(clamp(Math.abs(state.momentum) * 16, 0, 0.35)));

    // Frame counter
    if (state.frameEl) {
      state.frameEl.textContent = String(Math.round(progress * state.totalFrames)).padStart(4, '0');
    }

    // Render each scene
    state.scenes.forEach((scene, index) => {
      const sceneProgress = (progress - index * span) / span;
      const local = clamp(sceneProgress);
      const easedLocal = smoothstep(local);
      const resolved = smoothstep((sceneProgress + (index === 0 ? 0.1 : 0.18)) / (index === 0 ? 0.45 : 0.52));

      // Scene CSS vars
      scene.style.setProperty('--local', easedLocal.toFixed(5));
      scene.style.setProperty('--resolved', resolved.toFixed(5));
      scene.style.setProperty('--scene-scale', String(0.986 + resolved * 0.014));
      scene.style.setProperty('--soft-blur', `${((1 - resolved) * 2 + Math.abs(state.momentum) * 3.5).toFixed(2)}px`);
      scene.style.opacity = String(
        (index === 0 ? 1 : smoothstep((sceneProgress + (index === 1 ? 0.28 : 0.36)) / (index === 1 ? 0.52 : 0.6))) *
        (index === state.scenes.length - 1 ? 1 : 1 - smoothstep((sceneProgress - (index === 0 ? 0.75 : 0.7)) / (index === 0 ? 0.45 : 0.5)))
      );
      scene.classList.toggle('active', scene.style.opacity > 0.006);

      // Logo scene specific
      if (scene.classList.contains('logo-scene')) {
        const reveal = clamp((local - 0.06) / 0.94);
        const finesse = 1 - Math.pow(1 - reveal, 2.5);
        scene.style.setProperty('--logo-finesse', finesse.toFixed(5));
        scene.style.setProperty('--torch', smoothstep((local - 0.58) / 0.35).toFixed(5));
      }

      // Beat reveals
      scene.querySelectorAll('[data-beat]').forEach((line, lineIndex) => {
        const beat = smoothstep((local - lineIndex * 0.24) / 0.48);
        const fade = lineIndex === 0 ? 1 - smoothstep((local - 0.78) / 0.18) : 1;
        line.style.opacity = String(beat * fade);
        line.style.transform = `translate3d(0, ${(1 - beat) * 42}px, 0) scale(${0.978 + beat * 0.022})`;
      });

      // Chapter dots
      if (state.dots[index]) {
        state.dots[index].classList.toggle('active', scene.style.opacity > 0.42 && local < 0.97);
      }
    });

    // Header scrolled state
    if (state.header) {
      state.header.classList.toggle('scrolled', window.scrollY > 28);
    }

    // Update tracker
    updateTracker(progress);

    // Update top timeline
    updateTopTimeline(progress);
  }

  function animateFilm(time) {
    const distance = state.targetProgress - state.visualProgress;
    const elapsed = state.lastFrameTime ? Math.min(100, time - state.lastFrameTime) : 16.7;
    state.lastFrameTime = time;

    // Momentum spring
    state.momentum = state.momentum * 0.82 + (state.targetProgress - state.lastTarget) * 0.18;
    state.lastTarget = state.targetProgress;

    const response = Math.abs(distance) > 0.07 ? 130 : 180;
    const alpha = 1 - Math.exp(-elapsed / response);

    state.visualProgress += distance * alpha;
    renderFilm(state.visualProgress);

    if (Math.abs(distance) > 0.00008 || Math.abs(state.momentum) > 0.00006) {
      state.animationFrame = requestAnimationFrame(animateFilm);
    } else {
      state.visualProgress = state.targetProgress;
      state.momentum = 0;
      state.lastFrameTime = 0;
      renderFilm(state.visualProgress);
      state.animationFrame = 0;
    }
  }

  function requestFilm() {
    state.targetProgress = readFilmProgress();
    if (!state.animationFrame) {
      state.lastFrameTime = 0;
      state.animationFrame = requestAnimationFrame(animateFilm);
    }
  }

  function filmScrollTarget(progress) {
    const max = Math.max(1, state.film.offsetHeight - window.innerHeight);
    return state.film.offsetTop + clamp(progress) * max;
  }

  function settleFilm() {
    if (!state.film || state.motionReduced || !state.scenes.length) return;
    const max = Math.max(1, state.film.offsetHeight - window.innerHeight);
    const progress = cinematicProgress(clamp((window.scrollY - state.film.offsetTop) / max));
    const span = 1 / state.scenes.length;
    const targets = state.scenes.slice(0, -1).map((_, i) => (i + 0.79) * span);
    const nearest = targets.reduce((best, target) =>
      Math.abs(target - progress) < Math.abs(best - progress) ? target : best, targets[0] ?? progress);
    const distance = Math.abs(nearest - progress);

    if (state.filmMeta) {
      state.filmMeta.classList.toggle('magnet', distance < span * 0.07);
    }

    if (distance > span * 0.006 && distance < span * 0.07) {
      window.scrollTo({
        top: filmScrollTarget(rawProgress(nearest)),
        behavior: 'smooth'
      });
    }
  }

  // ===== TRACKER =====
  function updateTracker(progress) {
    const span = 1 / state.scenes.length;
    const chapterIndex = Math.min(state.scenes.length - 1, Math.floor(progress / span));

    if (chapterIndex !== state.currentChapter) {
      state.currentChapter = chapterIndex;
      state.trackerItems.forEach((item, i) => {
        item.classList.toggle('active', i === chapterIndex);
      });
      state.markers.forEach((marker, i) => {
        marker.classList.toggle('active', i === chapterIndex);
      });
    }
  }

  function updateTopTimeline(progress) {
    if (state.progressFill) {
      state.progressFill.style.transform = `scaleX(${progress})`;
    }
  }

  // ===== REVEAL ANIMATIONS =====
  function initReveals() {
    const revealTargets = [
      ...document.querySelectorAll('.content-intro, .fact, .link-card, .contact-card, .review-row, .photo-card')
    ];

    revealTargets.forEach(target => target.classList.add('cinematic-reveal'));

    if ('IntersectionObserver' in window) {
      state.revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            state.revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -7% 0px', threshold: 0.04 });

      revealTargets.forEach(target => state.revealObserver.observe(target));

      // Fallback scroll listener
      let revealFrame = 0;
      function revealVisible() {
        revealFrame = 0;
        revealTargets.forEach(target => {
          const bounds = target.getBoundingClientRect();
          if (bounds.top < window.innerHeight * 1.04 && bounds.bottom > 0) {
            target.classList.add('is-visible');
          }
        });
      }
      window.addEventListener('scroll', () => {
        if (!revealFrame) revealFrame = requestAnimationFrame(revealVisible);
      }, { passive: true });
      revealVisible();
    } else {
      revealTargets.forEach(target => target.classList.add('is-visible'));
    }
  }

  // ===== SEARCH =====
  const searchIndex = [
    ['Home', 'AP Music & Audio — Music for the feeling', '#top'],
    ['Services', 'Custom piano responses, playable blueprints, recording, live sound', '#services'],
    ['Approach', 'Listen first, shape the response, deliver ready to play', '#approach'],
    ['Work', 'Selected projects: custom responses, transcriptions, productions, live sound', '#work'],
    ['Contact', 'Email, voice memo, consultation booking', '#contact'],
  ];

  function initSearch() {
    state.searchDialog = document.querySelector('[data-search-dialog]');
    state.searchInput = document.querySelector('[data-search-input]');
    state.searchResults = document.querySelector('[data-search-results]');

    document.querySelectorAll('[data-search-open]').forEach(btn =>
      btn.addEventListener('click', openSearchDialog)
    );

    state.searchInput?.addEventListener('input', renderSearch);
  }

  function openSearchDialog() {
    if (!state.searchDialog) return;
    state.searchDialog.showModal();
    document.body.classList.add('dialog-open');
    renderSearch();
    requestAnimationFrame(() => state.searchInput?.focus());
  }

  function closeSearchDialog() {
    if (!state.searchDialog) return;
    state.searchDialog.close();
    document.body.classList.remove('dialog-open');
  }

  function renderSearch() {
    if (!state.searchResults || !state.searchInput) return;
    const q = (state.searchInput.value || '').trim().toLowerCase();
    state.searchResults.replaceChildren();
    searchIndex
      .filter(item => !q || item.join(' ').toLowerCase().includes(q))
      .forEach(item => {
        const link = document.createElement('a');
        link.href = item[2];
        link.innerHTML = `<strong>${item[0]}</strong><span>${item[1]}</span>`;
        link.addEventListener('click', closeSearchDialog);
        state.searchResults.append(link);
      });
  }

  // ===== NAVIGATION =====
  function initNav() {
    state.menuBtn = document.querySelector('[data-menu]');
    state.nav = document.querySelector('[data-nav]');

    state.menuBtn?.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      state.menuBtn.setAttribute('aria-expanded', String(open));
      state.menuBtn.textContent = open ? 'Close' : 'Menu';
    });

    state.nav?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        state.menuBtn?.setAttribute('aria-expanded', 'false');
        if (state.menuBtn) state.menuBtn.textContent = 'Menu';
      });
    });
  }

  // ===== DIALOGS =====
  function initDialogs() {
    document.querySelectorAll('[data-dialog-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dialog = btn.closest('dialog');
        dialog?.close();
        document.body.classList.remove('dialog-open');
      });
    });

    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    });
  }

  // ===== KEYBOARD SHORTCUTS =====
  function initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const dialogOpen = document.querySelector('dialog[open]');

      // '/' to open search
      if (e.key === '/' && !typing && !dialogOpen) {
        e.preventDefault();
        openSearchDialog();
      }

      // Escape to close nav
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        state.menuBtn?.click();
      }

      // Space/Enter to skip hero sequence
      if ((e.key === ' ' || e.key === 'Enter') && state.heroSequence && !state.heroComplete) {
        completeHeroSequence();
      }
    });
  }

  // ===== HERO SEQUENCE =====
  function completeHeroSequence() {
    if (state.heroComplete) return;
    state.heroComplete = true;
    const hero = document.getElementById('hero-sequence');
    if (hero) {
      hero.classList.add('complete');
      document.body.classList.remove('hero-lock');
    }
  }

  function initHeroSequence() {
    state.heroSequence = document.getElementById('hero-sequence');
    if (!state.heroSequence) return;

    document.body.classList.add('hero-lock');

    // Auto-complete after 6 seconds
    setTimeout(completeHeroSequence, 6000);

    // Click/key to skip
    state.heroSequence.addEventListener('click', completeHeroSequence, { once: true });
  }

  // ===== CURSOR TRACKING =====
  let cursorX = 0, cursorY = 0;
  function updateCursorVars(x, y) {
    const clampedX = clamp((x / window.innerWidth - 0.5) * 1.2, -0.5, 0.5);
    const clampedY = clamp((y / window.innerHeight - 0.5) * 1.2, -0.5, 0.5);
    cursorX += (clampedX - cursorX) * 0.06;
    cursorY += (clampedY - cursorY) * 0.06;
    if (state.filmStage) {
      state.filmStage.style.setProperty('--pointer-x', cursorX.toFixed(4));
      state.filmStage.style.setProperty('--pointer-y', cursorY.toFixed(4));
    }
  }

  // ===== IMAGE DECODING =====
  function decodeImages() {
    document.querySelectorAll('.scene-media img, .logo-original, .hero-emblem img').forEach(img => {
      img.decode?.().catch(() => {});
    });
  }

  // ===== INITIALIZATION =====
  function init() {
    // Cache DOM
    state.film = document.querySelector('[data-film]');
    state.filmStage = document.querySelector('.film-stage');
    state.scenes = [...document.querySelectorAll('[data-scene]')];
    state.frameEl = document.querySelector('[data-frame]');
    state.dots = [...document.querySelectorAll('.chapter-dots li')];
    state.filmMeta = document.querySelector('.film-meta');
    state.header = document.querySelector('[data-header]');
    state.motionBtn = document.querySelector('[data-motion-toggle]');
    state.progressFill = document.querySelector('.top-timeline .progress-fill');
    state.markers = [...document.querySelectorAll('.top-timeline .marker')];
    state.trackerItems = [...document.querySelectorAll('.tracker-item')];

    // Initialize systems
    initMotion();
    initNav();
    initDialogs();
    initSearch();
    initKeyboard();
    initHeroSequence();
    decodeImages();
    initReveals();

    // Chapter dots click/keyboard
    state.dots.forEach((dot, index) => {
      dot.tabIndex = 0;
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Go to chapter ${index + 1}`);
      const go = () => window.scrollTo({
        top: filmScrollTarget(rawProgress((index + 0.02) / state.scenes.length)),
        behavior: 'smooth'
      });
      dot.addEventListener('click', go);
      dot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); go();
        }
      });
    });

    // Tracker items click
    state.trackerItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetChapter = parseInt(item.dataset.chapter, 10);
        const targetProgress = (targetChapter + 0.02) / state.scenes.length;
        window.scrollTo({
          top: filmScrollTarget(rawProgress(targetProgress)),
          behavior: 'smooth'
        });
      });
    });

    // Top timeline markers click
    state.markers.forEach((marker, index) => {
      marker.addEventListener('click', () => {
        const targetProgress = (index + 0.02) / state.scenes.length;
        window.scrollTo({
          top: filmScrollTarget(rawProgress(targetProgress)),
          behavior: 'smooth'
        });
      });
    });

    // Motion toggle
    state.motionBtn?.addEventListener('click', toggleMotion);

    // Cursor tracking
    window.addEventListener('pointermove', e => updateCursorVars(e.clientX, e.clientY), { passive: true });

    // Scroll events
    window.addEventListener('scroll', requestFilm, { passive: true });
    window.addEventListener('resize', requestFilm);
    window.addEventListener('scrollend', settleFilm);

    // Initial render
    state.targetProgress = state.visualProgress = readFilmProgress();
    renderFilm(state.visualProgress);
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.AP.state = state;
  window.AP.setMotion = setMotion;
  window.AP.completeHeroSequence = completeHeroSequence;
})();