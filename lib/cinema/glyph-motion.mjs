const MIN_FRAME_MS = 1;
const MAX_FRAME_MS = 48;
const AMBIENT_ALPHA_LIMIT = 0.14;
const FORMED_ALPHA_LIMIT = 0.52;

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
  depth = 0.5,
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
    baseOpacity: clamp(baseOpacity, 0.012, 0.06),
    breathePhase: seeded(pathSeed, 91) * Math.PI * 2,
    lifePhase: clamp(lifePhase, 0, 0.999999),
    lifeDurationMs: Math.max(4000, lifeDurationMs),
    pathCursor: Math.floor(seeded(pathSeed, 92) * 12),
    char,
    size,
    depth,
    dispersionOrigin: { x: position.x, y: position.y },
    dispersionDistance: 0,
  };
}

export function retargetParticle(particle, { target, mode }) {
  if (mode === "dispersing" && particle.mode !== "dispersing") {
    particle.dispersionOrigin = { x: particle.position.x, y: particle.position.y };
    particle.dispersionDistance = 0;
  }
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
  // Formation letters need a readable silhouette even when the pointer is
  // elsewhere; ambient particles retain their quieter base opacity.
  const formationBase = forming ? Math.max(baseOpacity * 2.4, 0.045) : baseOpacity;
  return clamp(Math.max(formationBase, revealed) * lifeEnvelope, 0, upperBound);
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
  const isForming = particle.mode === "forming" || particle.mode === "breathing";
  const isDispersing = particle.mode === "dispersing";
  // Quicker formation: glyphs snap to their targets faster for snappier scroll response
  const modeSpeed = isForming ? 2.4 : isDispersing ? 0.55 : 0.48;
  // Slower dispersion with progressive deceleration — glyphs ease away confidently
  // then slow down as they drift further, creating a graceful scatter
  const dispersionBrake = isDispersing
    ? clamp(1 - Math.max(0, anchorDistance - 80) / 600, 0.12, 1)
    : 1;
  const maximumSpeed = speedForAnchorDistance(anchorDistance, modeSpeed) * dispersionBrake;

  if (targetDistance > 0.0001) {
    const acceleration = Math.min(isForming ? 0.18 : 0.05, targetDistance / (isForming ? 800 : 2200)) * frameScale;
    particle.velocity.x += (dx / targetDistance) * acceleration;
    particle.velocity.y += (dy / targetDistance) * acceleration;
  }

  // Tighter damping for formation (snappy lock), looser for dispersion (floaty drift)
  const damping = isForming ? 0.82 : isDispersing ? 0.96 : 0.91;
  particle.velocity.x *= Math.pow(damping, frameScale);
  particle.velocity.y *= Math.pow(damping, frameScale);
  const speed = Math.hypot(particle.velocity.x, particle.velocity.y);
  if (speed > maximumSpeed) {
    particle.velocity.x = particle.velocity.x / speed * maximumSpeed;
    particle.velocity.y = particle.velocity.y / speed * maximumSpeed;
  }

  particle.position.x += particle.velocity.x * frameScale;
  particle.position.y += particle.velocity.y * frameScale;
  if (isDispersing) {
    particle.dispersionDistance = Math.hypot(
      particle.position.x - particle.dispersionOrigin.x,
      particle.position.y - particle.dispersionOrigin.y,
    );
  }
  particle.breathePhase = (particle.breathePhase + boundedDelta * 0.00045) % (Math.PI * 2);
  particle.lifePhase += boundedDelta / particle.lifeDurationMs;
  if (particle.lifePhase >= 1) cycleParticleLife(particle);
  if (particle.mode === "forming" && targetDistance < 2.5) particle.mode = "breathing";
  particle.opacity = boundedSparseAlpha({
    baseOpacity: particle.baseOpacity * (0.85 + Math.sin(particle.breathePhase + elapsedMs * 0.0002) * 0.15),
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

/**
 * Generate points that trace the Burmese numeral "၁" (one).
 * The numeral has a curved hook at top and a vertical stroke descending.
 */
export function getNumeral1Positions(width, height, count = 120) {
  const points = [];
  const cx = width / 2;
  const scale = Math.min(width, height) * 0.003;

  // Top hook — curves from upper-right down to center
  for (let i = 0; i < count * 0.35; i++) {
    const t = i / (count * 0.35);
    const x = cx + (1 - t) * 40 * scale + Math.sin(t * Math.PI) * 12 * scale;
    const y = height * 0.18 + t * height * 0.28;
    points.push({ x, y });
  }

  // Vertical stroke — descends with slight curve
  for (let i = 0; i < count * 0.65; i++) {
    const t = i / (count * 0.65);
    const x = cx + Math.sin(t * Math.PI * 0.4) * 6 * scale;
    const y = height * 0.46 + t * height * 0.38;
    points.push({ x, y });
  }

  return points;
}
