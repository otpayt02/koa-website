/* ==========================================================================
   KOA — storytelling.js · "Living Alphabet" edition
   -------------------------------------------------------------------------
   One-time chrome bindings: header, motion toggle, mobile menu, year,
   and the GlyphStage (the site-wide canvas of Karen + Latin glyphs).

   init(): content-scoped setup (reveals, film, counters, forms), exposed
   as window.__koaInit so the packed hash-router build can re-run it after
   every route injection.

   Motion ships ON unless prefers-reduced-motion, honors the Motion toggle.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOn = !prefersReduced;
  document.body.dataset.motion = motionOn ? "on" : "off";

  /* ======================================================================
     GLYPH STAGE — the living alphabet.
     A fixed canvas of Latin + S'gaw Karen (Myanmar-script) glyphs.
     Modes:
       drift  — slow ambient dust with pointer parallax + scroll streaks
       form(w)— glyphs fly into pixel-sampled targets that spell a word
     The home film drives formations per chapter; interior pages form
     their door number in the page hero; the white KOA wordmark releases
     its letters into the field on the first scroll.
     ====================================================================== */
  var MYAN = ["၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  var GLYPH_SET = "KOAKAREካ".slice(0, 3) + "AKOကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇";

  var GlyphStage = (function () {
    var canvas, ctx, W = 0, H = 0, DPR = 1;
    var particles = [];
    var targets = null;            // current formation points (or null)
    var formationWord = null;
    var fontsReady = false;
    var pendingWord = null;
    var raf = null;
    var active = false;            // motion allowed + initialized
    var staticDrawn = false;
    var pointerX = 0, pointerY = 0;
    var scrollVel = 0, lastScrollY = window.scrollY, lastScrollT = performance.now();

    function glyphs() { return GLYPH_SET; }

    function makeParticles() {
      var n = window.innerWidth < 720 ? 46 : 92;
      particles = [];
      var set = glyphs();
      for (var i = 0; i < n; i++) {
        particles.push({
          ch: set.charAt(Math.floor(Math.random() * set.length)),
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.14,
          size: 12 + Math.random() * 15,
          baseAlpha: 0.05 + Math.random() * 0.10,
          alpha: 0,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.2,
          depth: 0.4 + Math.random() * 0.6,
          tx: 0, ty: 0, hasTarget: false,
          k: 0.045 + Math.random() * 0.05   // spring stiffness
        });
      }
    }

    function resize() {
      if (!canvas) return;
      W = window.innerWidth; H = window.innerHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (targets) form(formationWord, true);
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
          if (pendingWord) { var w = pendingWord; pendingWord = null; form(w); }
        });
      } else { fontsReady = true; }
    }

    /* Sample a word into target points via an offscreen canvas. */
    function sampleWord(word, cx, cy, targetW) {
      var off = document.createElement("canvas");
      var octx = off.getContext("2d");
      var fs = 260;
      var font = "600 " + fs + "px 'Noto Sans Myanmar','Cormorant Garamond',serif";
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
      var step = 5;
      for (var y = 0; y < off.height; y += step) {
        for (var x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 120) pts.push([x, y]);
        }
      }
      if (!pts.length) return [];
      var scale = Math.min(targetW / off.width, (H * 0.34) / off.height);
      var ox = cx - (off.width * scale) / 2;
      var oy = cy - (off.height * scale) / 2;
      for (var i = 0; i < pts.length; i++) {
        pts[i][0] = ox + pts[i][0] * scale;
        pts[i][1] = oy + pts[i][1] * scale;
      }
      // shuffle + cap to particle count
      for (var j = pts.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var t = pts[j]; pts[j] = pts[k]; pts[k] = t;
      }
      return pts.slice(0, particles.length);
    }

    function form(word, silent) {
      if (!canvas) init();
      if (!fontsReady) { pendingWord = word; return; }
      formationWord = word;
      var isHome = !!document.querySelector("[data-film]");
      var cx = W / 2;
      var cy = isHome ? H * 0.40 : H * 0.30;
      var tw = Math.min(W * 0.74, 880);
      var pts = sampleWord(word, cx, cy, tw);
      if (!pts.length) { targets = null; return; }
      targets = pts;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (i < pts.length) {
          p.tx = pts[i][0]; p.ty = pts[i][1]; p.hasTarget = true;
        } else { p.hasTarget = false; }
      }
      if (!motionOn) { drawStatic(); return; }
      if (!silent && !raf && active) raf = requestAnimationFrame(frame);
    }

    function release() {
      targets = null; formationWord = null;
      for (var i = 0; i < particles.length; i++) particles[i].hasTarget = false;
      if (!motionOn) drawStatic();
    }

    function drawGlyph(p, now, streak) {
      var flicker = 0.72 + 0.28 * Math.sin(now * 0.0011 * p.speed + p.phase);
      var a = p.alpha * flicker;
      if (a < 0.004) return;
      var px = p.x + pointerX * 16 * p.depth;
      var py = p.y + pointerY * 10 * p.depth;
      if (streak > 3) {
        ctx.globalAlpha = a * 0.3;
        ctx.fillText(p.ch, px, py - streak * 1.4);
      }
      ctx.globalAlpha = a;
      ctx.fillText(p.ch, px, py);
    }

    function frame(now) {
      raf = null;
      if (!active) return;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var streak = Math.abs(scrollVel);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.hasTarget) {
          p.x += (p.tx - p.x) * p.k;
          p.y += (p.ty - p.y) * p.k;
          var d = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y);
          var settled = d < 30;
          p.alpha += ((settled ? 0.62 : 0.30) - p.alpha) * 0.06;
        } else {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -30) p.x = W + 20; if (p.x > W + 30) p.x = -20;
          if (p.y < -30) p.y = H + 20; if (p.y > H + 30) p.y = -20;
          p.alpha += (p.baseAlpha - p.alpha) * 0.04;
        }
        ctx.font = p.size + "px 'Noto Sans Myanmar','Cormorant Garamond',serif";
        drawGlyph(p, now, streak);
      }
      ctx.globalAlpha = 1;
      scrollVel *= 0.9;
      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var now = performance.now();
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.hasTarget) { p.x = p.tx; p.y = p.ty; p.alpha = 0.55; }
        else { p.alpha = p.baseAlpha; }
        ctx.font = p.size + "px 'Noto Sans Myanmar','Cormorant Garamond',serif";
        drawGlyph(p, now, 0);
      }
      ctx.globalAlpha = 1;
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
      release: release,
      setActive: setActive,
      isFormed: function () { return !!targets; },
      word: function () { return formationWord; },
      numerals: MYAN
    };
  })();

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
  var filmScrollHandler = null;
  var filmResizeHandler = null;
  var lastSceneIdx = -1;

  function init() {
    var root = document.getElementById("main") || document;
    var film = root.querySelector("[data-film]");

    /* drop the previous page's film listeners, if any (home revisits) */
    if (filmScrollHandler) {
      window.removeEventListener("scroll", filmScrollHandler);
      window.removeEventListener("resize", filmResizeHandler);
      filmScrollHandler = filmResizeHandler = null;
    }
    document.body.classList.toggle("is-filming", !!film);
    lastSceneIdx = -1;

    /* ---- GlyphStage: formation for this page ------------------------------- */
    var glyphHolder = root.querySelector("[data-glyph-word]");
    if (film) {
      // home: the film drives formations (see onSceneChange); start on KOA
      GlyphStage.form("KOA");
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

    /* ---- Home film ----------------------------------------------------------- */
    if (film) {
      var scenes = Array.prototype.slice.call(film.querySelectorAll("[data-scene]"));
      var dots = Array.prototype.slice.call(film.querySelectorAll(".chapter-dots li"));
      var bar = film.querySelector(".film-progress i");
      var frameEl = film.querySelector("[data-frame]");
      var total = parseInt(film.dataset.total || "2400", 10);
      var cue = film.querySelector(".scroll-cue");
      var wordmark = film.querySelector("[data-wordmark]");
      var ticking = false;

      function onSceneChange(idx, scene) {
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
        if (idx === 0) {
          GlyphStage.form("KOA");
        } else {
          var num = scene && scene.dataset.glyphNum ? scene.dataset.glyphNum : MYAN[idx];
          GlyphStage.form(num);
        }
      }

      function updateFilm() {
        ticking = false;
        var h = film.offsetHeight - window.innerHeight;
        var scrolled = Math.min(Math.max(window.scrollY - (film.offsetTop || 0), 0), h);
        var p = h > 0 ? scrolled / h : 0;

        if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
        if (frameEl) frameEl.textContent = String(Math.round(p * total)).padStart(4, "0");

        var idx = Math.min(scenes.length - 1, Math.floor(p * scenes.length));
        scenes.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
        if (idx !== lastSceneIdx) { lastSceneIdx = idx; onSceneChange(idx, scenes[idx]); }
        if (cue) cue.classList.toggle("is-hidden", p > 0.02);

        /* wordmark release: the white KOA letters dissolve into the field */
        if (wordmark) {
          var rel = Math.min(1, Math.max(0, (p - 0.045) / 0.085));
          wordmark.style.setProperty("--release", rel.toFixed(3));
        }
      }

      filmScrollHandler = function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateFilm); }
      };
      filmResizeHandler = updateFilm;
      window.addEventListener("scroll", filmScrollHandler, { passive: true });
      window.addEventListener("resize", filmResizeHandler);
      updateFilm();
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
