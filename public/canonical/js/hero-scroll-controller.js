// KOA Hero Scroll Controller — ChatGPT Sites Style
// Scroll-driven cinematic sequence:
//   Phase 1 (0.00–0.15): Seal appears + revolves (rotation = scroll × 0.5)
//   Phase 2 (0.15–0.30): KOA glyphs form from seal center
//   Phase 3 (0.30–0.60): Taglines cycle — blur-sweep in, hold, blur-sweep out
//   Phase 4 (0.60–0.72): Glyphs scatter from K & A positions
//   Phase 5 (0.72–0.90): Logo/shrink → becomes banner logo
//   Phase 6 (0.90–1.00): First section fades in

(() => {
  'use strict';

  // ─── Glyph pools ───────────────────────────────────────────
  const GLYPHS = [
    'က','ခ','ဂ','ဃ','င','စ','ဆ','၇','ည','တ',
    'ထ','ဒ','ဓ','န','ပ','ဖ','ဗ','ဘ','မ','ယ',
    'ရ','လ','ဝ','သ','ဟ','အ'
  ];

  // ─── Easing ────────────────────────────────────────────────
  const easeInOutCubic = t =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  // ─── Phase boundaries ─────────────────────────────────────
  const P = {
    SEAL_IN:     [0.00, 0.04],
    SEAL_REV:    [0.04, 0.15],
    KOA_FORM:    [0.15, 0.30],
    TAG_CYCLE:   [0.30, 0.60],
    SCATTER:     [0.60, 0.72],
    SHRINK:      [0.72, 0.90],
    SECTION_IN:  [0.90, 1.00],
  };

  const TAGLINES = ['Many places.', 'One community.', 'One voice.', 'One home.'];
  const PARTICLE_COUNT = 160;
  const SCATTER_DIST = 450;

  // ─── State ─────────────────────────────────────────────────
  let canvas, ctx, W, H, dpr;
  let sealEl, taglineEl, promptEl, heroEl;
  let particles = [];
  let progress = 0;
  let currentTagline = -1;
  let rafId = null;
  let initialized = false;

  // ─── Text sampling ─────────────────────────────────────────
  function sampleText(text, fontSize, maxPts) {
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const oc = off.getContext('2d');
    oc.fillStyle = '#000';
    oc.fillRect(0, 0, W, H);
    oc.fillStyle = '#fff';
    oc.font = `500 ${fontSize}px "Playfair Display", Georgia, serif`;
    oc.textAlign = 'center';
    oc.textBaseline = 'middle';
    oc.fillText(text, W / 2, H / 2);

    const data = oc.getImageData(0, 0, W, H).data;
    const pts = [];
    const step = Math.max(3, Math.round(fontSize / 24));
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4] > 128) pts.push({ x, y });
      }
    }
    // Fisher-Yates shuffle
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    return pts.slice(0, maxPts || pts.length);
  }

  // ─── Create particles ──────────────────────────────────────
  function createParticles(targets) {
    // K and A positions (left and right thirds of the KOA text)
    const kCenterX = W / 2 - W * 0.12;
    const aCenterX = W / 2 + W * 0.12;

    return targets.map(t => {
      const angle = Math.random() * Math.PI * 2;
      const dist = SCATTER_DIST * (0.3 + Math.random() * 0.9);
      // Scatter origin: alternate between K and A positions
      const originX = Math.random() > 0.5 ? kCenterX : aCenterX;
      const originY = H / 2;
      const scatterAngle = Math.atan2(t.y - originY, t.x - originX) + (Math.random() - 0.5) * 1.2;
      const scatterDist = dist * (0.6 + Math.random() * 0.6);

      return {
        // Formed position (where glyph sits when KOA is formed)
        tx: t.x + (Math.random() - 0.5) * 1.5,
        ty: t.y + (Math.random() - 0.5) * 1.5,
        // Scatter position (where glyph goes when scattered)
        sx: W / 2 + Math.cos(scatterAngle) * scatterDist,
        sy: H / 2 + Math.sin(scatterAngle) * scatterDist,
        // Current position
        x: 0, y: 0,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        size: 6 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        // Rotation drift for scatter
        rotDrift: (Math.random() - 0.5) * 0.8,
      };
    });
  }

  // ─── Resize ────────────────────────────────────────────────
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Rebuild particles for current viewport
    const fontSize = Math.min(W * 0.18, H * 0.28, 180);
    const targets = sampleText('KOA', fontSize, PARTICLE_COUNT);
    particles = createParticles(targets);
  }

  // ─── Phase progress helper ─────────────────────────────────
  function phaseT(range) {
    return clamp((progress - range[0]) / (range[1] - range[0]), 0, 1);
  }

  // ─── Main update ───────────────────────────────────────────
  function update() {
    if (!initialized) return;
    ctx.clearRect(0, 0, W, H);

    // ── Phase 1: Seal appear + revolve ──
    const sealAppearT = phaseT(P.SEAL_IN);
    const sealRevT = phaseT(P.SEAL_REV);

    if (progress < P.SHRINK[1]) {
      // Seal rotation: half scroll speed
      const rotation = progress * 180; // half of scroll degrees
      const sealScale = progress < P.KOA_FORM[0]
        ? easeOutExpo(sealAppearT)
        : (progress < P.KOA_FORM[1]
          ? lerp(1, 0.6, easeInOutCubic(phaseT(P.KOA_FORM)))
          : 0.6);

      const sealOpacity = progress < P.KOA_FORM[0]
        ? easeOutExpo(sealAppearT)
        : (progress < P.KOA_FORM[1]
          ? 1 - easeInOutCubic(phaseT(P.KOA_FORM)) * 0.5
          : (progress < P.SCATTER[0]
            ? 0.5
            : lerp(0.5, 0, easeInOutCubic(phaseT(P.SCATTER)))));

      sealEl.style.transform = `rotate(${rotation}deg) scale(${sealScale})`;
      sealEl.style.opacity = sealOpacity;
    } else {
      sealEl.style.opacity = 0;
    }

    // ── Phase 2: KOA formation ──
    if (progress >= P.KOA_FORM[0] && progress < P.SCATTER[1]) {
      const formT = easeOutQuart(phaseT(P.KOA_FORM));
      const scatterT = progress >= P.SCATTER[0]
        ? easeInOutCubic(phaseT(P.SCATTER))
        : 0;

      // Canvas opacity: fade in during form, fade out during scatter
      const canvasOpacity = progress < P.SCATTER[0]
        ? formT
        : 1 - scatterT;

      canvas.style.opacity = canvasOpacity;

      for (const p of particles) {
        if (progress < P.SCATTER[0]) {
          // Forming: lerp from center (seal) to target positions
          p.x = lerp(W / 2, p.tx, formT);
          p.y = lerp(H / 2, p.ty, formT);
        } else {
          // Scattering from K & A
          const st = scatterT;
          p.x = lerp(p.tx, p.sx, st);
          p.y = lerp(p.ty, p.sy, st);
          // Add rotation drift during scatter
          p.x += Math.sin(st * Math.PI * 2 + p.phase) * st * 40 * p.rotDrift;
          p.y += Math.cos(st * Math.PI * 1.5 + p.phase) * st * 30 * p.rotDrift;
        }

        // Render
        const breathe = Math.sin(performance.now() / 1200 + p.phase) * 0.08 + 0.92;
        const alpha = p.opacity * canvasOpacity * breathe;
        if (alpha < 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${p.size}px "Noto Sans Myanmar", sans-serif`;
        ctx.fillStyle = '#d4af37';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow when formed
        if (formT > 0.7 && scatterT < 0.3) {
          ctx.shadowColor = 'rgba(212,175,55,0.3)';
          ctx.shadowBlur = 6;
        }
        ctx.fillText(p.glyph, p.x, p.y);
        ctx.restore();
      }
    } else {
      canvas.style.opacity = 0;
    }

    // ── Phase 3: Tagline cycle ──
    updateTaglines();

    // ── Phase 5: Shrink into banner logo ──
    if (progress >= P.SHRINK[0] && progress < P.SHRINK[1]) {
      const shrinkT = easeInOutCubic(phaseT(P.SHRINK));
      // The KOA text (if visible) shrinks and moves to header position
      // We handle this via canvas opacity fade + header logo emphasis
      const headerLogo = document.querySelector('.logo');
      if (headerLogo) {
        headerLogo.style.transform = `scale(${1 + shrinkT * 0.15})`;
        headerLogo.style.opacity = 0.7 + shrinkT * 0.3;
      }
    }

    // ── Phase 6: Section fade in ──
    if (progress >= P.SECTION_IN[0]) {
      const sectionT = easeOutExpo(phaseT(P.SECTION_IN));
      // Trigger section reveal via custom event
      document.dispatchEvent(new CustomEvent('koa-hero-complete', {
        detail: { progress: sectionT }
      }));
    }

    // ── Scroll prompt: hide once scrolling starts ──
    if (promptEl) {
      if (progress > 0.02) {
        promptEl.classList.add('ht-hidden');
      } else {
        promptEl.classList.remove('ht-hidden');
      }
    }
  }

  // ─── Tagline management ────────────────────────────────────
  function updateTaglines() {
    const words = taglineEl.querySelectorAll('.ht-word');
    if (!words.length) return;

    if (progress < P.TAG_CYCLE[0] || progress >= P.TAG_CYCLE[1]) {
      // Outside tagline phase
      taglineEl.style.opacity = 0;
      words.forEach(w => {
        w.classList.remove('ht-visible', 'ht-exit');
      });
      currentTagline = -1;
      return;
    }

    const tagProgress = phaseT(P.TAG_CYCLE);
    const tagCount = TAGLINES.length;
    const perTag = 1 / tagCount;
    const idx = Math.min(Math.floor(tagProgress / perTag), tagCount - 1);
    const withinT = (tagProgress - idx * perTag) / perTag;

    // Position tagline below where KOA was
    const koaVisible = progress >= P.KOA_FORM[0] && progress < P.SCATTER[1];
    const tagTop = koaVisible ? '58%' : '52%';
    taglineEl.style.top = tagTop;
    taglineEl.style.left = '50%';
    taglineEl.style.transform = 'translateX(-50%)';
    taglineEl.style.opacity = 1;

    if (idx !== currentTagline) {
      currentTagline = idx;
      // Reset all words
      words.forEach(w => {
        w.classList.remove('ht-visible', 'ht-exit');
      });
    }

    const word = words[idx];
    if (!word) return;

    // Sub-phases within each tagline display:
    // 0.0–0.25: blur-sweep in
    // 0.25–0.75: hold (visible)
    // 0.75–1.0: blur-sweep out
    if (withinT < 0.25) {
      // Sweep in
      word.classList.add('ht-visible');
      word.classList.remove('ht-exit');
      // Stagger individual word children if any (for sweep effect)
      const sweepT = withinT / 0.25;
      word.style.transitionDelay = '0s';
      word.style.opacity = sweepT;
      word.style.filter = `blur(${(1 - sweepT) * 14}px)`;
      word.style.transform = `translateY(${(1 - sweepT) * 10}px)`;
    } else if (withinT < 0.75) {
      // Hold
      word.classList.add('ht-visible');
      word.classList.remove('ht-exit');
      word.style.opacity = '';
      word.style.filter = '';
      word.style.transform = '';
    } else {
      // Sweep out
      const exitT = (withinT - 0.75) / 0.25;
      word.classList.remove('ht-visible');
      word.classList.add('ht-exit');
      word.style.opacity = 1 - exitT;
      word.style.filter = `blur(${exitT * 14}px)`;
      word.style.transform = `translateY(${-exitT * 10}px)`;
    }
  }

  // ─── Scroll handler ────────────────────────────────────────
  function onScroll() {
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    const heroH = heroEl.offsetHeight;
    const viewH = window.innerHeight;
    // Progress: 0 when hero top is at viewport top, 1 when hero bottom reaches viewport top
    const rawProgress = -rect.top / (heroH - viewH);
    progress = clamp(rawProgress, 0, 1);

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    }
  }

  // ─── Init ──────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('hero-koa-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    sealEl = document.getElementById('hero-seal');
    taglineEl = document.getElementById('hero-tagline');
    promptEl = document.getElementById('hero-scroll-prompt');
    heroEl = document.getElementById('hero');

    if (!heroEl || !sealEl || !taglineEl) return;

    resize();
    window.addEventListener('resize', () => {
      resize();
      update();
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial render
    update();
    initialized = true;

    console.log('KOA Hero Scroll Controller initialized');
  }

  // ─── Auto-init when DOM ready ──────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.KOAHero = {
    init,
    update,
    getProgress: () => progress,
  };
})();
