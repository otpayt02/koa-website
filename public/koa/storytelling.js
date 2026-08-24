/* ==========================================================================
   KOA — Karen Organization of America · storytelling engine (The Arrival)
   -------------------------------------------------------------------------
   One engine, three layers:

   1. GlyphStage — a fixed, volumetric canvas of Latin + S'gaw Karen glyphs.
      Modes:
        drift     — ambient dust with pointer parallax + scroll streaks
        arrival   — the KOA wordmark built FROM glyphs: cursor-reactive,
                    rises on scroll, disperses, hands off to the film
        word/loom — pixel-sampled words + the Karen diamond-weave frame
      Plus the RAIN: intermittent vertical glyph columns that spawn at
      random places, live briefly, and leave at random times.

   2. The Arrival — the prologue scroll stage (seal → glyph-KOA → rise →
      mission, told word by word) that hands its glyphs to chapter 01.

   3. Word assembly — paragraphs that solidify one randomly-ordered word
      at a time, because the words are the product.

   Motion is a garnish, never the meal. prefers-reduced-motion and the
   manual Motion toggle are honored everywhere.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOn = true;
  document.body.dataset.motion = "on";
  document.body.dataset.motionPreference = prefersReduced ? "reduce" : "no-preference";

  var MYAN = ["၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  var GLYPH_SET = "KOAKAREက" + "AKOကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇";
  var GLYPH_SET_DENSE = "ကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ" +
    "က ခ ဂ ဃ င စ ဆ ဇ ည တ ထ ဒ ဓ န ပ ဖ ဗ ဘ မ ယ ရ လ ဝ သ ဟ အ" +
    "၁ ၂ ၃ ၄ ၅ ၆ ၇ ၈ ၉ KOA KOA";

  /* A single deterministic source keeps the living glyph field repeatable.
     The seed spells KOA in hex and makes visual QA comparable between runs. */
  function createSeededRandom(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      var value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  var seededRandom = createSeededRandom(0x004b4f41);

  function buildCoronaGlyphRays() {
    var holder = document.querySelector("[data-corona-rays]");
    if (!holder || holder.childElementCount) return;
    var set = "ကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇၈၉";
    var count = window.innerWidth < 720 ? 54 : 92;
    for (var i = 0; i < count; i++) {
      var ray = document.createElement("i");
      ray.textContent = set.charAt(Math.floor(seededRandom() * set.length));
      ray.style.setProperty("--ray-angle", (i / count * 360 + seededRandom() * 4 - 2).toFixed(2) + "deg");
      // Viewport units keep every ray at a real orbital distance. Percentage
      // transforms are relative to the tiny glyph itself and collapse into a
      // bright cluster around the seal.
      ray.style.setProperty("--ray-radius", (21 + seededRandom() * 19).toFixed(2) + "vmin");
      ray.style.setProperty("--ray-size", (5 + seededRandom() * 7).toFixed(2) + "px");
      ray.style.setProperty("--ray-alpha", (0.018 + seededRandom() * 0.045).toFixed(4));
      ray.style.setProperty("--ray-delay", (-seededRandom() * 38).toFixed(2) + "s");
      holder.appendChild(ray);
    }
  }

  var MotionMath = {
    clamp01: function (value) { return Math.min(1, Math.max(0, value)); },
    lerp: function (from, to, amount) { return from + (to - from) * amount; },
    map01: function (value, from, to) {
      return MotionMath.clamp01((value - from) / Math.max(0.0001, to - from));
    },
    easeInOutQuint: function (value) {
      return value < 0.5
        ? 16 * value * value * value * value * value
        : 1 - Math.pow(-2 * value + 2, 5) / 2;
    },
    easeOutExpo: function (value) {
      return value >= 1 ? 1 : 1 - Math.pow(2, -10 * value);
    },
    easeInOutSine: function (value) {
      return -(Math.cos(Math.PI * MotionMath.clamp01(value)) - 1) / 2;
    },
    easeWithHold: function (value, enterEnd, exitStart) {
      var progress = MotionMath.clamp01(value);
      if (progress < enterEnd) {
        return MotionMath.easeOutExpo(progress / Math.max(0.0001, enterEnd)) * 0.5;
      }
      if (progress <= exitStart) return 0.5;
      return 0.5 + MotionMath.easeInOutQuint(
        (progress - exitStart) / Math.max(0.0001, 1 - exitStart)
      ) * 0.5;
    }
  };

  /* ======================================================================
     GLYPH STAGE
     ====================================================================== */
  var GlyphStage = (function () {
    var canvas, ctx, W = 0, H = 0, DPR = 1;
    var particles = [], targets = null, formationWord = null, formationMode = null;
    var formationAnchor = "center";
    var tintColor = null;
    var fontsReady = false;
    var pendingWord = null;
    var pendingLoom = false;
    var pendingAnchor = null;
    var pendingArrival = false;
    var raf = null;
    var active = false;            // motion allowed + initialized
    var staticDrawn = false;
    var pointerX = 0, pointerY = 0;
    var pointerClientX = -9999, pointerClientY = -9999, pointerActive = false;
    var scrollVel = 0, lastScrollY = window.scrollY, lastScrollT = performance.now();
    var lastFrameT = performance.now();

    /* arrival state ------------------------------------------------------ */
    var arrivalAnchorY = 0.5;      // fraction of H where the KOA sits
    var arrivalScale = 1;
    var arrivalScatter = 0;
    var arrivalCursor = true;
    var arrivalFormationAlpha = 0;
    var arrivalPhase = "seal"; // "seal" | "grow" | "level" | "K_A" | "O_converge" | "risen" | "dispersing" | "done"
    var arrivalProgress = 0;   // 0..1 within current phase
    var sealGrowth = 1;        // 1 = normal size, grows to ~3 during "grow"
    var O_convergeP = 0;       // 0..1 for O converging from off-screen
    var rayIntensity = 0;      // 0..1, driven by scroll velocity

    /* rain state ---------------------------------------------------------- */
    var rainOn = false;
    var rainBoost = 0;             // 0..1, driven by scroll + arrival phase
    var rainCols = [];
    var RAIN_MAX = window.innerWidth < 720 ? 4 : 7;

    /* background field (always on, occluded by foreground) ---------------- */
    var bgField = {
      on: true,
      particles: [],
      density: 0.92,
      wanderStrength: 0.0045,
      maxAlpha: 0.03
    };
    var occlusionRects = [];
    var lastOcclusionBuild = 0;

    function glyphs() { return GLYPH_SET; }

    function makeParticles() {
          var n = window.innerWidth < 720 ? 150 : 280;
          particles = [];
          var set = glyphs();
          for (var i = 0; i < n; i++) {
            var z = seededRandom(); // volumetric depth: 0 = far, 1 = near
            particles.push({
              ch: set.charAt(Math.floor(seededRandom() * set.length)),
              x: seededRandom() * W,
              y: seededRandom() * H,
              z: z,
              vx: (seededRandom() - 0.5) * 0.18,
              vy: (seededRandom() - 0.5) * 0.14,
              vz: (seededRandom() - 0.5) * 0.0016,
              size: (W < 720 ? 12 : 14) + seededRandom() * (W < 720 ? 15 : 17),
              baseAlpha: 0.05 + seededRandom() * 0.10,
              alpha: 0,
              phase: seededRandom() * Math.PI * 2,
              speed: 0.5 + seededRandom() * 1.2,
              depth: 0.4 + z * 0.6,
              tx: 0, ty: 0, hasTarget: false,
              wx: 0, wy: 0, hasWay: false,   // loom thread waypoint (curved flight)
              bx: 0, by: 0, hasBase: false,  // arrival base offsets (centered)
              sx: 0, sy: 0, sf: 0,           // arrival scatter destination + factor
              ox: 0, oy: 0,                  // off-screen origin for the delayed O
              arrivalRole: null,
              k: 0.045 + seededRandom() * 0.05   // spring stiffness
            });
          }

          /* background field particles — denser, subtler, occluded by DOM */
          if (bgField.on) {
            var bn = Math.floor((W * H / 9000) * bgField.density);
            bn = Math.min(Math.max(bn, 120), 480);
            bgField.particles = [];
            var denseSet = glyphsDense();
            for (i = 0; i < bn; i++) {
              bgField.particles.push({
                ch: denseSet.charAt(Math.floor(seededRandom() * denseSet.length)),
                x: seededRandom() * W,
                y: seededRandom() * H,
                 schoolSpeed: seededRandom() < 0.22 ? 1.75 : 0.62,
                 vx: (seededRandom() - 0.5) * 0.03,
                 vy: (seededRandom() - 0.5) * 0.02,
                 targetVx: (seededRandom() - 0.5) * 0.035,
                 targetVy: (seededRandom() - 0.5) * 0.026,
                 turnAt: performance.now() + 2200 + seededRandom() * 5200,
                 size: 5 + seededRandom() * 7,
                 alpha: seededRandom() * bgField.maxAlpha,
                 lifePhase: seededRandom(),
                 lifeMs: 9000 + seededRandom() * 17000,
                phase: seededRandom() * Math.PI * 2,
                speed: 0.2 + seededRandom() * 0.4,
                wanderX: seededRandom() * 1000,
                wanderY: seededRandom() * 1000
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
    }

    function init() {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.className = "glyph-stage";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      buildCoronaGlyphRays();
      ctx = canvas.getContext("2d");
      resize();
      makeParticles();
      window.addEventListener("resize", function () {
        if (raf) cancelAnimationFrame(raf);
        resize();
        RAIN_MAX = window.innerWidth < 720 ? 4 : 7;
        /* re-form whatever is on stage at the new size */
        if (formationMode === "arrival") formArrival(true);
        else if (formationMode === "loom") formLoom(formationWord, true, formationAnchor);
        else if (formationMode === "word") form(formationWord, true);
        if (active && motionOn) { raf = requestAnimationFrame(frame); }
        else { drawStatic(); }
      });
      window.addEventListener("pointermove", function (e) {
        pointerX = (e.clientX / W - 0.5) * 2;
        pointerY = (e.clientY / H - 0.5) * 2;
        pointerClientX = e.clientX;
        pointerClientY = e.clientY;
        pointerActive = true;
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", function () {
        pointerActive = false;
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
            var w = pendingWord, loom = pendingLoom, anchor = pendingAnchor;
            pendingWord = null; pendingLoom = false; pendingAnchor = null;
            if (loom) formLoom(w, false, anchor); else form(w);
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
        var k = Math.floor(seededRandom() * (j + 1));
        var t = pts[j]; pts[j] = pts[k]; pts[k] = t;
      }
      return pts.slice(0, particles.length);
    }

    function defaultCornerFor(word) {
      var corners = ["ne", "se", "nw", "sw"];
      var index = Math.max(0, MYAN.indexOf(word));
      return corners[index % corners.length];
    }

    function cornerPoint(anchor) {
      var mobile = W < 720;
      var xInset = mobile ? W * 0.22 : Math.min(W * 0.16, 230);
      var yInset = mobile ? H * 0.23 : Math.min(H * 0.23, 210);
      return {
        x: anchor.indexOf("w") > -1 ? xInset : W - xInset,
        y: anchor.indexOf("n") > -1 ? yInset : H - yInset
      };
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
          var k = Math.floor(seededRandom() * (j + 1));
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
      var holder = document.querySelector("[data-glyph-word]");
      var anchor = holder && holder.dataset.glyphAnchor
        ? holder.dataset.glyphAnchor
        : defaultCornerFor(word);
      var point = isHome ? { x: W / 2, y: H * 0.40 } : cornerPoint(anchor);
      var cx = point.x;
      var cy = point.y;
      var tw = isHome ? Math.min(W * 0.74, 880) : Math.min(W * 0.22, 230);
      var pts = sampleWord(word, cx, cy, tw);
      if (!pts.length) { targets = null; return; }
      assignTargets(pts, []);
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    /* THE LOOM — word at the heart, woven diamond lattice framing it. */
    function formLoom(word, silent, anchor) {
      if (!canvas) init();
      if (!fontsReady) {
        pendingWord = word;
        pendingLoom = true;
        pendingAnchor = anchor || defaultCornerFor(word);
        return;
      }
      formationWord = word; formationMode = "loom";
      formationAnchor = anchor || defaultCornerFor(word);
      var point = cornerPoint(formationAnchor);
      var cx = point.x;
      var cy = point.y;
      var tw = Math.min(W * 0.2, 210);
      var pts = sampleWord(word, cx, cy, tw);
      var r = Math.min(W, H) * (window.innerWidth < 720 ? 0.17 : 0.20);
      var loomPts = sampleLoom(cx, cy, r);
      if (!pts.length) { form(word, silent); return; }
      assignTargets(pts, loomPts);
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    /* THE ARRIVAL — K and A resolve around the seal first. The O owns its
       own target pool and stays beyond the viewport until the seal completes
       its flight into the header. */
    function formArrival(silent) {
      if (!canvas) init();
      if (!fontsReady) { pendingArrival = true; return; }
      formationWord = "KOA"; formationMode = "arrival";
      formationAnchor = "center";
      var letterWidth = Math.min(W * 0.30, 360);
      var letterOffset = Math.min(W * 0.22, 300);
      var kaPoints = samplePoints("K", -letterOffset, 0, letterWidth, 4, H * 0.4)
        .concat(samplePoints("A", letterOffset, 0, letterWidth, 4, H * 0.4));
      var oPoints = samplePoints("O", 0, 0, letterWidth, 4, H * 0.4);
      if (!kaPoints.length || !oPoints.length) { targets = null; return; }

      for (var j = kaPoints.length - 1; j > 0; j--) {
        var k = Math.floor(seededRandom() * (j + 1));
        var t = kaPoints[j]; kaPoints[j] = kaPoints[k]; kaPoints[k] = t;
      }
      for (j = oPoints.length - 1; j > 0; j--) {
        k = Math.floor(seededRandom() * (j + 1));
        t = oPoints[j]; oPoints[j] = oPoints[k]; oPoints[k] = t;
      }

      var oCount = Math.min(oPoints.length, Math.round(particles.length * 0.34));
      var kaCount = Math.min(kaPoints.length, particles.length - oCount);
      targets = kaPoints.slice(0, kaCount).concat(oPoints.slice(0, oCount));
      var n = Math.min(targets.length, particles.length);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.hasWay = false;
        if (i < n) {
          var point = targets[i];
          p.bx = point[0]; p.by = point[1]; p.hasBase = true; p.hasTarget = true;
          p.arrivalRole = i < kaCount ? "KA" : "O";
          // scatter destination: somewhere out toward the edges
          var ang = seededRandom() * Math.PI * 2;
          var rad = Math.max(W, H) * (0.55 + seededRandom() * 0.5);
          p.sx = W / 2 + Math.cos(ang) * rad;
          p.sy = H * arrivalAnchorY + Math.sin(ang) * rad * 0.7;
          p.sf = 0.55 + seededRandom() * 0.75;

          if (p.arrivalRole === "O") {
            var edge = (i - kaCount) % 4;
            var margin = 50 + seededRandom() * 90;
            p.ox = edge === 0 ? -margin : edge === 1 ? W + margin : seededRandom() * W;
            p.oy = edge === 2 ? -margin : edge === 3 ? H + margin : seededRandom() * H;
            if (!silent || O_convergeP < 0.02) {
              p.x = p.ox;
              p.y = p.oy;
              p.alpha = 0;
            }
            continue;
          }

          // begin at the seal's heart: the KOA rises off the logo itself
          if (!silent) {
            var d = Math.hypot(p.x - W / 2, p.y - H * 0.5);
            if (d > Math.min(W, H) * 0.34) {
              p.x = W / 2 + (seededRandom() - 0.5) * 90;
              p.y = H * 0.5 + (seededRandom() - 0.5) * 90;
              p.alpha = 0;
            }
          }
        } else { p.hasBase = false; p.hasTarget = false; p.arrivalRole = null; }
      }
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    function setArrivalOProgress(value) {
      O_convergeP = MotionMath.clamp01(value);
      arrivalPhase = O_convergeP <= 0.001 ? "K_A"
        : O_convergeP >= 0.999 ? "risen"
        : "O_converge";
      if (!motionOn) drawStatic();
    }

    /* live transform of the arrival formation (called from scroll) */
    function arrivalTransform(anchorY, scale, scatter, cursor, visibility) {
      arrivalAnchorY = anchorY;
      arrivalScale = scale;
      arrivalScatter = scatter;
      arrivalCursor = cursor !== false;
      arrivalFormationAlpha = visibility == null ? 1 : MotionMath.clamp01(visibility);
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
      var size = 10 + seededRandom() * 13;               // different sizes
      var len = 4 + Math.floor(seededRandom() * 11);      // different lengths
      var chars = [];
      for (var i = 0; i < len; i++) chars.push(set.charAt(Math.floor(seededRandom() * set.length)));
      rainCols.push({
        x: seededRandom() * W,
        y: H * (0.05 + seededRandom() * 0.55),
        size: size,
        chars: chars,
        vy: 0.14 + seededRandom() * 0.4,
        born: now,
        life: 1400 + seededRandom() * 2800,               // leaves at seeded times
        maxAlpha: 0.07 + seededRandom() * 0.09
      });
    }

    function updateRain(now) {
      if (!rainOn) return;
      // intermittent spawning: base chance + scroll boost
      var chance = 0.010 + Math.min(0.10, Math.abs(scrollVel) * 0.012) + rainBoost * 0.05;
      if (rainCols.length < RAIN_MAX && seededRandom() < chance) spawnRainColumn(now);
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
          function buildOcclusionMap(now) {
            if (now - lastOcclusionBuild < 80) return;
            lastOcclusionBuild = now;
            occlusionRects = [];
            var occluders = document.querySelectorAll("[data-glyph-occlude], header, footer, main a, main button, main input, .scene-credit, .split-copy, .split-media, .interlude, .waitlist, .section-head, .stats, .grid-4, .card, .film-label, .film-progress, .film-meta, .chapter-dots");
            for (var i = 0; i < occluders.length; i++) {
              var el = occluders[i];
              var style = window.getComputedStyle(el);
              if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity || "1") < 0.04) continue;
              var r = el.getBoundingClientRect();
              if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
              var pad = el.matches(".scene-copy, .arrival-copy, .arrival-mission") ? 24 : 14;
              occlusionRects.push({
                x: r.left - pad,
                y: r.top - pad,
                w: r.width + pad * 2,
                h: r.height + pad * 2
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
          function smoothDirectionRetarget(p, now) {
            if (now >= p.turnAt) {
              p.targetVx = (seededRandom() - 0.5) * 0.04 * p.schoolSpeed;
              p.targetVy = (seededRandom() - 0.5) * 0.03 * p.schoolSpeed;
              p.turnAt = now + 2600 + seededRandom() * 5600;
            }
            p.vx = MotionMath.lerp(p.vx, p.targetVx, 0.012);
            p.vy = MotionMath.lerp(p.vy, p.targetVy, 0.012);
          }

          function ditherThreshold(x, y) {
            var gx = Math.floor(x / 7);
            var gy = Math.floor(y / 7);
            return ((gx * 17 + gy * 31 + (gx ^ gy) * 7) % 97) / 97;
          }

          function cursorReveal(x, y) {
            if (!pointerActive) return 0;
            var dx = x - pointerClientX;
            var dy = y - pointerClientY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var falloff = MotionMath.clamp01(1 - distance / Math.min(260, Math.max(150, W * 0.18)));
            return falloff * falloff;
          }

          function respawnAmbientGlyph(p) {
            var denseSet = glyphsDense();
            p.ch = denseSet.charAt(Math.floor(seededRandom() * denseSet.length));
            p.x = seededRandom() * W;
            p.y = seededRandom() * H;
            p.lifePhase = 0;
            p.lifeMs = 9000 + seededRandom() * 17000;
            p.schoolSpeed = seededRandom() < 0.22 ? 1.75 : 0.62;
            p.targetVx = (seededRandom() - 0.5) * 0.035 * p.schoolSpeed;
            p.targetVy = (seededRandom() - 0.5) * 0.026 * p.schoolSpeed;
          }

          function drawBackgroundField(now, frameDelta) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for (var i = 0; i < bgField.particles.length; i++) {
               var p = bgField.particles[i];
               p.lifePhase += frameDelta / p.lifeMs;
               if (p.lifePhase >= 1) respawnAmbientGlyph(p);
               smoothDirectionRetarget(p, now);
              p.wanderX += 0.01;
              p.wanderY += 0.008;
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < -20) p.x = W + 20;
              if (p.x > W + 20) p.x = -20;
              if (p.y < -20) p.y = H + 20;
              if (p.y > H + 20) p.y = -20;
              var wx = Math.sin(p.wanderX) * bgField.wanderStrength * 1100;
              var wy = Math.cos(p.wanderY) * bgField.wanderStrength * 800;
              var px = p.x + wx;
              var py = p.y + wy;
              if (isOccluded(px, py)) continue;
               var flicker = 0.72 + 0.28 * Math.sin(now * 0.0007 * p.speed + p.phase);
               var lifeEnvelope = Math.min(1, p.lifePhase / 0.16, (1 - p.lifePhase) / 0.22);
               var reveal = cursorReveal(px, py);
               var dither = ditherThreshold(px, py);
               var revealedAlpha = reveal > dither * 0.78 ? reveal * 0.105 : 0;
               var a = Math.max(p.alpha * flicker, revealedAlpha) * Math.max(0, lifeEnvelope);
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
      if (isOccluded(px, py)) return;
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
          var frameDelta = Math.min(48, Math.max(1, now - lastFrameT));
          lastFrameT = now;
          ctx.clearRect(0, 0, W, H);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          var streak = Math.abs(scrollVel);

          var rayTarget = MotionMath.clamp01(Math.abs(scrollVel) / 9);
          rayIntensity = MotionMath.lerp(rayIntensity, rayTarget, 0.055 * (frameDelta / 16));
          document.documentElement.style.setProperty("--ray-intensity", rayIntensity.toFixed(4));
          document.documentElement.style.setProperty("--ray-shift", (scrollVel * 0.55).toFixed(3) + "deg");

          /* build occlusion map from DOM elements with data-glyph-occlude */
          buildOcclusionMap(now);

          /* --- draw background field (occluded by foreground elements) -------- */
           if (bgField.on) drawBackgroundField(now, frameDelta);

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
          var arrivalAlpha = 0.66 * arrivalFormationAlpha;
          var spring = p.k * 1.5;
          if (p.arrivalRole === "O") {
            var oEase = MotionMath.easeInOutQuint(O_convergeP);
            tx = MotionMath.lerp(p.ox, tx, oEase);
            ty = MotionMath.lerp(p.oy, ty, oEase);
            arrivalAlpha = 0.68 * MotionMath.easeInOutSine(O_convergeP);
            spring = p.k * (0.72 + oEase * 1.75);
          }
          if (arrivalScatter > 0.001) {
            tx += (p.sx - tx) * arrivalScatter * p.sf;
            ty += (p.sy - ty) * arrivalScatter * p.sf;
          }
          p.x += (tx - p.x) * spring;
          p.y += (ty - p.y) * spring;
          /* cursor-reactive: the formed glyphs shy away from the hand */
          if (arrivalCursor && arrivalScatter < 0.4 && (p.arrivalRole !== "O" || O_convergeP > 0.8)) {
            var dx = p.x - mpx, dy = p.y - mpy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130 && d > 0.001) {
              var f = (1 - d / 130) * 8.5;
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            }
          }
          var dd = Math.abs(tx - p.x) + Math.abs(ty - p.y);
          var movingAlpha = p.arrivalRole === "O" ? arrivalAlpha * 0.52 : 0.30 * arrivalFormationAlpha;
          p.alpha += ((dd < 30 ? arrivalAlpha : movingAlpha) - p.alpha) * 0.06;
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
          var settledAlpha = formationMode === "loom" ? 0.34 : 0.62;
          p.alpha += ((settled ? settledAlpha : 0.24) - p.alpha) * 0.06;
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
          if (p.arrivalRole === "O" && motionOn && !prefersReduced) {
            var staticO = MotionMath.easeInOutQuint(O_convergeP);
            p.x = MotionMath.lerp(p.ox, p.x, staticO);
            p.y = MotionMath.lerp(p.oy, p.y, staticO);
          }
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
      setArrivalOProgress: setArrivalOProgress,
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
      var k = Math.floor(seededRandom() * (j + 1));
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
    motionBtn.setAttribute("aria-pressed", motionOn ? "true" : "false");
  }
  function settleMotionContent() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".aw").forEach(function (word) {
      word.style.opacity = "1";
    });
    document.querySelectorAll("[data-count]").forEach(function (counter) {
      counter.textContent = counter.dataset.count + (counter.dataset.suffix || "");
    });
  }
  syncMotionBtn();
  if (motionBtn) {
    motionBtn.addEventListener("click", function () {
      motionOn = !motionOn;
      document.body.dataset.motion = motionOn ? "on" : "off";
      syncMotionBtn();
      GlyphStage.setActive(motionOn);
      if (!motionOn) settleMotionContent();
      window.dispatchEvent(new Event("scroll"));
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

    /* ---- Stagger data-reveal children --------------------------------------
       Mark children before collecting observer targets; otherwise the newly
       marked elements never enter the reveal observer. */
    root.querySelectorAll("[data-reveal-stagger]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.setAttribute("data-reveal", "");
        child.setAttribute("data-reveal-delay", String(i % 4));
      });
    });

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
      var heroSeal = arrivalEl.querySelector("[data-hero-seal]");
      var logoFlight = document.querySelector("[data-logo-flight]");
      var brand = document.querySelector(".brand");
      var brandMark = document.querySelector("[data-brand-mark]");
      var chapterTransition = film.querySelector("[data-chapter-transition]");
      var chapterTransitionNum = chapterTransition && chapterTransition.querySelector("[data-transition-num]");
      var chapterTransitionFlashTimer = null;
      var chapterTransitionHideTimer = null;
      var numeralPulseTimer = null;
      var ticking = false;
      var control = "arrival"; // who owns the glyph stage right now
      var smoothedArrival = 0;
      var smoothedFilm = 0;
      var timelineReady = false;
      var SCROLL_LAG_MS = 3000;
      var bufferedArrival = 0;
      var bufferedFilm = 0;
      var bufferedScrollQueue = [{ at: performance.now() - SCROLL_LAG_MS, arrival: 0, film: 0 }];
      var MAX_PROGRESS_PER_SECOND = 0.032;
      var ARRIVAL_PROGRESS_PER_SECOND = 0.04;
      var CHAPTER_HOLD_MS = 1800;
      var chapterHoldUntil = 0;
      var heldChapterBoundary = -1;
      var lastTimelineFrame = performance.now();

      function advanceNormalizedProgress(current, target, maximumPerSecond, deltaMs) {
        var maximumStep = maximumPerSecond * Math.min(64, Math.max(1, deltaMs)) / 1000;
        var distance = target - current;
        if (Math.abs(distance) <= maximumStep) return target;
        return current + Math.sign(distance) * maximumStep;
      }

      function advanceFilmWithChapterHold(current, target, now, deltaMs) {
        if (now < chapterHoldUntil) return current;
        var next = advanceNormalizedProgress(current, target, MAX_PROGRESS_PER_SECOND, deltaMs);
        if (target <= current) {
          heldChapterBoundary = -1;
          return next;
        }
        var currentChapter = Math.min(scenes.length - 1, Math.floor(current * scenes.length));
        var nextChapter = Math.min(scenes.length - 1, Math.floor(next * scenes.length));
        if (nextChapter > currentChapter && heldChapterBoundary !== nextChapter) {
          heldChapterBoundary = nextChapter;
          chapterHoldUntil = now + CHAPTER_HOLD_MS;
          return Math.max(current, nextChapter / scenes.length - 0.0002);
        }
        if (nextChapter >= heldChapterBoundary) heldChapterBoundary = -1;
        return next;
      }

      function measureScrollTargets() {
        var arrivalRunway = Math.max(1, arrivalEl.offsetHeight - window.innerHeight);
        var filmRunway = Math.max(1, film.offsetHeight - window.innerHeight);
        return {
          arrival: MotionMath.clamp01((window.scrollY - (arrivalEl.offsetTop || 0)) / arrivalRunway),
          film: MotionMath.clamp01((window.scrollY - (film.offsetTop || 0)) / filmRunway)
        };
      }

      function queueScrollTarget(at) {
        var measured = measureScrollTargets();
        var previous = bufferedScrollQueue[bufferedScrollQueue.length - 1];
        if (previous && Math.abs(previous.arrival - measured.arrival) < 0.0001
          && Math.abs(previous.film - measured.film) < 0.0001) return;
        bufferedScrollQueue.push({ at: at, arrival: measured.arrival, film: measured.film });
        if (bufferedScrollQueue.length > 240) bufferedScrollQueue.splice(0, bufferedScrollQueue.length - 240);
      }

      function readBufferedScrollTarget(now, direct) {
        if (!motionOn || prefersReduced) {
          bufferedScrollQueue.length = 0;
          bufferedArrival = direct.arrival;
          bufferedFilm = direct.film;
          return direct;
        }
        var cutoff = now - SCROLL_LAG_MS;
        while (bufferedScrollQueue.length && bufferedScrollQueue[0].at <= cutoff) {
          var matured = bufferedScrollQueue.shift();
          bufferedArrival = matured.arrival;
          bufferedFilm = matured.film;
        }
        return { arrival: bufferedArrival, film: bufferedFilm };
      }

      /* chapter color temperature — the film's light changes with the hour */
      var TEMPS = [null, "255,196,140", "238,240,235", "168,196,255", "150,232,222", "255,178,120"];

      function flashArabicNumeral(element) {
        if (!element || !motionOn || prefersReduced) return;
        element.classList.add("is-arabic-flash");
        setTimeout(function () { element.classList.remove("is-arabic-flash"); }, 96);
      }

      function scheduleNumeralPulse(scene, idx) {
        if (numeralPulseTimer) clearTimeout(numeralPulseTimer);
        var numeral = scene && scene.querySelector(".chapter-bg-num");
        var schedule = function () {
          numeralPulseTimer = setTimeout(function () {
            if (scene && scene.classList.contains("active")) {
              flashArabicNumeral(numeral);
              schedule();
            }
          }, 4200 + seededRandom() * 2600 + idx * 120);
        };
        schedule();
      }

      function playChapterTransition(idx, scene) {
        if (!chapterTransition || !chapterTransitionNum || !scene || !motionOn || prefersReduced) return;
        if (chapterTransitionFlashTimer) clearTimeout(chapterTransitionFlashTimer);
        if (chapterTransitionHideTimer) clearTimeout(chapterTransitionHideTimer);
        chapterTransitionNum.textContent = scene.dataset.glyphNum || MYAN[idx];
        chapterTransitionNum.dataset.arabic = ARABIC[idx] || String(idx + 1);
        chapterTransition.classList.add("is-visible");
        chapterTransitionNum.classList.remove("is-arabic-flash");
        chapterTransitionFlashTimer = setTimeout(function () {
          flashArabicNumeral(chapterTransitionNum);
        }, 520);
        chapterTransitionHideTimer = setTimeout(function () {
          chapterTransition.classList.remove("is-visible");
        }, 2200);
      }

      function updateReadingCorridor(scene, progress) {
        if (!scene) return;
        var corridor = scene.querySelector("[data-reading-corridor]");
        if (!corridor) return;
        if (!motionOn || prefersReduced) {
          corridor.style.removeProperty("--corridor-y");
          corridor.style.removeProperty("--corridor-opacity");
          corridor.style.removeProperty("--corridor-blur");
          return;
        }
        var held = MotionMath.easeWithHold(progress, 0.18, 0.82);
        var enter = MotionMath.easeInOutSine(MotionMath.map01(progress, 0.015, 0.18));
        var exit = 1 - MotionMath.easeInOutSine(MotionMath.map01(progress, 0.84, 0.995));
        var opacity = Math.min(enter, exit);
        corridor.style.setProperty("--corridor-y", MotionMath.lerp(6.5, -6.5, held).toFixed(3) + "vh");
        corridor.style.setProperty("--corridor-opacity", opacity.toFixed(4));
        corridor.style.setProperty("--corridor-blur", ((1 - opacity) * 5).toFixed(3) + "px");
      }

      function onSceneChange(idx, scene) {
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
        /* the chapter's light */
        var t = TEMPS[idx + 1] || null;
        film.style.setProperty("--chapter-tint", t || "255,255,255");
        document.body.style.setProperty("--chapter-tint", t || "255,255,255");
        GlyphStage.tint(t ? "rgb(" + t + ")" : null);
        /* the KOA's glyphs dissolve into this chapter's woven numeral */
        var num = scene && scene.dataset.glyphNum ? scene.dataset.glyphNum : MYAN[idx];
        var anchor = scene && scene.dataset.glyphAnchor ? scene.dataset.glyphAnchor : null;
        GlyphStage.formLoom(num, false, anchor);
        playChapterTransition(idx, scene);
        scheduleNumeralPulse(scene, idx);
        /* and the chapter's words solidify */
        if (scene) {
          var late = scene.querySelector('[data-assemble="late"]');
          if (late) setTimeout(function () { assembleEl(late); }, 420);
        }
      }

      function updateLogoFlight(progress) {
        if (!heroSeal || !logoFlight || !brand || !brandMark) return;

        if (!motionOn || prefersReduced) {
          brand.classList.add("is-filled");
          logoFlight.classList.remove("is-active");
          heroSeal.style.opacity = "1";
          arrivalEl.classList.remove("is-logo-flight");
          GlyphStage.setArrivalOProgress(1);
          return;
        }

        var wordmarkReady = arrivalEl.classList.contains("is-wordmark-ready");
        var flightProgress = wordmarkReady ? MotionMath.map01(progress, 0.58, 0.72) : 0;
        if (flightProgress <= 0.001) {
          brand.classList.remove("is-filled");
          logoFlight.classList.remove("is-active");
          heroSeal.style.opacity = "1";
          arrivalEl.classList.remove("is-logo-flight");
          return;
        }

        var source = heroSeal.getBoundingClientRect();
        var target = brandMark.getBoundingClientRect();
        var eased = MotionMath.easeInOutQuint(flightProgress);
        var arc = Math.sin(Math.PI * flightProgress) * Math.min(72, window.innerHeight * 0.08);
        var targetScale = target.width / Math.max(1, source.width);
        var x = MotionMath.lerp(source.left, target.left, eased);
        var y = MotionMath.lerp(source.top, target.top, eased) - arc;
        var scale = MotionMath.lerp(1, targetScale, MotionMath.easeOutExpo(flightProgress));

        logoFlight.style.width = source.width + "px";
        logoFlight.style.height = source.height + "px";
        logoFlight.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + scale + ")";
        logoFlight.classList.toggle("is-active", flightProgress < 0.985);
        heroSeal.style.opacity = String(Math.max(0, 1 - flightProgress * 4));
        brand.classList.toggle("is-filled", flightProgress >= 0.94);
        arrivalEl.classList.toggle("is-logo-flight", flightProgress > 0.04);
      }

      function updateHome() {
        ticking = false;

        /* Scroll is replayed three seconds late, then eased again. The delay
           gives each visual state time to be read before the next one moves. */
        var now = performance.now();
        var timelineDelta = now - lastTimelineFrame;
        lastTimelineFrame = now;
        var directTargets = measureScrollTargets();
        var bufferedTargets = readBufferedScrollTarget(now, directTargets);
        var targetArrival = bufferedTargets.arrival;
        var targetFilm = bufferedTargets.film;
        if (!timelineReady || !motionOn || prefersReduced) {
          smoothedArrival = targetArrival;
          smoothedFilm = targetFilm;
          timelineReady = true;
        } else {
          smoothedArrival = advanceNormalizedProgress(
            smoothedArrival,
            targetArrival,
            ARRIVAL_PROGRESS_PER_SECOND,
            timelineDelta
          );
          smoothedFilm = advanceFilmWithChapterHold(
            smoothedFilm,
            targetFilm,
            now,
            timelineDelta
          );
        }
        var pa = smoothedArrival;
        var pf = smoothedFilm;
        var filmLive = window.scrollY + window.innerHeight > film.offsetTop + 40 && targetFilm > 0.004;

        if (bar) bar.style.width = (pf * 100).toFixed(2) + "%";
        if (frameEl) frameEl.textContent = String(Math.round(pf * total)).padStart(4, "0");

        var idx = Math.min(scenes.length - 1, Math.floor(pf * scenes.length));
        var sceneProgress = MotionMath.clamp01(pf * scenes.length - idx);
        if (filmLive) {
          scenes.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
          updateReadingCorridor(scenes[idx], sceneProgress);
        } else {
          scenes.forEach(function (s) { s.classList.remove("active"); });
        }
        if (cue) cue.classList.toggle("is-hidden", pa > 0.03);

        /* ---- arrival phase states (CSS hooks) --------------------------- */
        arrivalEl.classList.toggle("is-assembly", pa > 0.46);
        arrivalEl.classList.toggle("is-glyph-o", pa > 0.73);
        arrivalEl.classList.toggle("is-risen", pa > 0.86);
        arrivalEl.classList.toggle("is-mission", pa > 0.88);
        arrivalEl.classList.toggle("is-scattering", pa > 0.975);
        if (header) header.classList.toggle("is-cinematic-complete", pa >= 0.965 || filmLive);
        var sealMigration = MotionMath.easeInOutQuint(MotionMath.map01(pa, 0.03, 0.58));
        arrivalEl.style.setProperty("--seal-scale", MotionMath.lerp(1, 0.43, sealMigration).toFixed(4));
        arrivalEl.style.setProperty("--seal-y", MotionMath.lerp(50, 42, sealMigration).toFixed(3) + "%");
        arrivalEl.style.setProperty("--seal-orbit", (MotionMath.easeInOutSine(MotionMath.map01(pa, 0, 0.72)) * 68).toFixed(3) + "deg");
        arrivalEl.style.setProperty("--seal-orbit-opacity", (1 - MotionMath.easeInOutSine(MotionMath.map01(pa, 0.56, 0.7))).toFixed(4));
        updateLogoFlight(pa);

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
          var assembleP = MotionMath.map01(pa, 0.06, 0.42);
          var oProgress = (!motionOn || prefersReduced) ? 1 : MotionMath.map01(pa, 0.73, 0.86);
          var riseP = MotionMath.map01(pa, 0.86, 0.965);
          var scatterP = MotionMath.map01(pa, 0.975, 1);
          var riseEase = MotionMath.easeInOutQuint(riseP);
          var anchorY = 0.42 - riseEase * 0.18;              // complete KOA holds level before it rises
          var scale = 1 + riseEase * 0.10;
          var scatter = MotionMath.easeInOutQuint(scatterP);
          GlyphStage.setArrivalOProgress(oProgress);
          GlyphStage.arrivalTransform(anchorY, scale, scatter, assembleP > 0.5 && scatter < 0.3, assembleP);
          GlyphStage.boostRain(scatterP * 0.9 + Math.min(1, Math.abs(window.scrollY - (lastScrollForRain || 0)) / 240) * 0.4);
          lastScrollForRain = window.scrollY;
          arrivalEl.style.setProperty("--rise", riseEase.toFixed(4));
          /* the mission tells itself once the KOA has risen */
          if (pa > 0.88 && mission) assembleEl(mission);
        }

        var settling = Math.abs(targetArrival - smoothedArrival) > 0.00025
          || Math.abs(targetFilm - smoothedFilm) > 0.00025
          || bufferedScrollQueue.length > 0;
        if (motionOn && !prefersReduced && settling && !ticking) {
          ticking = true;
          requestAnimationFrame(updateHome);
        }
      }
      var lastScrollForRain = 0;

      homeScrollHandler = function () {
        queueScrollTarget(performance.now());
        if (!ticking) { ticking = true; requestAnimationFrame(updateHome); }
      };
      homeResizeHandler = function () {
        bufferedScrollQueue.length = 0;
        queueScrollTarget(performance.now() - SCROLL_LAG_MS);
        updateHome();
      };
      window.addEventListener("scroll", homeScrollHandler, { passive: true });
      window.addEventListener("resize", homeResizeHandler);
      setTimeout(function () {
        arrivalEl.classList.add("is-wordmark-ready");
        homeScrollHandler();
      }, 1800);
      updateHome();
    }

    /* ---- Commitment loom -------------------------------------------------
       The summary of every standard is always visible. The optional detail
       opens one at a time so the block stays readable instead of turning into
       three competing motion panels. */
    var commitmentLoom = root.querySelector("[data-commitment-loom]");
    if (commitmentLoom && commitmentLoom.dataset.commitmentBound !== "true") {
      commitmentLoom.dataset.commitmentBound = "true";
      var commitmentTriggers = Array.prototype.slice.call(commitmentLoom.querySelectorAll("[data-commitment-trigger]"));

      function setCommitmentOpen(activeTrigger) {
        commitmentTriggers.forEach(function (trigger) {
          var item = trigger.closest(".commitment-item");
          var panelId = trigger.getAttribute("aria-controls");
          var panel = panelId ? document.getElementById(panelId) : null;
          var shouldOpen = trigger === activeTrigger;
          trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
          if (item) item.classList.toggle("is-open", shouldOpen);
          if (panel) panel.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
        });
      }

      commitmentTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var isOpen = trigger.getAttribute("aria-expanded") === "true";
          if (!isOpen) setCommitmentOpen(trigger);
        });
      });

      commitmentLoom.addEventListener("pointermove", function (event) {
        if (!motionOn || prefersReduced || document.body.dataset.motion === "off") return;
        var rect = commitmentLoom.getBoundingClientRect();
        commitmentLoom.style.setProperty("--loom-x", ((event.clientX - rect.left) / Math.max(1, rect.width) * 100).toFixed(2) + "%");
        commitmentLoom.style.setProperty("--loom-y", ((event.clientY - rect.top) / Math.max(1, rect.height) * 100).toFixed(2) + "%");
      }, { passive: true });
      commitmentLoom.addEventListener("pointerleave", function () {
        commitmentLoom.style.setProperty("--loom-x", "50%");
        commitmentLoom.style.setProperty("--loom-y", "50%");
      });
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
        return options[Math.floor(seededRandom() * options.length)];
      };
      slots.forEach(function (slot, i) { renderSlot(slot, POOL[i % POOL.length]); });
      if (motionOn && !prefersReduced && slots.length > 1) {
        partnerTimer = setInterval(function () {
          var slot = slots[Math.floor(seededRandom() * slots.length)];
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

/* ==========================================================================
   V5 ENHANCEMENTS — Moving glyphs, chapter flash, dispersion, parallax
   ========================================================================== */
(function() {
  "use strict";
  
  /* ---- Chapter number flash effect (Burmese ↔ Arabic) ------------------- */
  var chapterContainers = document.querySelectorAll('.chapter-flash-container');
  chapterContainers.forEach(function(container) {
    var arabicEl = container.querySelector('.chapter-flash-arabic');
    if (arabicEl && window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
      // Random intermittent flashes
      setInterval(function() {
        if (Math.random() > 0.7) {
          arabicEl.style.animationDuration = (2 + Math.random() * 3) + 's';
        }
      }, 4000);
    }
  });
  
  /* ---- Scroll speed detection for halo rays ----------------------------- */
  var lastScrollY = window.scrollY;
  var scrollSpeed = 0;
  var isScrolling = false;
  var scrollTimeout;
  
  window.addEventListener('scroll', function() {
    var currentY = window.scrollY;
    scrollSpeed = Math.abs(currentY - lastScrollY);
    lastScrollY = currentY;
    
    if (scrollSpeed > 2) {
      document.body.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        document.body.classList.remove('is-scrolling');
      }, 150);
    }
  }, { passive: true });
  
  /* ---- Parallax word effect on scroll ----------------------------------- */
  var parallaxWords = document.querySelectorAll('.parallax-word, .scene-copy h2, .scene-copy p');
  var scrollDirection = 'down';
  var lastScrollDir = 'down';
  
  window.addEventListener('scroll', function() {
    var currentY = window.scrollY;
    scrollDirection = currentY > lastScrollY ? 'down' : 'up';
    
    if (scrollDirection !== lastScrollDir) {
      document.body.classList.remove('scroll-up', 'scroll-down');
      document.body.classList.add('scroll-' + scrollDirection);
      lastScrollDir = scrollDirection;
      
      setTimeout(function() {
        document.body.classList.remove('scroll-up', 'scroll-down');
      }, 300);
    }
  }, { passive: true });
  
  /* ---- Enhanced crowd image with flag overlay --------------------------- */
  var crowdImages = document.querySelectorAll('.enhanced-crowd-img, .scene-media img');
  crowdImages.forEach(function(img) {
    if (!img.parentElement.querySelector('.flag-overlay')) {
      var overlay = document.createElement('div');
      overlay.className = 'flag-overlay';
      img.parentElement.appendChild(overlay);
    }
  });
  
  /* ---- Interactive tabs initialization ---------------------------------- */
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var parent = btn.closest('.interactive-tabs');
      if (parent) {
        parent.querySelectorAll('.tab-btn').forEach(function(b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
      }
    });
  });
  
  /* ---- Sparkle and float particle generators ---------------------------- */
  function createSparkle(container) {
    var sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(sparkle);
    
    setTimeout(function() {
      sparkle.remove();
    }, 3000);
  }
  
  function createFloatParticle(container) {
    var particle = document.createElement('div');
    particle.className = 'float-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(particle);
  }
  
  // Add subtle particles to arrival section
  var arrivalSection = document.querySelector('.arrival');
  if (arrivalSection && window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
    for (var i = 0; i < 8; i++) {
      createFloatParticle(arrivalSection);
    }
    
    // Occasional sparkles
    setInterval(function() {
      if (Math.random() > 0.7) {
        createSparkle(arrivalSection);
      }
    }, 2000);
  }
  
  /* ---- Content detection for glyph dispersion --------------------------- */
  function checkContentVisibility() {
    var mainContent = document.getElementById('main');
    if (mainContent) {
      var hasVisibleContent = Array.from(mainContent.querySelectorAll('section')).some(function(section) {
        var rect = section.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });
      
      document.body.classList.toggle('has-content', hasVisibleContent);
    }
  }
  
  window.addEventListener('scroll', checkContentVisibility, { passive: true });
  window.addEventListener('resize', checkContentVisibility);
  checkContentVisibility();
  
  /* ---- Glyph formation sequence for KOA letters ------------------------- */
  var koaLetters = document.querySelectorAll('.koa-letter-form');
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
    koaLetters.forEach(function(letter, index) {
      setTimeout(function() {
        letter.classList.add('is-formed');
      }, index * 400);
    });
  }
  
})();
