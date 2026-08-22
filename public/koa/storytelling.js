/* ==========================================================================
   KOA — Karen Organization of America · storytelling engine (Signature Motion)
   -------------------------------------------------------------------------
   One engine, four layers:

   1. GlyphStage — a fixed, volumetric canvas of Latin + S'gaw Karen glyphs.
      Modes:
        field     — wandering background field, denser & subtler, occluded by
                    foreground DOM elements (only visible between elements)
        drift     — ambient dust with pointer parallax + scroll streaks
        arrival   — the KOA wordmark built FROM glyphs: cursor-reactive,
                    rises on scroll, disperses, hands off to the film
        word/loom — pixel-sampled words + the Karen diamond-weave frame
        syllable  — C(C)V+T syllable assembly cinematic (chaos → structure)
      Plus the RAIN: intermittent vertical glyph columns that spawn at
      random places, live briefly, and leave at random times.

   2. The Arrival — the prologue scroll stage (seal with sunshine halo →
      seal grows → KOA levels → K/A glyphs → O converges from offscreen)
      scroll velocity drives the barely-visible rays.

   3. Word assembly — paragraphs that solidify one randomly-ordered word
      at a time; parallax drift with fade boundaries at top/bottom.

   4. Chapter numerals — Burmese numerals in background, flashing to Arabic
      intermittently.

   Motion is a garnish, never the meal. prefers-reduced-motion and the
   manual Motion toggle are honored everywhere.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOn = !prefersReduced;
  document.body.dataset.motion = motionOn ? "on" : "off";

  var MYAN = ["၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  var ARABIC = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var GLYPH_SET = "KOAKAREက" + "AKOကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇";
  var GLYPH_SET_DENSE = "ကခ�ဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ" +
    "က ခ ဂ ဃ င စ ဆ ဇ ည တ ထ ဒ ဓ န ပ ဖ ဗ ဘ မ ယ ရ လ ဝ သ ဟ အ" +
    "၁ ၂ ၃ ၄ ၅ ၆ ၇ ၈ ၉ KOA KOA";

  /* ======================================================================
     GLYPH STAGE
     ====================================================================== */
  var GlyphStage = (function () {
    var canvas, ctx, W = 0, H = 0, DPR = 1;
    var particles = [], targets = null, formationWord = null, formationMode = null;
    var tintColor = null;
    var fontsReady = false;
    var pendingWord = null;
    var pendingLoom = false;
    var pendingArrival = false;
    var raf = null;
    var active = false;
    var staticDrawn = false;
    var pointerX = 0, pointerY = 0;
    var scrollVel = 0, lastScrollY = window.scrollY, lastScrollT = performance.now();

    /* arrival state ------------------------------------------------------ */
    var arrivalAnchorY = 0.5;
    var arrivalScale = 1;
    var arrivalScatter = 0;
    var arrivalCursor = true;
    var arrivalPhase = "seal"; // "seal" | "grow" | "level" | "K_A" | "O_converge" | "risen" | "dispersing" | "done"
    var arrivalProgress = 0;   // 0..1 within current phase
    var sealGrowth = 1;        // 1 = normal size, grows to ~3 during "grow"
    var O_convergeP = 0;       // 0..1 for O converging from off-screen
    var rayIntensity = 0;      // 0..1, driven by scroll velocity

    /* rain state ---------------------------------------------------------- */
    var rainOn = false;
    var rainBoost = 0;
    var rainCols = [];
    var RAIN_MAX = window.innerWidth < 720 ? 4 : 7;

    /* background field (always on, occluded by foreground) ---------------- */
    var bgField = { 
      on: true, 
      particles: [], 
      density: 0.45, 
      wanderStrength: 0.006,
      maxAlpha: 0.06 
    };
    var occlusionRects = [];

    function glyphs() { return GLYPH_SET; }
    function glyphsDense() { return GLYPH_SET_DENSE; }

    function makeParticles() {
          var n = window.innerWidth < 720 ? 60 : 150;
          particles = [];
          var set = glyphs();
          for (var i = 0; i < n; i++) {
            var z = Math.random(); // volumetric depth: 0 = far, 1 = near
            particles.push({
              ch: set.charAt(Math.floor(Math.random() * set.length)),
              x: Math.random() * W,
              y: Math.random() * H,
              z: z,
              vx: (Math.random() - 0.5) * 0.18,
              vy: (Math.random() - 0.5) * 0.14,
              vz: (Math.random() - 0.5) * 0.0016,
              size: 11 + Math.random() * 13,
              baseAlpha: 0.05 + Math.random() * 0.10,
              alpha: 0,
              phase: Math.random() * Math.PI * 2,
              speed: 0.5 + Math.random() * 1.2,
              depth: 0.4 + z * 0.6,
              tx: 0, ty: 0, hasTarget: false,
              wx: 0, wy: 0, hasWay: false,   // loom thread waypoint (curved flight)
              bx: 0, by: 0, hasBase: false,  // arrival base offsets (centered)
              sx: 0, sy: 0, sf: 0,           // arrival scatter destination + factor
              k: 0.045 + Math.random() * 0.05   // spring stiffness
            });
          }

          /* background field particles — denser, subtler, occluded by DOM */
          if (bgField.on) {
            var bn = Math.floor((W * H / 15000) * bgField.density);
            bn = Math.min(Math.max(bn, 80), 400);
            bgField.particles = [];
            var denseSet = glyphsDense();
            for (i = 0; i < bn; i++) {
              bgField.particles.push({
                ch: denseSet.charAt(Math.floor(Math.random() * denseSet.length)),
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.03,
                vy: (Math.random() - 0.5) * 0.02,
                size: 6 + Math.random() * 8,
                alpha: Math.random() * bgField.maxAlpha,
                phase: Math.random() * Math.PI * 2,
                speed: 0.2 + Math.random() * 0.4,
                wanderX: Math.random() * 1000,
                wanderY: Math.random() * 1000
              });
            }
          }
        }

    function resize() {
          DPR = Math.min(2, window.devicePixelRatio || 1);
          W = window.innerWidth;
          H = window.innerHeight;
          if (!canvas) return;
          canvas.width = Math.round(W * DPR);
          canvas.height = Math.round(H * DPR);
          canvas.style.width = W + "px";
          canvas.style.height = H + "px";
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
          /* rebuild background field on resize */
          if (bgField.on) makeParticles();
        }

    function init() {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.className = "glyph-stage";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      resize();
      makeParticles();
      window.addEventListener("resize", function () {
        if (raf) cancelAnimationFrame(raf);
        resize();
        RAIN_MAX = window.innerWidth < 720 ? 4 : 7;
        /* re-form whatever is on stage at the new size */
        if (formationMode === "arrival") formArrival(true);
        else if (formationMode === "loom") formLoom(formationWord, true);
        else if (formationMode === "word") form(formationWord, true);
        if (active && motionOn) { raf = requestAnimationFrame(frame); }
        else { drawStatic(); }
      });
      window.addEventListener("pointermove", function (e) {
        pointerX = (e.clientX / W - 0.5) * 2;
        pointerY = (e.clientY / H - 0.5) * 2;
      }, { passive: true });
      window.addEventListener("scroll", function () {
        var now = performance.now();
        var dt = Math.max(16, now - lastScrollT);
        var inst = ((window.scrollY - lastScrollY) / dt) * 16;
        scrollVel = scrollVel * 0.78 + inst * 0.22;
        lastScrollY = window.scrollY; lastScrollT = now;
      }, { passive: true });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          fontsReady = true;
          if (pendingArrival) { pendingArrival = false; formArrival(); return; }
          if (pendingWord) {
            var w = pendingWord, loom = pendingLoom;
            pendingWord = null; pendingLoom = false;
            if (loom) formLoom(w); else form(w);
          }
        });
      } else { fontsReady = true; }
    }

    /* Sample a word into target points via an offscreen canvas.
       Returns points centered on (cx, cy), scaled to targetW. */
    function samplePoints(word, cx, cy, targetW, step, maxH) {
      var off = document.createElement("canvas");
      var octx = off.getContext("2d");
      var fs = 260;
      var font = "600 " + fs + "px 'Noto Sans Myanmar','Space Grotesk',serif";
      octx.font = font;
      var wpx = Math.max(40, octx.measureText(word).width);
      off.width = Math.ceil(wpx) + 60;
      off.height = Math.ceil(fs * 1.7);
      octx.font = font;
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(word, off.width / 2, off.height / 2);
      var data;
      try { data = octx.getImageData(0, 0, off.width, off.height).data; }
      catch (e) { return []; }
      var pts = [];
      for (var y = 0; y < off.height; y += step) {
        for (var x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 120) pts.push([x, y]);
        }
      }
      if (!pts.length) return [];
      var scale = Math.min(targetW / off.width, (maxH || H * 0.34) / off.height);
      var ox = cx - (off.width * scale) / 2;
      var oy = cy - (off.height * scale) / 2;
      for (var i = 0; i < pts.length; i++) {
        pts[i][0] = ox + pts[i][0] * scale;
        pts[i][1] = oy + pts[i][1] * scale;
      }
      return pts;
    }

    function sampleWord(word, cx, cy, targetW) {
      var pts = samplePoints(word, cx, cy, targetW, 5);
      // shuffle + cap to particle count
      for (var j = pts.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var t = pts[j]; pts[j] = pts[k]; pts[k] = t;
      }
      return pts.slice(0, particles.length);
    }

    /* Sample a diamond LOOM — the Karen weaving motif. Nested diamond
       lattice + weft threads that frame the chapter numeral like a stage. */
    function sampleLoom(cx, cy, r) {
      var pts = [];
      var push = function (x, y) { pts.push([x, y]); };
      // two nested diamond frames (classic Karen cloth: diamond in diamond)
      var rings = [1, 0.74];
      for (var q = 0; q < rings.length; q++) {
        var rr = r * rings[q];
        var corners = [[cx, cy - rr], [cx + rr, cy], [cx, cy + rr], [cx - rr, cy]];
        for (var s = 0; s < 4; s++) {
          var a = corners[s], b = corners[(s + 1) % 4];
          var seg = q === 0 ? 16 : 11;
          for (var i = 1; i < seg; i++) {
            var t = i / seg;
            push(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
          }
        }
      }
      // weft threads: faint horizontal passes across the inner diamond
      var inner = r * 0.52;
      for (var row = -2; row <= 2; row++) {
        var yy = cy + (inner * row) / 3;
        var half = inner * (1 - Math.abs(row) / 3);
        for (var c = -3; c <= 3; c++) push(cx + (half * c) / 3, yy);
      }
      // four corner accents just outside the frame
      var out = r * 1.13;
      push(cx, cy - out); push(cx + out, cy); push(cx, cy + out); push(cx - out, cy);
      return pts;
    }

    function assignTargets(pts, loomPts) {
      // shuffle both pools; interleave loom (60%) + word (40%)
      var shuffle = function (arr) {
        for (var j = arr.length - 1; j > 0; j--) {
          var k = Math.floor(Math.random() * (j + 1));
          var t = arr[j]; arr[j] = arr[k]; arr[k] = t;
        }
        return arr;
      };
      shuffle(pts); shuffle(loomPts);
      var n = particles.length;
      var nLoom = loomPts.length ? Math.round(n * 0.58) : 0;
      nLoom = Math.min(nLoom, loomPts.length);
      var nWord = Math.min(pts.length, n - nLoom);
      targets = pts.slice(0, nWord).concat(loomPts.slice(0, nLoom));
      for (var i = 0; i < n; i++) {
        var p = particles[i];
        p.hasWay = false; p.hasBase = false;
        if (i < nWord) {
          p.tx = pts[i][0]; p.ty = pts[i][1]; p.hasTarget = true;
        } else if (i < nWord + nLoom) {
          var lp = loomPts[i - nWord];
          p.tx = lp[0]; p.ty = lp[1]; p.hasTarget = true;
          // curved thread flight: waypoint on an arc between here and target
          var mx = (p.x + lp[0]) / 2, my = (p.y + lp[1]) / 2;
          var dx = lp[0] - p.x, dy = lp[1] - p.y;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          var side = (i % 2 === 0) ? 1 : -1;
          p.wx = mx + (-dy / len) * len * 0.28 * side;
          p.wy = my + (dx / len) * len * 0.28 * side;
          p.hasWay = true;
        } else { p.hasTarget = false; }
      }
    }

    function form(word, silent) {
      if (!canvas) init();
      if (!fontsReady) { pendingWord = word; return; }
      formationWord = word; formationMode = "word";
      var isHome = !!document.querySelector("[data-film]");
      var cx = W / 2;
      var cy = isHome ? H * 0.40 : H * 0.30;
      var tw = Math.min(W * 0.74, 880);
      var pts = sampleWord(word, cx, cy, tw);
      if (!pts.length) { targets = null; return; }
      assignTargets(pts, []);
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    /* THE LOOM — word at the heart, woven diamond lattice framing it. */
    function formLoom(word, silent) {
      if (!canvas) init();
      if (!fontsReady) { pendingWord = word; pendingLoom = true; return; }
      formationWord = word; formationMode = "loom";
      var cx = W / 2;
      var cy = H * 0.42;
      var tw = Math.min(W * 0.5, 460);
      var pts = sampleWord(word, cx, cy, tw);
      var r = Math.min(W, H) * 0.36;
      if (window.innerWidth < 720) r = Math.min(W, H) * 0.42;
      var loomPts = sampleLoom(cx, cy, r);
      if (!pts.length) { form(word, silent); return; }
      assignTargets(pts, loomPts);
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    /* THE ARRIVAL — the KOA wordmark built from glyphs, centered and level.
       Targets are stored as offsets from center so the whole formation can
       rise, grow, and disperse every frame without re-sampling. */
    function formArrival(silent) {
      if (!canvas) init();
      if (!fontsReady) { pendingArrival = true; return; }
      formationWord = "KOA"; formationMode = "arrival";
      var tw = Math.min(W * 0.82, 1000);
      var pts = samplePoints("KOA", 0, 0, tw, 4, H * 0.4);
      if (!pts.length) { targets = null; return; }
      // center offsets
      var cx0 = 0, cy0 = 0;
      for (var i = 0; i < pts.length; i++) { cx0 += pts[i][0]; cy0 += pts[i][1]; }
      cx0 /= pts.length; cy0 /= pts.length;
      for (i = 0; i < pts.length; i++) { pts[i][0] -= cx0; pts[i][1] -= cy0; }
      // shuffle
      for (var j = pts.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var t = pts[j]; pts[j] = pts[k]; pts[k] = t;
      }
      targets = pts.slice(0, particles.length);
      var n = Math.min(targets.length, particles.length);
      for (i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.hasWay = false;
        if (i < n) {
          p.bx = pts[i][0]; p.by = pts[i][1]; p.hasBase = true; p.hasTarget = true;
          // scatter destination: somewhere out toward the edges
          var ang = Math.random() * Math.PI * 2;
          var rad = Math.max(W, H) * (0.55 + Math.random() * 0.5);
          p.sx = W / 2 + Math.cos(ang) * rad;
          p.sy = H * arrivalAnchorY + Math.sin(ang) * rad * 0.7;
          p.sf = 0.55 + Math.random() * 0.75;
          // begin at the seal's heart: the KOA rises off the logo itself
          if (!silent) {
            var d = Math.hypot(p.x - W / 2, p.y - H * 0.5);
            if (d > Math.min(W, H) * 0.34) {
              p.x = W / 2 + (Math.random() - 0.5) * 90;
              p.y = H * 0.5 + (Math.random() - 0.5) * 90;
              p.alpha = 0;
            }
          }
        } else { p.hasBase = false; p.hasTarget = false; }
      }
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    /* live transform of the arrival formation (called from scroll) */
    function arrivalTransform(anchorY, scale, scatter, cursor) {
      arrivalAnchorY = anchorY;
      arrivalScale = scale;
      arrivalScatter = scatter;
      arrivalCursor = cursor !== false;
      if (!motionOn) drawStatic();
    }

    function release() {
      targets = null; formationWord = null; formationMode = null;
      arrivalScatter = 0;
      for (var i = 0; i < particles.length; i++) {
        particles[i].hasTarget = false;
        particles[i].hasWay = false;
        particles[i].hasBase = false;
      }
      if (!motionOn) drawStatic();
    }

    function tint(rgb) { tintColor = rgb; }

    /* ---- the rain ------------------------------------------------------- */
    function setRain(on) { rainOn = on; if (!on) rainCols = []; }
    function boostRain(v) { rainBoost = Math.max(rainBoost * 0.94, v); }

    function spawnRainColumn(now) {
      var set = glyphs();
      var size = 10 + Math.random() * 13;               // different sizes
      var len = 4 + Math.floor(Math.random() * 11);      // different lengths
      var chars = [];
      for (var i = 0; i < len; i++) chars.push(set.charAt(Math.floor(Math.random() * set.length)));
      rainCols.push({
        x: Math.random() * W,
        y: H * (0.05 + Math.random() * 0.55),
        size: size,
        chars: chars,
        vy: 0.14 + Math.random() * 0.4,
        born: now,
        life: 1400 + Math.random() * 2800,               // leaves at random times
        maxAlpha: 0.07 + Math.random() * 0.09
      });
    }

    function updateRain(now) {
      if (!rainOn) return;
      // intermittent spawning: base chance + scroll boost
      var chance = 0.010 + Math.min(0.10, Math.abs(scrollVel) * 0.012) + rainBoost * 0.05;
      if (rainCols.length < RAIN_MAX && Math.random() < chance) spawnRainColumn(now);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (var i = rainCols.length - 1; i >= 0; i--) {
        var c = rainCols[i];
        var age = now - c.born;
        if (age > c.life) { rainCols.splice(i, 1); continue; }
        // envelope: quick fade in, hold, fade out
        var env = age < 380 ? age / 380
          : age > c.life - 620 ? Math.max(0, (c.life - age) / 620)
          : 1;
        c.y += c.vy * (1 + Math.abs(scrollVel) * 0.06);
        ctx.font = c.size + "px 'Noto Sans Myanmar','Space Grotesk',serif";
        ctx.fillStyle = tintColor || "#fff";
        for (var j = 0; j < c.chars.length; j++) {
          var a = c.maxAlpha * env * (1 - j / (c.chars.length + 2));
          if (a < 0.004) continue;
          ctx.globalAlpha = a;
          ctx.fillText(c.chars[j], c.x, c.y + j * c.size * 1.22);
        }
      }
      ctx.globalAlpha = 1;
          }

          /* ---- occlusion map for background field ------------------------------- */
          function buildOcclusionMap() {
            occlusionRects = [];
            var occluders = document.querySelectorAll("[data-glyph-occlude], header, footer, .scene-copy, .scene-media, .split-copy, .split-media, .interlude, .waitlist, .section-head, .stats, .grid-4, .card, .btn-row, .film-label, .film-progress, .film-meta, .chapter-dots");
            for (var i = 0; i < occluders.length; i++) {
              var el = occluders[i];
              var r = el.getBoundingClientRect();
              occlusionRects.push({
                x: r.left - 8,
                y: r.top - 8,
                w: r.width + 16,
                h: r.height + 16
              });
            }
          }

          function isOccluded(x, y) {
            for (var i = 0; i < occlusionRects.length; i++) {
              var r = occlusionRects[i];
              if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return true;
            }
            return false;
          }

          /* ---- draw background field (occluded by foreground) ------------------- */
          function drawBackgroundField(now) {
            var set = glyphsDense();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for (var i = 0; i < bgField.particles.length; i++) {
              var p = bgField.particles[i];
              p.wanderX += 0.01;
              p.wanderY += 0.008;
              var wx = Math.sin(p.wanderX) * bgField.wanderStrength * 40;
              var wy = Math.cos(p.wanderY) * bgField.wanderStrength * 30;
              var px = p.x + wx;
              var py = p.y + wy;
              if (px < -20) px = W + 20;
              if (px > W + 20) px = -20;
              if (py < -20) py = H + 20;
              if (py > H + 20) py = -20;
              p.x = px; p.y = py;
              if (isOccluded(px, py)) continue;
              var flicker = 0.6 + 0.4 * Math.sin(now * 0.0007 * p.speed + p.phase);
              var a = p.alpha * flicker;
              if (a < 0.004) continue;
              ctx.globalAlpha = a;
              ctx.font = p.size + "px 'Noto Sans Myanmar','Space Grotesk',serif";
              ctx.fillStyle = tintColor || "#fff";
              ctx.fillText(p.ch, px, py);
            }
            ctx.globalAlpha = 1;
          }

          /* ---- drawing -------------------------------------------------------- */
    function drawGlyph(p, now, streak) {
      var flicker = 0.72 + 0.28 * Math.sin(now * 0.0011 * p.speed + p.phase);
      var a = p.alpha * flicker;
      if (a < 0.004) return;
      var px = p.x + pointerX * 22 * p.depth;
      var py = p.y + pointerY * 14 * p.depth;
      if (streak > 3) {
        ctx.globalAlpha = a * 0.3;
        ctx.fillText(p.ch, px, py - streak * 1.4);
      }
      ctx.globalAlpha = a;
      if (tintColor && p.hasTarget) ctx.fillStyle = tintColor;
      else ctx.fillStyle = "#fff";
      ctx.fillText(p.ch, px, py);
    }

    function frame(now) {
          raf = null;
          if (!active) return;
          ctx.clearRect(0, 0, W, H);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          var streak = Math.abs(scrollVel);

          /* build occlusion map from DOM elements with data-glyph-occlude */
          buildOcclusionMap();

          /* --- draw background field (occluded by foreground elements) -------- */
          if (bgField.on) drawBackgroundField(now);

          updateRain(now);

          var mpx = W / 2 + pointerX * (W / 2);
          var mpy = H / 2 + pointerY * (H / 2);
          var ay = H * arrivalAnchorY;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (formationMode === "arrival" && p.hasBase) {
          /* the KOA lives here: anchored, scalable, dispersible */
          var tx = W / 2 + p.bx * arrivalScale;
          var ty = ay + p.by * arrivalScale;
          if (arrivalScatter > 0.001) {
            tx += (p.sx - tx) * arrivalScatter * p.sf;
            ty += (p.sy - ty) * arrivalScatter * p.sf;
          }
          p.x += (tx - p.x) * (p.k * 1.5);
          p.y += (ty - p.y) * (p.k * 1.5);
          /* cursor-reactive: the formed glyphs shy away from the hand */
          if (arrivalCursor && arrivalScatter < 0.4) {
            var dx = p.x - mpx, dy = p.y - mpy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130 && d > 0.001) {
              var f = (1 - d / 130) * 8.5;
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            }
          }
          var dd = Math.abs(tx - p.x) + Math.abs(ty - p.y);
          p.alpha += ((dd < 30 ? 0.66 : 0.30) - p.alpha) * 0.06;
        } else if (p.hasTarget) {
          if (p.hasWay) {
            // thread flight: pulled toward the arc waypoint first, then target
            var dw = Math.abs(p.wx - p.x) + Math.abs(p.wy - p.y);
            if (dw > 26) {
              p.x += (p.wx - p.x) * (p.k * 1.6);
              p.y += (p.wy - p.y) * (p.k * 1.6);
            } else { p.hasWay = false; }
          }
          p.x += (p.tx - p.x) * p.k;
          p.y += (p.ty - p.y) * p.k;
          var d2 = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y);
          var settled = d2 < 30;
          p.alpha += ((settled ? 0.62 : 0.30) - p.alpha) * 0.06;
        } else {
          p.x += p.vx; p.y += p.vy;
          // volumetric drift: particles slowly breathe through depth
          p.z += p.vz;
          if (p.z < 0.05 || p.z > 1) p.vz = -p.vz;
          if (p.x < -30) p.x = W + 20; if (p.x > W + 30) p.x = -20;
          if (p.y < -30) p.y = H + 20; if (p.y > H + 30) p.y = -20;
          p.alpha += (p.baseAlpha - p.alpha) * 0.04;
        }
        var zs = 0.72 + p.z * 0.55; // depth scale: far glyphs small, near glyphs big
        ctx.font = Math.max(7, p.size * zs) + "px 'Noto Sans Myanmar','Space Grotesk',serif";
        drawGlyph(p, now, streak);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      scrollVel *= 0.9;
      rainBoost *= 0.97;
      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var now = performance.now();
      var ay = H * arrivalAnchorY;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (formationMode === "arrival" && p.hasBase) {
          p.x = W / 2 + p.bx * arrivalScale;
          p.y = ay + p.by * arrivalScale;
          p.alpha = 0.58;
        } else if (p.hasTarget) { p.x = p.tx; p.y = p.ty; p.alpha = 0.55; }
        else { p.alpha = p.baseAlpha; }
        var zs = 0.72 + p.z * 0.55;
        ctx.font = Math.max(7, p.size * zs) + "px 'Noto Sans Myanmar','Space Grotesk',serif";
        drawGlyph(p, now, 0);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      staticDrawn = true;
    }

    function setActive(on) {
      active = on;
      if (!canvas) return;
      if (on) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        drawStatic();
      }
    }

    return {
      init: init,
      form: form,
      formLoom: formLoom,
      formArrival: formArrival,
      arrivalTransform: arrivalTransform,
      release: release,
      tint: tint,
      setRain: setRain,
      boostRain: boostRain,
      setActive: setActive,
      isFormed: function () { return !!targets; },
      mode: function () { return formationMode; },
      word: function () { return formationWord; },
      numerals: MYAN
    };
  })();

  /* ======================================================================
     WORD ASSEMBLY — paragraphs solidify one randomly-ordered word at a time.
     The text is already in the HTML; we only wrap + reveal when motion is on.
     ====================================================================== */
  function assembleEl(el) {
    if (!el || el.dataset.assembled) return;
    el.dataset.assembled = "1";
    if (!motionOn || prefersReduced) return; // text stays visible as-is
    var words = el.textContent.trim().split(/\s+/);
    if (words.length < 3) return;
    el.textContent = "";
    var spans = [];
    for (var i = 0; i < words.length; i++) {
      var s = document.createElement("span");
      s.className = "aw";
      s.textContent = words[i] + (i < words.length - 1 ? " " : "");
      s.style.opacity = "0";
      el.appendChild(s);
      spans.push(s);
    }
    var order = spans.map(function (_, idx) { return idx; });
    for (var j = order.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = order[j]; order[j] = order[k]; order[k] = t;
    }
    var n = 0;
    var iv = setInterval(function () {
      if (n >= order.length) { clearInterval(iv); return; }
      spans[order[n++]].style.opacity = "1";
    }, 34);
  }

  /* ---- Motion toggle — one-time chrome binding ---------------------------- */
  var motionBtn = document.querySelector("button[data-motion]");
  function syncMotionBtn() {
    if (!motionBtn) return;
    motionBtn.textContent = motionOn ? "Motion on" : "Motion off";
  }
  syncMotionBtn();
  if (motionBtn) {
    motionBtn.addEventListener("click", function () {
      motionOn = !motionOn;
      document.body.dataset.motion = motionOn ? "on" : "off";
      syncMotionBtn();
      GlyphStage.setActive(motionOn);
    });
  }

  /* ---- Header scroll state — one-time chrome binding ---------------------- */
  var header = document.querySelector("[data-header]");
  function onHeaderScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* ---- Mobile menu — one-time chrome binding ------------------------------- */
  var menuBtn = document.querySelector("[data-menu]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        panel.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Footer year — one-time chrome binding -------------------------------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- GlyphStage + veil boot (chrome, once) -------------------------------- */
  GlyphStage.init();
  GlyphStage.setActive(motionOn);
  // Dev mode (no hash router): clear the intro veil ourselves.
  if (location.hash.indexOf("#/") !== 0 && !window.__koaRouter) {
    var v0 = document.querySelector(".veil");
    if (v0) {
      setTimeout(function () { v0.classList.add("is-clear"); }, 260);
    }
  }

  /* ================= content-scoped init (re-runnable) ==================== */
  var homeScrollHandler = null;
  var homeResizeHandler = null;
  var partnerTimer = null;
  var lastSceneIdx = -1;

  function init() {
    var root = document.getElementById("main") || document;
    var film = root.querySelector("[data-film]");
    var arrivalEl = root.querySelector("[data-arrival]");

    /* drop the previous page's home listeners + timers */
    if (homeScrollHandler) {
      window.removeEventListener("scroll", homeScrollHandler);
      window.removeEventListener("resize", homeResizeHandler);
      homeScrollHandler = homeResizeHandler = null;
    }
    if (partnerTimer) { clearInterval(partnerTimer); partnerTimer = null; }
    document.body.classList.toggle("is-filming", !!film);
    lastSceneIdx = -1;

    /* ---- GlyphStage: formation for this page ------------------------------- */
    var glyphHolder = root.querySelector("[data-glyph-word]");
    GlyphStage.setRain(!!film);
    if (film) {
      // home: the arrival + film drive formations (see updateHome); start assembled
      GlyphStage.formArrival();
      GlyphStage.arrivalTransform(0.42, 1, 0, true);
    } else if (glyphHolder && glyphHolder.dataset.glyphWord) {
      var w = glyphHolder.dataset.glyphWord;
      GlyphStage.release();
      setTimeout(function () {
        // only if we're still on a page that wants this word
        var still = document.querySelector("[data-glyph-word]");
        if (still && still.dataset.glyphWord === w) GlyphStage.form(w);
      }, 380);
    } else {
      GlyphStage.release();
    }

    /* ---- Scroll reveals ---------------------------------------------------- */
    var revealEls = root.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && motionOn) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---- Stagger data-reveal children -------------------------------------- */
    root.querySelectorAll("[data-reveal-stagger]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.setAttribute("data-reveal", "");
        child.setAttribute("data-reveal-delay", String(i % 4));
      });
    });

    /* ---- Word assembly: standalone elements assemble on sight --------------
       Film scenes + the arrival mission are driven by their own choreography
       and marked data-assemble="late" so this observer skips them. */
    var freeAssemble = root.querySelectorAll('[data-assemble]:not([data-assemble="late"])');
    if ("IntersectionObserver" in window && motionOn && !prefersReduced) {
      var aio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { assembleEl(e.target); aio.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      freeAssemble.forEach(function (el) { aio.observe(el); });
    }

    /* ---- Home: THE ARRIVAL + the film, one continuous scroll --------------- */
    if (film && arrivalEl) {
      var scenes = Array.prototype.slice.call(film.querySelectorAll("[data-scene]"));
      var dots = Array.prototype.slice.call(film.querySelectorAll(".chapter-dots li"));
      var bar = film.querySelector(".film-progress i");
      var frameEl = film.querySelector("[data-frame]");
      var total = parseInt(film.dataset.total || "3000", 10);
      var cue = root.querySelector(".scroll-cue");
      var mission = arrivalEl.querySelector('[data-assemble="late"]');
      var ticking = false;
      var control = "arrival"; // who owns the glyph stage right now

      /* chapter color temperature — the film's light changes with the hour */
      var TEMPS = [null, "255,196,140", "238,240,235", "168,196,255", "150,232,222", "255,178,120"];

      function onSceneChange(idx, scene) {
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
        /* the chapter's light */
        var t = TEMPS[idx + 1] || null;
        film.style.setProperty("--chapter-tint", t || "255,255,255");
        document.body.style.setProperty("--chapter-tint", t || "255,255,255");
        GlyphStage.tint(t ? "rgb(" + t + ")" : null);
        /* the KOA's glyphs dissolve into this chapter's woven numeral */
        var num = scene && scene.dataset.glyphNum ? scene.dataset.glyphNum : MYAN[idx];
        GlyphStage.formLoom(num);
        /* and the chapter's words solidify */
        if (scene) {
          var late = scene.querySelector('[data-assemble="late"]');
          if (late) setTimeout(function () { assembleEl(late); }, 420);
        }
      }

      function updateHome() {
        ticking = false;

        /* ---- arrival progress ------------------------------------------ */
        var ah = arrivalEl.offsetHeight - window.innerHeight;
        var aScrolled = Math.min(Math.max(window.scrollY - (arrivalEl.offsetTop || 0), 0), ah);
        var pa = ah > 0 ? aScrolled / ah : 0;

        /* ---- film progress ---------------------------------------------- */
        var fh = film.offsetHeight - window.innerHeight;
        var fScrolled = Math.min(Math.max(window.scrollY - (film.offsetTop || 0), 0), fh);
        var pf = fh > 0 ? fScrolled / fh : 0;
        var filmLive = window.scrollY + window.innerHeight > film.offsetTop + 40 && pf > 0.004;

        if (bar) bar.style.width = (pf * 100).toFixed(2) + "%";
        if (frameEl) frameEl.textContent = String(Math.round(pf * total)).padStart(4, "0");

        var idx = Math.min(scenes.length - 1, Math.floor(pf * scenes.length));
        if (filmLive) {
          scenes.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
        } else {
          scenes.forEach(function (s) { s.classList.remove("active"); });
        }
        if (cue) cue.classList.toggle("is-hidden", pa > 0.03);

        /* ---- arrival phase states (CSS hooks) --------------------------- */
        arrivalEl.classList.toggle("is-assembly", pa > 0.16);
        arrivalEl.classList.toggle("is-risen", pa > 0.46);
        arrivalEl.classList.toggle("is-scattering", pa > 0.72);

        /* ---- who owns the glyphs ---------------------------------------- */
        if (filmLive) {
          if (control !== "film") {
            control = "film";
            lastSceneIdx = -1; // force formation handoff on entry
          }
          if (idx !== lastSceneIdx) { lastSceneIdx = idx; onSceneChange(idx, scenes[idx]); }
        } else {
          if (control !== "arrival") {
            control = "arrival";
            if (GlyphStage.mode() !== "arrival") GlyphStage.formArrival();
            GlyphStage.tint(null);
            film.style.setProperty("--chapter-tint", "255,255,255");
            document.body.style.setProperty("--chapter-tint", "255,255,255");
          }
          /* the choreography: assemble → hold → rise → disperse */
          var assembleP = Math.min(1, Math.max(0, (pa - 0.10) / 0.22));
          var riseP = Math.min(1, Math.max(0, (pa - 0.46) / 0.30));
          var scatterP = Math.min(1, Math.max(0, (pa - 0.74) / 0.24));
          var ease = function (x) { return x * x * (3 - 2 * x); };
          var anchorY = 0.42 - ease(riseP) * 0.24;         // seal line → top third
          var scale = 1 + ease(riseP) * 0.16;               // grows a little
          var scatter = ease(scatterP);
          GlyphStage.arrivalTransform(anchorY, scale, scatter, assembleP > 0.5 && scatter < 0.3);
          GlyphStage.boostRain(scatterP * 0.9 + Math.min(1, Math.abs(window.scrollY - (lastScrollForRain || 0)) / 240) * 0.4);
          lastScrollForRain = window.scrollY;
          /* the mission tells itself once the KOA has risen */
          if (pa > 0.5 && mission) assembleEl(mission);
        }
      }
      var lastScrollForRain = 0;

      homeScrollHandler = function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateHome); }
      };
      homeResizeHandler = updateHome;
      window.addEventListener("scroll", homeScrollHandler, { passive: true });
      window.addEventListener("resize", homeResizeHandler);
      updateHome();
    }

    /* ---- Partner wall (contact) --------------------------------------------
       Three large marks across the screen; one changes at a random interval.
       Real partner logos slot into POOL as {name, role, logo:"assets/…png"}
       the moment a partnership is confirmed — until then the wall honestly
       shows announcement-pending seals, never invented organizations. */
    var partnerStage = root.querySelector("[data-partners]");
    if (partnerStage) {
      var POOL = [
        { mark: "၁", name: "Partner announcement", role: "pending · slot one" },
        { mark: "၂", name: "Partner announcement", role: "pending · slot two" },
        { mark: "၃", name: "Partner announcement", role: "pending · slot three" },
        { mark: "၄", name: "Partner announcement", role: "pending · slot four" },
        { mark: "၅", name: "Partner announcement", role: "pending · slot five" }
      ];
      var slots = Array.prototype.slice.call(partnerStage.querySelectorAll(".partner-slot"));
      var renderSlot = function (slot, item) {
        slot.dataset.mark = item.mark;
        slot.innerHTML =
          '<span class="partner-mark" aria-hidden="true">' + item.mark + '</span>' +
          '<span class="partner-name">' + item.name + '</span>' +
          '<span class="partner-role">' + item.role + '</span>';
      };
      var pickDifferent = function (currentMark) {
        var options = POOL.filter(function (p) { return p.mark !== currentMark; });
        return options[Math.floor(Math.random() * options.length)];
      };
      slots.forEach(function (slot, i) { renderSlot(slot, POOL[i % POOL.length]); });
      if (motionOn && !prefersReduced && slots.length > 1) {
        partnerTimer = setInterval(function () {
          var slot = slots[Math.floor(Math.random() * slots.length)];
          slot.classList.add("is-swapping");
          setTimeout(function () {
            renderSlot(slot, pickDifferent(slot.dataset.mark));
            slot.classList.remove("is-swapping");
          }, 520);
        }, 4200);
      }
    }

    /* ---- Stat counters --------------------------------------------------------
       The final value lives in the HTML, so the numbers are correct with no JS,
       reduced motion, or before any scroll. We only *animate* (from 0) when the
       element starts below the fold and motion is on. */
    var counters = root.querySelectorAll("[data-count]");
    var finalOf = function (el) {
      return el.dataset.count + (el.dataset.suffix || "");
    };
    counters.forEach(function (el) {
      if (!motionOn || prefersReduced) { el.textContent = finalOf(el); return; }
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.textContent = finalOf(el); // already on screen: no point counting up
        return;
      }
      el.textContent = "0" + (el.dataset.suffix || "");
      var done = false;
      var run = function () {
        if (done) return;
        done = true;
        var end = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || "";
        var t0 = null, dur = 1400;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      };
      if ("IntersectionObserver" in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { cio.unobserve(e.target); run(); }
          });
        }, { threshold: 0.5 });
        cio.observe(el);
      } else {
        run();
      }
    });

    /* ---- Waitlist / newsletter form -------------------------------------------- */
    var waitlistForms = root.querySelectorAll("[data-waitlist-form]");
    waitlistForms.forEach(function (form) {
      var wrap = form.closest("[data-waitlist]") || form.parentElement;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type=email]");
        var email = input && input.value ? input.value.trim() : "";
        if (!email) return;
        // Works today with zero backend: opens a pre-filled email to the KOA
        // team so the signup is real from day one. Swap for an endpoint later.
        var subject = encodeURIComponent("KOA early access — " + (form.dataset.tag || "newsletter"));
        var body = encodeURIComponent(
          "Name: " + (form.dataset.name || "") + "\n" +
          "Email: " + email + "\n" +
          "I'd like early access to the beta and to help build the Karen AI with the community."
        );
        window.location.href = "mailto:karenorgamerica@gmail.com?subject=" + subject + "&body=" + body;
        form.classList.add("is-sent");
        if (wrap) wrap.classList.add("is-done");
      });
    });
  }

  window.__koaInit = init;
  init();
})();
