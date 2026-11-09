import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => {
  const url = new URL(`../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
};

const loadEngine = () => import("../lib/cinema/glyph-motion.mjs");

test("living glyph responsibility is extracted from the cinematic orchestrator", () => {
  const cinematic = read("components/CinematicHome.tsx");
  const field = read("components/cinematic/LivingGlyphField.tsx");
  const engine = read("lib/cinema/glyph-motion.mjs");

  assert.doesNotMatch(cinematic, /const respawn\s*=/);
  assert.doesNotMatch(cinematic, /Object\.assign\(glyph,\s*next/);
  assert.match(cinematic, /<LivingGlyphField/);
  assert.match(field, /export function LivingGlyphField\(\{\s*phase,\s*chapter,\s*reducedMotion,\s*occlusionRects,/s);
  assert.match(engine, /export function createParticle/);
});

test("particle identity, path, and anchor survive formation, dispersion, and reforming", async () => {
  const {
    advanceParticle,
    createParticle,
    cycleParticleLife,
    retargetParticle,
  } = await loadEngine();
  const particle = createParticle({
    id: "glyph-7",
    pathSeed: 41,
    anchor: { x: 160, y: 220 },
    position: { x: 30, y: 60 },
  });
  const identity = { id: particle.id, pathSeed: particle.pathSeed };
  const path = particle.path;
  const anchor = { ...particle.anchor };

  retargetParticle(particle, { mode: "forming", target: { x: 160, y: 220 } });
  for (let frame = 0; frame < 12; frame += 1) advanceParticle(particle, { deltaMs: 16, elapsedMs: frame * 16 });
  retargetParticle(particle, { mode: "dispersing", target: { x: 320, y: 90 } });
  for (let frame = 0; frame < 12; frame += 1) advanceParticle(particle, { deltaMs: 16, elapsedMs: 200 + frame * 16 });
  cycleParticleLife(particle, { target: { x: 80, y: 180 } });
  retargetParticle(particle, { mode: "forming", target: { x: 160, y: 220 } });
  advanceParticle(particle, { deltaMs: 16, elapsedMs: 500 });

  assert.deepEqual({ id: particle.id, pathSeed: particle.pathSeed }, identity);
  assert.strictEqual(particle.path, path);
  assert.ok(particle.path.length > 0);
  assert.deepEqual(particle.anchor, anchor);
});

test("distance damping slows particles farther from their fixed anchor", async () => {
  const { speedForAnchorDistance } = await loadEngine();
  const near = speedForAnchorDistance(12, 0.9);
  const far = speedForAnchorDistance(620, 0.9);

  assert.ok(near > far, `${near} should be greater than ${far}`);
  assert.ok(far > 0);
});

test("particle alpha remains bounded and ambiently sparse", async () => {
  const { boundedSparseAlpha } = await loadEngine();
  const ambientSamples = Array.from({ length: 101 }, (_, index) =>
    boundedSparseAlpha({
      baseOpacity: 0.025,
      lifePhase: index / 100,
      reveal: index / 100,
      mode: "ambient",
      occluded: false,
    }),
  );

  assert.ok(ambientSamples.every((alpha) => alpha >= 0 && alpha <= 0.14));
  assert.ok(ambientSamples.filter((alpha) => alpha > 0.08).length < ambientSamples.length / 3);
  assert.equal(boundedSparseAlpha({ baseOpacity: 1, lifePhase: 0.5, reveal: 1, mode: "forming", occluded: true }), 0);
});

test("Motion off returns a complete static semantic composition", async () => {
  const { getMotionComposition } = await loadEngine();
  assert.deepEqual(getMotionComposition({ reducedMotion: true, phase: "chapter-3", chapter: 3 }), {
    phase: "motion-off",
    chapter: 3,
    shouldAnimate: false,
    canvasesVisible: false,
    semanticContent: "complete",
  });
});
