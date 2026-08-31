// KOA Main JavaScript — Premium Cinematic Edition
// Progress tracking, chapter navigation, parallax, scroll reveals, micro-interactions

(() => {
  'use strict';

  // ─── Utilities ───────────────────────────────────────────────
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp = (a, b, t) => a + (b - a) * t;
  const raf = window.requestAnimationFrame.bind(window);

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── DOM Cache ───────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  document.addEventListener('DOMContentLoaded', () => {

    // ─── Elements ──────────────────────────────────────────────
    const header     = $('#header');
    const navToggle  = $('.nav-toggle');
    const navMenu    = $('.nav-menu');
    const langToggle = $('#lang-toggle');
    const motionToggle = $('#motion-toggle');

    const progressBar   = $('.progress-bar');
    const chapterDots   = $$('.progress-chapters .chapter-dot');
    const trackerDots   = $$('.tracker-dot');
    const chapters      = $$('.chapter');
    const parallaxEls   = $$('[data-parallax]');
    const revealTargets = $$('.chapter-number, .chapter-title, .chapter-lead, .chapter-body, .about-block, .widget-item, .cta-group');

    let motionEnabled = !prefersReducedMotion();

    // ─── Mobile Navigation ─────────────────────────────────────
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isOpen);
      });

      $$('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // ─── Language Toggle ───────────────────────────────────────
    let currentLang = 'en';
    if (langToggle) {
      langToggle.setAttribute('data-lang', 'en');

      const toggleLang = () => {
        currentLang = currentLang === 'en' ? 'ksw' : 'en';
        document.documentElement.lang = currentLang === 'en' ? 'en' : 'ksw';
        langToggle.setAttribute('data-lang', currentLang);
        langToggle.setAttribute('aria-checked', currentLang === 'ksw' ? 'true' : 'false');
      };

      langToggle.addEventListener('click', toggleLang);
      langToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleLang();
        }
      });
    }

    // ─── Motion Toggle ────────────────────────────────────────
    if (motionToggle) {
      motionToggle.textContent = motionEnabled ? 'Motion on' : 'Motion off';
      motionToggle.addEventListener('click', () => {
        motionEnabled = !motionEnabled;
        motionToggle.textContent = motionEnabled ? 'Motion on' : 'Motion off';
        document.body.classList.toggle('reduced-motion', !motionEnabled);
      });
    }

    // ─── Smooth Anchor Scroll ──────────────────────────────────
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (!target) return;
        const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: y,
          behavior: motionEnabled ? 'smooth' : 'auto'
        });
      });
    });

    // ─── Header Shrink (class-based, no inline styles) ─────────
    let headerScrolled = false;
    const updateHeader = (scrollY) => {
      const shouldShrink = scrollY > 100;
      if (shouldShrink !== headerScrolled) {
        headerScrolled = shouldShrink;
        header.classList.toggle('scrolled', shouldShrink);
      }
    };

    // ─── Progress Timeline ─────────────────────────────────────
    const updateProgress = (scrollY, docHeight) => {
      const pct = docHeight > 0 ? clamp((scrollY / docHeight) * 100, 0, 100) : 0;
      if (progressBar) progressBar.style.width = `${pct}%`;
    };

    // ─── Chapter Tracking ──────────────────────────────────────
    let activeChapter = 0;

    const setActiveChapter = (index) => {
      if (index === activeChapter) return;
      activeChapter = index;

      // Top progress dots
      chapterDots.forEach((dot, i) => {
        dot.classList.toggle('active', i <= index);
      });

      // Side tracker dots
      trackerDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    };

    // Section formation: hero controller handles the hero animation.
    // This tracks chapter progress for the side navigation dots.
    const updateSectionFormation = (scrollY, winH) => {
      let bestIdx = 0;
      let bestProgress = 0;

      chapters.forEach((ch, i) => {
        if (i === 0) return; // skip hero
        const rect = ch.getBoundingClientRect();
        const progress = 1 - (rect.top + rect.height) / (winH + rect.height);
        const clamped = clamp(progress, 0, 1);

        if (clamped > 0 && clamped < 1) {
          if (clamped > bestProgress) {
            bestProgress = clamped;
            bestIdx = i;
          }
        }
      });

      setActiveChapter(bestIdx);

      // Drive the hourglass glyph canvas for non-hero chapters
      if (window.KOAGlyphs && bestIdx >= 1) {
        window.KOAGlyphs.updateSectionProgress(bestIdx, bestProgress);
      }
    };

    // ─── Parallax ──────────────────────────────────────────────
    const updateParallax = (scrollY, winH) => {
      if (!motionEnabled || parallaxEls.length === 0) return;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Only transform elements that are near the viewport
        if (rect.bottom < -200 || rect.top > winH + 200) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - winH / 2) / winH;
        const shift = offset * -40; // subtle parallax shift in px
        el.style.transform = `translateY(${shift}px) scale(1.08)`;
      });
    };

    // ─── Scroll Reveal (IntersectionObserver) ──────────────────
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // one-shot reveal
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealTargets.forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });

    // ─── Hero Landing Animation ────────────────────────────────
    // The hero scroll animation is handled by hero-scroll-controller.js
    // Here we handle section reveals after hero completion
    const heroSection = $('#hero');
    if (heroSection) {
      // Listen for hero completion to trigger first section reveal
      document.addEventListener('koa-hero-complete', (e) => {
        const firstChapter = $('.chapter[data-chapter="1"]');
        if (firstChapter && e.detail.progress > 0.5) {
          firstChapter.classList.add('visible');
        }
      });
    }

    // ─── Main Scroll Loop (rAF-throttled) ──────────────────────
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf(() => {
        const scrollY = window.pageYOffset;
        const winH = window.innerHeight;
        const docH = document.documentElement.scrollHeight - winH;

        updateHeader(scrollY);
        updateProgress(scrollY, docH);
        updateSectionFormation(scrollY, winH);
        updateParallax(scrollY, winH);

        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // ─── Chapter Tracker Click ─────────────────────────────────
    trackerDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const href = dot.getAttribute('href');
        const target = $(href);
        if (!target) return;
        const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: motionEnabled ? 'smooth' : 'auto' });
      });
    });

    // ─── Initial State ─────────────────────────────────────────
    onScroll(); // run once to set initial state

    // ─── Premium Loading Screen ─────────────────────────────────
    // Loader dismissal is handled by hourglass-loader.js (KOAGlyphs.init)
    // which runs the glyph formation animation then auto-dismisses.
    // Initialize the glyph system.
    if (window.KOAGlyphs) {
      window.KOAGlyphs.init();
    } else {
      // Fallback: if hourglass-loader.js didn't load, dismiss loader manually
      const loader = $('#loader');
      if (loader) {
        const dismissLoader = () => {
          loader.classList.add('loaded');
          setTimeout(() => loader.remove(), 1000);
        };
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(dismissLoader);
        } else {
          setTimeout(dismissLoader, 2500);
        }
        setTimeout(dismissLoader, 4000);
      }
    }

    // ─── Cursor Glow ────────────────────────────────────────────
    const cursorGlow = $('#cursor-glow');
    if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
      let glowX = 0, glowY = 0;
      let targetX = 0, targetY = 0;
      let glowActive = false;

      document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!glowActive) {
          glowActive = true;
          glowX = targetX;
          glowY = targetY;
          cursorGlow.classList.add('active');
        }
      });

      document.addEventListener('mouseleave', () => {
        glowActive = false;
        cursorGlow.classList.remove('active');
      });

      // Smooth follow with lerp
      const animateGlow = () => {
        if (glowActive) {
          glowX = lerp(glowX, targetX, 0.08);
          glowY = lerp(glowY, targetY, 0.08);
          cursorGlow.style.left = glowX + 'px';
          cursorGlow.style.top = glowY + 'px';
        }
        raf(animateGlow);
      };
      animateGlow();
    }

    // ─── Text Split Animations ──────────────────────────────────
    // Split chapter titles into words for staggered reveal
    const splitTargets = $$('.chapter-title, .chapter-lead');
    splitTargets.forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.innerHTML = words.map(w => `<span class="reveal-word">${w}</span>`).join(' ');
    });

    // Observe word reveals
    const wordObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const words = $$('.reveal-word', entry.target);
          words.forEach((word, i) => {
            setTimeout(() => word.classList.add('visible'), i * 60);
          });
          wordObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    splitTargets.forEach(el => wordObserver.observe(el));

    // ─── Button Hover Tracking (Radial Gradient Follow) ──────────
    // Track mouse position for radial gradient effect on CTA buttons
    $$('.cta-primary, .cta-secondary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--mouse-x', `${x}%`);
        btn.style.setProperty('--mouse-y', `${y}%`);
      });
    });

    // ─── Enhanced Widget Item 3D Tilt ────────────────────────────
    // More sophisticated tilt effect with perspective origin tracking
    $$('.widget-item').forEach(item => {
      item.addEventListener('mousemove', (e) => {
        if (!motionEnabled) return;
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -8;
        const tiltY = (x - 0.5) * 8;
        item.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      item.addEventListener('mouseleave', () => {
        item.style.transform = '';
      });
    });

    console.log('KOA Canonical — Cinematic Edition (ChatGPT Sites Style) initialized');
    console.log('Features: Scroll-Driven Hero, Seal Revolve, KOA Formation, Tagline Sweep, Glyph Scatter, Language Toggle, Cursor Glow, Film Grain, Chapter Tracker');
  });
})();
