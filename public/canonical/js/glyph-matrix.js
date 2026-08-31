// KOA Glyph Matrix System — Multi-Layer Dreamy Edition
// Background particle system with S'gaw Karen glyphs at multiple depth layers.
// Each layer has different opacity, size, blur, and breathing speed.
// Glyphs spawn randomly, fade in/out with soft blur — summery, ephemeral feel.
// Mouse proximity reveals nearby glyphs with increased opacity.

class GlyphMatrix {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Expanded glyph pool: consonants + vowels/diacritics for variety
    this.glyphs = [
      'က', 'ခ', 'ဂ', 'ဃ', 'င', 'စ', 'ဆ', '၇', 'ည', 'တ',
      'ထ', 'ဒ', 'ဓ', 'န', 'ပ', 'ဖ', 'ဗ', 'ဘ', 'မ', 'ယ',
      'ရ', 'လ', 'ဝ', 'သ', 'ဟ', 'အ',
      'ာ', 'ိ', 'ီ', 'ု', 'ူ', 'ေ', 'ဲ', '္', '်', '့', 'း',
    ];

    this.particles = [];
    this.mouse = { x: 0, y: 0, active: false };

    // Multi-layer depth configuration
    // Each layer has distinct visual properties for depth-of-field effect
    this.layers = [
      { // Far — very faint, blurred, slow
        opacityRange: [0.012, 0.04],
        sizeRange: [6, 10],
        blur: 2.5,
        breathePeriod: 10000,
        breatheAmp: 0.5,
        wanderSpeed: 0.06,
      },
      { // Mid — moderate presence
        opacityRange: [0.025, 0.065],
        sizeRange: [9, 14],
        blur: 0.8,
        breathePeriod: 7000,
        breatheAmp: 0.4,
        wanderSpeed: 0.12,
      },
      { // Near — sharper, more visible, faster breathing
        opacityRange: [0.04, 0.09],
        sizeRange: [11, 17],
        blur: 0,
        breathePeriod: 5000,
        breatheAmp: 0.35,
        wanderSpeed: 0.2,
      },
    ];

    this.config = {
      // Grid density: one particle per ~12000px²
      density: 0.00008,
      reveal: {
        radius: 180,
        maxOpacityBoost: 0.45,
      },
      // Opacity transition smoothing
      fadeSmooth: 0.04,
      // Random spawn/despawn cycle
      spawnChance: 0.0003,   // per frame per dead particle
      respawnDelay: 3000,    // ms before a faded-out particle can respawn
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    document.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
    this.animate();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Grid-based spawning: each cell gets one glyph at randomized position
    const cellSize = Math.sqrt(1 / this.config.density);
    const cols = Math.ceil(w / cellSize);
    const rows = Math.ceil(h / cellSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Randomized position within grid cell
        const x = (col + Math.random()) * cellSize;
        const y = (row + Math.random()) * cellSize;
        // Assign to a random depth layer
        const layerIdx = Math.floor(Math.random() * this.layers.length);
        const layer = this.layers[layerIdx];

        this.particles.push({
          x, y,
          glyph: this.glyphs[Math.floor(Math.random() * this.glyphs.length)],
          size: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
          baseOpacity: layer.opacityRange[0] +
            Math.random() * (layer.opacityRange[1] - layer.opacityRange[0]),
          opacity: 0,  // start invisible, fade in
          phase: Math.random() * Math.PI * 2,
          layer: layerIdx,
          blur: layer.blur,
          breathePeriod: layer.breathePeriod,
          breatheAmp: layer.breatheAmp,
          // Wander
          vx: (Math.random() - 0.5) * layer.wanderSpeed,
          vy: (Math.random() - 0.5) * layer.wanderSpeed,
          // Spawn lifecycle
          alive: true,
          fadeState: 'in',       // 'in' | 'visible' | 'out' | 'dead'
          fadeProgress: 0,       // 0-1 for fade transitions
          deadSince: 0,          // timestamp when particle died
          // Randomized lifespan before fade-out
          lifespan: 8000 + Math.random() * 15000,
          age: 0,
        });
      }
    }
  }

  animate() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const time = performance.now();

    this.ctx.clearRect(0, 0, w, h);

    for (const p of this.particles) {
      // ─── Wander ───
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // ─── Spawn lifecycle ───
      if (p.fadeState === 'in') {
        // Fading in
        p.fadeProgress = Math.min(1, p.fadeProgress + 0.008);
        p.opacity = p.baseOpacity * p.fadeProgress;
        if (p.fadeProgress >= 1) p.fadeState = 'visible';
      } else if (p.fadeState === 'visible') {
        // Fully visible — track age for lifespan fade-out
        p.age += 16; // approx frame time
        if (p.age > p.lifespan) {
          p.fadeState = 'out';
          p.fadeProgress = 1;
        }
      } else if (p.fadeState === 'out') {
        // Fading out
        p.fadeProgress = Math.max(0, p.fadeProgress - 0.005);
        p.opacity = p.baseOpacity * p.fadeProgress;
        if (p.fadeProgress <= 0) {
          p.fadeState = 'dead';
          p.deadSince = time;
          p.opacity = 0;
        }
      } else if (p.fadeState === 'dead') {
        // Dead — wait for respawn delay, then fade back in
        if (time - p.deadSince > this.config.respawnDelay) {
          // Randomize for next life
          p.glyph = this.glyphs[Math.floor(Math.random() * this.glyphs.length)];
          p.lifespan = 8000 + Math.random() * 15000;
          p.age = 0;
          p.fadeState = 'in';
          p.fadeProgress = 0;
        }
        continue; // skip rendering dead particles
      }

      // ─── Breathe ───
      const breathe = Math.sin(time / p.breathePeriod + p.phase) * 0.5 + 0.5;
      let targetOpacity = p.opacity * (1 + breathe * p.breatheAmp);

      // ─── Mouse reveal ───
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.reveal.radius) {
          const boost = (1 - dist / this.config.reveal.radius) * this.config.reveal.maxOpacityBoost;
          targetOpacity += boost;
        }
      }

      // ─── Smooth opacity transition ───
      // (final displayed opacity lerps toward target)
      if (!p._displayOpacity) p._displayOpacity = p.opacity;
      p._displayOpacity += (targetOpacity - p._displayOpacity) * this.config.fadeSmooth;
      const displayAlpha = Math.max(0, Math.min(1, p._displayOpacity));

      if (displayAlpha < 0.005) continue;

      // ─── Render ───
      this.ctx.save();
      // Depth-based blur for dreamy effect
      if (p.blur > 0) {
        this.ctx.filter = `blur(${p.blur}px)`;
      }
      this.ctx.globalAlpha = displayAlpha;
      this.ctx.font = `${p.size}px 'Noto Sans Myanmar', sans-serif`;
      this.ctx.fillStyle = 'rgba(212, 168, 67, 1)';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.glyph, p.x, p.y);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GlyphMatrix('glyph-matrix'));
} else {
  new GlyphMatrix('glyph-matrix');
}
