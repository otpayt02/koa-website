const MIN_FRAME_MS = 1;
const MAX_FRAME_MS = 48;
const AMBIENT_ALPHA_LIMIT = 0.14;
const FORMED_ALPHA_LIMIT = 0.42;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

function seeded(pathSeed, salt) {
  let value = Math.imul(pathSeed + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function createPersistentPath(pathSeed, anchor) {
  return Array.from({ length: 12 }, (_, index) => {
    const angle = seeded(pathSeed, index * 2) * Math.PI * 2;
    const radius = 28 + seeded(pathSeed, index * 2 + 1) * 150;
    return {
      x: anchor.x + Math.cos(angle) * radius,
      y: anchor.y + Math.sin(angle) * radius,
    };
  });
}

export function createParticle({
  id,
  pathSeed,
  anchor,
  position = anchor,
  char = "က",
  size = 10,
  baseOpacity = 0.025,
  lifePhase = 0,
  lifeDurationMs = 16000,
  arrivalAtMs = 0,
  nextTargetAtMs = 0,
  springStiffness = 0.06,
}) {
  const fixedAnchor = { x: anchor.x, y: anchor.y };
  return {
    id,
    pathSeed,
    path: createPersistentPath(pathSeed, fixedAnchor),
    position: { x: position.x, y: position.y },
    velocity: { x: 0, y: 0 },
    anchor: fixedAnchor,
    target: { x: fixedAnchor.x, y: fixedAnchor.y },
    mode: "ambient",
    opacity: clamp(baseOpacity, 0, AMBIENT_ALPHA_LIMIT),
    baseOpacity: clamp(baseOpacity, 0.006, 0.05),
    breathePhase: seeded(pathSeed, 91) * Math.PI * 2,
    lifePhase: clamp(lifePhase, 0, 0.999999),
    lifeDurationMs: Math.max(4000, lifeDurationMs),
    arrivalAtMs: Math.max(0, arrivalAtMs),
    nextTargetAtMs: Math.max(0, nextTargetAtMs),
    // The reference field uses a small per-glyph spring instead of a shared
    // easing curve. Keeping this on the particle makes the formation feel
    // organic while preserving deterministic replay for the same path seed.
    springStiffness: springStiffness ?? 0.045 + seeded(pathSeed, 93) * 0.05,
    waypointSettled: false,
    pathCursor: Math.floor(seeded(pathSeed, 92) * 12),
    char,
    size,
  };
}

/**
 * Direct spring settling used by the original KOA glyph field.
 *
 * Unlike the ambient integrator below, formed glyphs do not accumulate a
 * velocity. They move a bounded fraction toward their sampled target each
 * frame, which is why the reference remains responsive during fast scroll
 * reversals and gently decelerates as the mark settles.
 */
export function advanceFormationParticle(
  particle,
  { deltaMs, target, waypoint, arrival = false, elapsedMs = 0 },
) {
  const boundedDelta = clamp(deltaMs, MIN_FRAME_MS, MAX_FRAME_MS);
  const frameScale = boundedDelta / (1000 / 60);
  const stiffness = particle.springStiffness ?? 0.06;
  const step = (value) => value * frameScale;

  if (waypoint && !particle.waypointSettled) {
    const waypointDistance = Math.abs(waypoint.x - particle.position.x) + Math.abs(waypoint.y - particle.position.y);
    if (waypointDistance > 26) {
      particle.position.x += step((waypoint.x - particle.position.x) * stiffness * 1.6);
      particle.position.y += step((waypoint.y - particle.position.y) * stiffness * 1.6);
    } else {
      particle.waypointSettled = true;
    }
  }

  particle.position.x += step((target.x - particle.position.x) * stiffness * (arrival ? 1.5 : 1));
  particle.position.y += step((target.y - particle.position.y) * stiffness * (arrival ? 1.5 : 1));
  particle.velocity.x *= Math.pow(0.9, frameScale);
  particle.velocity.y *= Math.pow(0.9, frameScale);
  particle.breathePhase = (particle.breathePhase + boundedDelta * 0.00045) % (Math.PI * 2);
  const distance = Math.abs(target.x - particle.position.x) + Math.abs(target.y - particle.position.y);
  const settled = distance < 30;
  particle.mode = settled ? "breathing" : "forming";
  particle.opacity += ((settled ? 0.62 : 0.3) - particle.opacity) * Math.min(1, 0.06 * frameScale);
  particle.opacity = clamp(particle.opacity, 0, FORMED_ALPHA_LIMIT);
  particle.lastFormationDistance = distance;
  particle.lastFormationTime = elapsedMs;
  return particle;
}

export function retargetParticle(particle, { target, mode }) {
  particle.target.x = target.x;
  particle.target.y = target.y;
  particle.mode = mode;
  return particle;
}

export function speedForAnchorDistance(distance, baseSpeed = 0.9) {
  const safeDistance = Math.max(0, distance);
  return Math.max(baseSpeed * 0.14, baseSpeed / (1 + safeDistance / 280));
}

export function boundedSparseAlpha({ baseOpacity, lifePhase, reveal = 0, mode, occluded = false }) {
  if (occluded) return 0;
  const normalizedLife = ((lifePhase % 1) + 1) % 1;
  const fadeIn = clamp(normalizedLife / 0.14, 0, 1);
  const fadeOut = clamp((1 - normalizedLife) / 0.2, 0, 1);
  const lifeEnvelope = Math.min(fadeIn, fadeOut);
  const forming = mode === "forming" || mode === "breathing";
  const upperBound = forming ? FORMED_ALPHA_LIMIT : AMBIENT_ALPHA_LIMIT;
  const revealed = forming ? reveal * 0.12 : reveal * reveal * 0.1;
  return clamp(Math.max(baseOpacity, revealed) * lifeEnvelope, 0, upperBound);
}

export function cycleParticleLife(particle, { target } = {}) {
  particle.lifePhase = 0;
  particle.pathCursor = (particle.pathCursor + 1) % particle.path.length;
  const nextTarget = target ?? particle.path[particle.pathCursor];
  particle.target.x = nextTarget.x;
  particle.target.y = nextTarget.y;
  particle.mode = "ambient";
  return particle;
}

export function advanceParticle(particle, { deltaMs, elapsedMs = 0 }) {
  const boundedDelta = clamp(deltaMs, MIN_FRAME_MS, MAX_FRAME_MS);
  const frameScale = boundedDelta / (1000 / 60);
  const dx = particle.target.x - particle.position.x;
  const dy = particle.target.y - particle.position.y;
  const targetDistance = Math.hypot(dx, dy);
  const anchorDistance = Math.hypot(
    particle.position.x - particle.anchor.x,
    particle.position.y - particle.anchor.y,
  );
  // The opening mark should assemble within the first readable scroll beat;
  // ambient particles remain deliberately slower once the mark is formed.
  const modeSpeed = particle.mode === "forming" ? 2.35 : particle.mode === "dispersing" ? 0.92 : 0.48;
  const maximumSpeed = particle.mode === "forming"
    ? Math.min(4.5, 1.1 + targetDistance * 0.0035)
    : speedForAnchorDistance(anchorDistance, modeSpeed);

  if (targetDistance > 0.0001) {
    const acceleration = Math.min(particle.mode === "forming" ? 0.12 : 0.065, targetDistance / 1800) * frameScale;
    particle.velocity.x += (dx / targetDistance) * acceleration;
    particle.velocity.y += (dy / targetDistance) * acceleration;
  }

  particle.velocity.x *= Math.pow(0.91, frameScale);
  particle.velocity.y *= Math.pow(0.91, frameScale);
  const speed = Math.hypot(particle.velocity.x, particle.velocity.y);
  if (speed > maximumSpeed) {
    particle.velocity.x = particle.velocity.x / speed * maximumSpeed;
    particle.velocity.y = particle.velocity.y / speed * maximumSpeed;
  }

  particle.position.x += particle.velocity.x * frameScale;
  particle.position.y += particle.velocity.y * frameScale;
  particle.breathePhase = (particle.breathePhase + boundedDelta * 0.00045) % (Math.PI * 2);
  particle.lifePhase += boundedDelta / particle.lifeDurationMs;
  if (particle.lifePhase >= 1) cycleParticleLife(particle);
  if (particle.mode === "forming" && targetDistance < 2.5) particle.mode = "breathing";
  particle.opacity = boundedSparseAlpha({
    baseOpacity: particle.baseOpacity * (0.9 + Math.sin(particle.breathePhase + elapsedMs * 0.0002) * 0.1),
    lifePhase: particle.lifePhase,
    mode: particle.mode,
  });
  return particle;
}

export function getMotionComposition({ reducedMotion, phase, chapter }) {
  if (reducedMotion) {
    return {
      phase: "motion-off",
      chapter,
      shouldAnimate: false,
      canvasesVisible: false,
      semanticContent: "complete",
    };
  }
  return {
    phase,
    chapter,
    shouldAnimate: true,
    canvasesVisible: true,
    semanticContent: "progressive",
  };
}
