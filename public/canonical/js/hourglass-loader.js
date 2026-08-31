// KOA Glyph Formation System — Scroll-Driven Edition
// Loading: glyphs converge smoothly to form KOA → subtitle fades in
// Sections: scroll-driven — glyphs form Burmese numerals as reverse scatter
//   progress 0 = scattered, 0.35 = formed, 0.65 = hold, 1.0 = scattered (exaggerated)
// No spring physics — smooth easing only. Scrub-friendly, pausable mid-animation.
// Mini glyphs replace the Burmese numeral outline — no solid yellow symbols.

(() => {
  'use strict';

  const canvas = document.getElementById('hourglass-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ─── Glyph pools ───────────────────────────────────────────
  const GLYPHS = [
    'က','ခ','ဂ','ဃ','င','စ','ဆ','၇','ည','တ',
    'ထ','ဒ','ဓ','န','ပ','ဖ','ဗ','ဘ','မ','ယ',
    'ရ','လ','ဝ','သ','ဟ','အ'
  ];
  const BURMESE_NUMS = ['၁','၂','၃','၄','၅'];

  // ─── State ─────────────────────────────────────────────────
  let W, H, dpr;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let animId = null;
  let loaderDone = false;

  // Section scroll-driven state
  let sectionActive = false;
  let sectionProgress = 0;   // 0 = scattered, ~0.35 = formed, 1 = scattered (exaggerated)
  let currentSectionNum = '';

  // ─── Timing (loader only, ms) ──────────────────────────────
  const SCATTER_DUR  = 1200;
  const FORM_DUR     = 2200;
  const HOLD_DUR     = 2000;
  const FADEOUT_DUR  = 1000;

  // ─── Section config ────────────────────────────────────────
  const SCATTER_DIST   = 500;   // base scatter distance (px)
  const REV_SCATTER    = 900;   // reverse scatter distance (wider, more exaggerated)
  const FORM_END       = 0.35;  // scatter→formed completes at this progress
  const HOLD_END       = 0.65;  // hold ends, reverse scatter begins
  const PARTICLE_COUNT = 180;

  // ─── Easing (smooth, no bounce) ────────────────────────────
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const lerp = (a, b, t) => a + (b - a) * t;

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
  }

  // ─── Text sampling: render text, return pixel positions ────
  function sampleText(text, fontSize, maxPts, fontFamily) {
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const oc = off.getContext('2d');
    oc.fillStyle = '#000';
    oc.fillRect(0, 0, W, H);
    oc.fillStyle = '#fff';
    oc.font = `500 ${fontSize}px ${fontFamily || '"Playfair Display", Georgia, serif'}`;
    oc.textAlign = 'center';
    oc.textBaseline = 'middle';
    oc.fillText(text, W / 2, H / 2);

    const data = oc.getImageData(0, 0, W, H).data;
    const pts = [];
    const step = Math.max(2, Math.round(fontSize / 28));
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4] > 128) pts.push({ x, y });
      }
    }
    // Fisher-Yates shuffle, then take maxPts
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    return pts.slice(0, maxPts || pts.length);
  }

  // ─── Create particles with home (scatter) and target (formed) positions ──
  function createParticles(targets, scatterDist) {
    const sd = scatterDist || SCATTER_DIST;
    return targets.map(t => {
      const angle = Math.random() * Math.PI * 2;
      const dist = sd * (0.4 + Math.random() * 0.8);
      const depth = Math.random();
      return {
        // Scatter home position (where particle sits when progress = 0 or 1)
        hx: W / 2 + Math.cos(angle) * dist,
        hy: H / 2 + Math.sin(angle) * dist,
        // Formed target position (where particle sits when progress ≈ 0.35)
        tx: t.x + (Math.random() - 0.5) * 1.5,
        ty: t.y + (Math.random() - 0.5) * 1.5,
        // Current interpolated position
        x: 0, y: 0,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        size: 7 + depth * 11,
        opacity: 0.15 + depth * 0.50,
        depth,
        phase: Math.random() * Math.PI * 2,
        // Reverse scatter extras — rotation drift for exaggerated feel
        rotDrift: (Math.random() - 0.5) * 0.6,
        sizeGrow: 1 + Math.random() * 0.4,
      };
    });
  }

  // ─── Render particles at current positions ─────────────────
  function renderParticles(globalAlpha, goldShift) {
    const now = performance.now();
    for (const p of particles) {
      const breathe = Math.sin(now / 1100 + p.phase) * 0.1 + 0.9;
      const alpha = p.opacity * globalAlpha * breathe;
      if (alpha < 0.01) continue;

      const r = Math.round(200 + goldShift * 55);
      const g = Math.round(195 + goldShift * 35);
      const b = Math.round(185 - goldShift * 90);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${p.size}px "Noto Sans Myanmar", sans-serif`;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Depth-based glow for near particles when formed
      if (p.depth > 0.7 && goldShift > 0.4) {
        ctx.shadowColor = `rgba(212,175,55,${0.2 * goldShift})`;
        ctx.shadowBlur = 4 + p.depth * 5;
      }
      ctx.fillText(p.glyph, p.x, p.y);
      ctx.restore();
    }
  }

  // ─── Hourglass outline (loader decoration) ─────────────────
  function drawHourglass(cx, cy, hW, hH, nW, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(212,175,55,0.5)';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(212,175,55,0.25)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx - hW, cy - hH);
    ctx.quadraticCurveTo(cx - nW * 2.5, cy, cx - nW, cy);
    ctx.quadraticCurveTo(cx - nW * 2.5, cy, cx - hW, cy + hH);
    ctx.moveTo(cx + hW, cy - hH);
    ctx.quadraticCurveTo(cx + nW * 2.5, cy, cx + nW, cy);
    ctx.quadraticCurveTo(cx + nW * 2.5, cy, cx + hW, cy + hH);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - hW - 8, cy - hH);
    ctx.lineTo(cx + hW + 8, cy - hH);
    ctx.moveTo(cx - hW - 8, cy + hH);
    ctx.lineTo(cx + hW + 8, cy + hH);
    ctx.stroke();
    ctx.shadowBlur = 0;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
    grd.addColorStop(0, 'rgba(212,175,55,0.08)');
    grd.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cx - 35, cy - 35, 70, 70);
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  //  LOADER ANIMATION  (time-based, one-shot intro)
  //  Smooth easing only — no spring physics.
  // ═══════════════════════════════════════════════════════════
  let loaderPhase = 'scatter';
  let loaderPhaseStart = 0;

  function startLoader() {
    resize();
    loaderPhaseStart = performance.now();
    loaderPhase = 'scatter';

    const fontSize = Math.min(W * 0.22, H * 0.35, 220);
    const targets = sampleText('KOA', fontSize, Math.floor(120 + W * 0.06));
    particles = createParticles(targets, SCATTER_DIST);
    // Initialize positions to scatter home
    for (const p of particles) { p.x = p.hx; p.y = p.hy; }

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', () => { if (!sectionActive) resize(); });
    tick();
  }

  function tick() {
    if (loaderDone) return;
    const now = performance.now();
    const elapsed = now - loaderPhaseStart;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const hgH = Math.min(H * 0.22, 160);
    const hgW = Math.min(W * 0.12, 90);
    const nW = 6;

    if (loaderPhase === 'scatter') {
      // Free drift — glyphs float gently
      for (const p of particles) {
        p.x += Math.sin(now / 3000 + p.phase) * 0.3;
        p.y += Math.cos(now / 2500 + p.phase) * 0.2;
      }
      drawHourglass(cx, cy, hgW, hgH, nW, 0.35);
      renderParticles(0.55, 0);
      if (elapsed > SCATTER_DUR) { loaderPhase = 'form'; loaderPhaseStart = now; }

    } else if (loaderPhase === 'form') {
      // Smooth converge to KOA — eased interpolation, no springs
      const t = Math.min(1, elapsed / FORM_DUR);
      const ease = easeInOutCubic(t);
      for (const p of particles) {
        p.x = lerp(p.hx, p.tx, ease);
        p.y = lerp(p.hy, p.ty, ease);
      }
      drawHourglass(cx, cy, hgW, hgH, nW, 0.5);
      renderParticles(1, ease);
      if (elapsed > FORM_DUR) { loaderPhase = 'hold'; loaderPhaseStart = now; }

    } else if (loaderPhase === 'hold') {
      // KOA formed, subtitle fades in
      for (const p of particles) { p.x = p.tx; p.y = p.ty; }
      drawHourglass(cx, cy, hgW, hgH, nW, 0.3);
      renderParticles(1, 1);
      const t = Math.min(1, elapsed / HOLD_DUR);
      ctx.save();
      ctx.globalAlpha = t * 0.7;
      ctx.font = `700 ${Math.min(W * 0.22, 220)}px "Playfair Display", Georgia, serif`;
      ctx.fillStyle = '#d4af37';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(212,175,55,0.5)';
      ctx.shadowBlur = 30;
      ctx.fillText('KOA', cx, cy);
      ctx.restore();
      if (elapsed > HOLD_DUR) { loaderPhase = 'fadeout'; loaderPhaseStart = now; }

    } else if (loaderPhase === 'fadeout') {
      const t = Math.min(1, elapsed / FADEOUT_DUR);
      for (const p of particles) { p.x = p.tx; p.y = p.ty; }
      renderParticles(1 - t, 1);
      ctx.save();
      ctx.globalAlpha = 0.7 + t * 0.3;
      ctx.font = `700 ${Math.min(W * 0.22, 220)}px "Playfair Display", Georgia, serif`;
      ctx.fillStyle = '#d4af37';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(212,175,55,0.5)';
      ctx.shadowBlur = 30;
      ctx.fillText('KOA', W / 2, H / 2);
      ctx.restore();
      if (t >= 1) {
        loaderDone = true;
        cancelAnimationFrame(animId);
        ctx.clearRect(0, 0, W, H);
        const loader = document.getElementById('loader');
        if (loader) {
          loader.classList.add('loaded');
          setTimeout(() => loader.remove(), 1000);
        }
        return;
      }
    }
    animId = requestAnimationFrame(tick);
  }

  // ═══════════════════════════════════════════════════════════
  //  SECTION SCROLL-DRIVEN FORMATION
  //  Glyphs form Burmese numerals as reverse scatter.
  //  Driven by scroll position — scrub-friendly, pausable mid-animation.
  //  No spring physics. No solid Burmese numeral rendering.
  //  Reverse scatter is slower and more exaggerated.
  // ═══════════════════════════════════════════════════════════

  // Prepare particles for a new section numeral.
  // Particles keep their current visual positions; only targets change.
  function setSectionTargets(chapterIdx) {
    if (chapterIdx < 1 || chapterIdx > 5) return;
    currentSectionNum = BURMESE_NUMS[chapterIdx - 1];
    const fontSize = Math.min(W * 0.28, H * 0.4, 280);
    const targets = sampleText(
      currentSectionNum, fontSize, PARTICLE_COUNT,
      '"Noto Sans Myanmar", sans-serif'
    );
    particles = createParticles(targets, REV_SCATTER);
    // Start at current section progress (smooth transition)
    applyProgress(sectionProgress);
  }

  // Map scroll progress [0,1] to particle positions.
  // 0 → scattered (home positions)
  // 0–FORM_END → smooth converge to formed targets
  // FORM_END–HOLD_END → hold at targets
  // HOLD_END–1 → exaggerated reverse scatter (wider, slower)
  function applyProgress(progress) {
    let formT;

    if (progress <= FORM_END) {
      // Forward formation: scatter → formed (smooth ease)
      const raw = progress / FORM_END;
      formT = easeOutQuart(raw);
    } else if (progress <= HOLD_END) {
      // Hold: fully formed
      formT = 1;
    } else {
      // Reverse scatter: formed → scattered (slower, exaggerated)
      const raw = (progress - HOLD_END) / (1 - HOLD_END);
      const eased = easeInOutCubic(raw);
      formT = 1 - eased;  // 1→0 as reverse progresses
    }

    for (const p of particles) {
      p.x = lerp(p.hx, p.tx, formT);
      p.y = lerp(p.hy, p.ty, formT);

      // Exaggerated reverse scatter: extra drift + size growth
      if (progress > HOLD_END) {
        const revT = (progress - HOLD_END) / (1 - HOLD_END);
        const drift = revT * 60 * p.depth;
        p.x += Math.sin(revT * Math.PI * 2 + p.phase) * drift;
        p.y += Math.cos(revT * Math.PI * 1.5 + p.phase) * drift * 0.7;
        p.size = lerp(p.size, p.size * p.sizeGrow, revT * 0.3);
      }
    }
  }

  // Called from main.js on every scroll frame.
  // chapterIdx: 1-5 for chapters, 0 for hero.
  // progress: 0 = scattered, ~0.35 = formed, 1 = scattered (exaggerated).
  function updateSectionProgress(chapterIdx, progress) {
    if (chapterIdx < 1 || chapterIdx > 5) {
      if (sectionActive) {
        sectionActive = false;
        sectionProgress = 0;
        ctx.clearRect(0, 0, W, H);
      }
      return;
    }

    if (!sectionActive || currentSectionNum !== BURMESE_NUMS[chapterIdx - 1]) {
      sectionActive = true;
      resize();
      setSectionTargets(chapterIdx);
    }

    sectionProgress = Math.max(0, Math.min(1, progress));
    applyProgress(sectionProgress);

    // Render the section frame
    ctx.clearRect(0, 0, W, H);

    // Opacity: fade in at start, fade out at end
    let alpha = 1;
    if (sectionProgress < 0.05) alpha = sectionProgress / 0.05;
    if (sectionProgress > 0.92) alpha = (1 - sectionProgress) / 0.08;
    alpha = Math.max(0, Math.min(1, alpha));

    renderParticles(alpha, 0.7);

    // Subtle center glow when fully formed
    if (sectionProgress > FORM_END && sectionProgress < HOLD_END) {
      const cx = W / 2, cy = H / 2;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      glow.addColorStop(0, `rgba(212,175,55,${0.04 * alpha})`);
      glow.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 200, cy - 200, 400, 400);
    }
  }

  // ─── Mouse tracking ───────────────────────────────────────
  function onMouse(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  // ─── Init & Export ─────────────────────────────────────────
  function init() {
    const start = () => setTimeout(startLoader, 100);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      setTimeout(start, 500);
    }
  }

  // Public API for main.js
  window.KOAGlyphs = {
    init,
    updateSectionProgress,   // (chapterIdx, progress) — call on every scroll frame
    isSectionActive: () => sectionActive,
  };
})();
