"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { glyphForSeed } from "../../lib/cinema/glyph-config";

type IntroProps = {
  reducedMotion: boolean;
  lang: "en" | "ksw" | "th" | "my";
  copy: {
    kicker: string;
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

type LetterKind = "k" | "a";

type MiniGlyphSpec = {
  finalTransform: string;
  startTransform: string;
  scatterTransform: string;
  finalOpacity: number;
  startOpacity: number;
  scatterOpacity: number;
  scatterDuration: number;
  char: string;
  delay: number;
  variant: number;
};

const BURMESE_LABEL = "ကညီပှၤတဝၢ";

// These marks are tiny woven identity strokes, not generic square particles.
// A seeded layout keeps the field deterministic while still feeling organic.
const K_SEGMENTS = [
  [145, 0, 145, 280],
  [150, 140, 314, 0],
  [150, 140, 314, 280],
] as const;

const A_SEGMENTS = [
  [650, 280, 760, 0],
  [760, 0, 870, 280],
  [695, 190, 825, 190],
] as const;

const LETTER_Y_OFFSET = 250;
const SEAL_CENTER = 500;
const SEAL_SOURCE_SIZE = 860;
const SEAL_CORE_RADIUS = 306;
const SEAL_ORBIT_OUTER_RADIUS = 425;
const SEAL_ORBIT_INNER_RADIUS = 346;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function pointOnSegment(segment: readonly [number, number, number, number], t: number) {
  const [x1, y1, x2, y2] = segment;
  return {
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  };
}

function transformForPoint(x: number, y: number, rotation: number, scale: number) {
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${scale.toFixed(3)})`;
}

function buildMiniGlyphs(kind: LetterKind, count = 204): MiniGlyphSpec[] {
  const random = seededRandom(kind === "k" ? 0x4b4f41 : 0x4b4152);
  const segments = kind === "k" ? K_SEGMENTS : A_SEGMENTS;

  return Array.from({ length: count }, (_, index) => {
    const segment = segments[index % segments.length];
    const point = pointOnSegment(segment, 0.04 + random() * 0.92);
    const finalX = point.x + (random() - 0.5) * 9;
    const finalY = point.y + LETTER_Y_OFFSET + (random() - 0.5) * 9;
    const finalRotation = (random() - 0.5) * 24;
    const finalScale = 0.72 + random() * 0.48;

    const startAngle = random() * Math.PI * 2;
    const startDistance = 62 + random() * 128;
    const startX = clamp(finalX + Math.cos(startAngle) * startDistance, 24, 976);
    const startY = clamp(finalY + Math.sin(startAngle) * startDistance, 26, 974);
    const startRotation = finalRotation + (random() - 0.5) * 70;

    const scatterAngle = random() * Math.PI * 2;
    const scatterDistance = 180 + random() * 460;
    const scatterX = finalX + Math.cos(scatterAngle) * scatterDistance;
    const scatterY = finalY + Math.sin(scatterAngle) * scatterDistance;
    const scatterRotation = finalRotation + (random() - 0.5) * 220;

    return {
      finalTransform: transformForPoint(finalX, finalY, finalRotation, finalScale),
      startTransform: transformForPoint(startX, startY, startRotation, finalScale * (0.82 + random() * 0.18)),
      scatterTransform: transformForPoint(scatterX, scatterY, scatterRotation, finalScale * (0.68 + random() * 0.28)),
      finalOpacity: 0.58 + random() * 0.28,
      startOpacity: 0.08 + random() * 0.12,
      scatterOpacity: 0.05 + random() * 0.11,
      // Nearby marks release quickly; farther marks receive a slightly longer
      // power-out tail so the field decelerates instead of stopping uniformly.
      scatterDuration: 0.1 + (scatterDistance / 640) * 0.08,
      char: glyphForSeed(index + (kind === "k" ? 1103 : 2207)),
      delay: random() * 2.8,
      variant: index % 3,
    };
  });
}

const K_GLYPHS = buildMiniGlyphs("k");
const A_GLYPHS = buildMiniGlyphs("a");
const ALL_GLYPHS = [...K_GLYPHS, ...A_GLYPHS];

function sealTransform(y: number, scale: number) {
  return `translate(${SEAL_CENTER} ${y.toFixed(2)}) scale(${scale.toFixed(3)})`;
}

function orbitTransform(y: number, scale: number) {
  return `translate(${SEAL_CENTER} ${y.toFixed(2)}) scale(${scale.toFixed(3)})`;
}

function setGlyphFinalState(fragment: SVGTextElement) {
  const finalTransform = fragment.dataset.finalTransform;
  const finalOpacity = Number(fragment.dataset.finalOpacity ?? 0.8);
  if (!finalTransform) return;
  gsap.set(fragment, { attr: { transform: finalTransform }, opacity: finalOpacity });
}

function setFinalState(
  seal: SVGElement,
  orbitFrame: SVGElement,
  orbitSpin: SVGElement,
  fragments: SVGTextElement[],
  lockup: SVGElement,
  halo: SVGElement,
  prompt: HTMLElement,
  caption: SVGElement,
  copy: HTMLElement,
) {
  gsap.set(seal, { attr: { transform: sealTransform(390, 0.42) }, opacity: 1 });
  gsap.set(orbitFrame, { attr: { transform: orbitTransform(390, 0.42) }, opacity: 1 });
  gsap.set(orbitSpin, { attr: { transform: "rotate(-360 0 0)" }, opacity: 1 });
  fragments.forEach(setGlyphFinalState);
  gsap.set(lockup, { opacity: 1, y: 0 });
  gsap.set(halo, { opacity: 0.44, scale: 1 });
  gsap.set(prompt, { opacity: 0 });
  gsap.set(caption, { opacity: 0.82, attr: { y: 690 }, filter: "blur(0px)" });
  gsap.set(copy, { opacity: 1, y: 0, filter: "blur(0px)" });
}

/**
 * The outer section is only the ScrollTrigger pin target. The 100svh stage
 * stays visually fixed while one master timeline scrubs its SVG children.
 */
export function ScrollScrubIntro({ reducedMotion, lang, copy: introCopy }: IntroProps) {
  const introRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<SVGGElement>(null);
  const orbitFrameRef = useRef<SVGGElement>(null);
  const orbitSpinRef = useRef<SVGGElement>(null);
  const lockupRef = useRef<SVGGElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);
  const eclipseRef = useRef<SVGGElement>(null);
  const glareRef = useRef<SVGGElement>(null);
  const goldRaysRef = useRef<SVGGElement>(null);
  const redRaysRef = useRef<SVGGElement>(null);
  const blueRaysRef = useRef<SVGGElement>(null);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const captionRef = useRef<SVGTextElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const kRefs = useRef<SVGTextElement[]>([]);
  const aRefs = useRef<SVGTextElement[]>([]);

  useLayoutEffect(() => {
    const intro = introRef.current;
    const stage = stageRef.current;
    const seal = sealRef.current;
    const orbitFrame = orbitFrameRef.current;
    const orbitSpin = orbitSpinRef.current;
    const lockup = lockupRef.current;
    const halo = haloRef.current;
    const eclipse = eclipseRef.current;
    const glare = glareRef.current;
    const goldRays = goldRaysRef.current;
    const redRays = redRaysRef.current;
    const blueRays = blueRaysRef.current;
    const prompt = promptRef.current;
    const caption = captionRef.current;
    const copy = copyRef.current;
    const kFragments = kRefs.current;
    const aFragments = aRefs.current;
    if (
      !intro || !stage || !seal || !orbitFrame || !orbitSpin || !lockup || !halo ||
      !eclipse || !glare || !goldRays || !redRays || !blueRays ||
      !prompt || !caption || !copy || !kFragments.length || !aFragments.length
    ) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const allFragments = [...kFragments, ...aFragments];
      const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setIntroHeaderState = (active: boolean) => {
        if (active) document.body.dataset.koaIntroActive = "true";
        else delete document.body.dataset.koaIntroActive;
      };

      stage.dataset.motion = reduced ? "reduced" : "full";
      intro.dataset.introState = reduced ? "complete" : "scrubbed";
      intro.dataset.introProgress = reduced ? "1" : "0";
      if (reduced) {
        setIntroHeaderState(false);
        setFinalState(seal, orbitFrame, orbitSpin, allFragments, lockup, halo, prompt, caption, copy);
        gsap.set(eclipse, { attr: { transform: "translate(500 390) scale(1.01)" }, opacity: 0.7 });
        gsap.set(glare, { attr: { transform: "translate(500 390) rotate(0) scale(1.01)" }, opacity: 0.32 });
        gsap.set(goldRays, { attr: { transform: "translate(500 390) rotate(-72)" }, opacity: 0.24 });
        gsap.set(redRays, { attr: { transform: "translate(500 390) rotate(48)" }, opacity: 0.17 });
        gsap.set(blueRays, { attr: { transform: "translate(500 390) rotate(-118)" }, opacity: 0.2 });
        stage.dataset.introProgress = "1";
        stage.dataset.introFinal = "true";
        return;
      }

      setIntroHeaderState(true);
      gsap.set(seal, { attr: { transform: sealTransform(500, 0.74) }, opacity: 1 });
      gsap.set(orbitFrame, { attr: { transform: orbitTransform(500, 0.74) }, opacity: 1 });
      gsap.set(orbitSpin, { attr: { transform: "rotate(0 0 0)" }, opacity: 1 });
      gsap.set(lockup, { opacity: 1, y: 0, transformOrigin: "50% 50%" });
      gsap.set(halo, { opacity: 0.54, scale: 1, transformOrigin: "50% 50%" });
      gsap.set(eclipse, { attr: { transform: "translate(500 500) scale(1)" }, opacity: 0.72 });
      gsap.set(glare, { attr: { transform: "translate(500 500) rotate(-8) scale(1)" }, opacity: 0.34 });
      gsap.set(goldRays, { attr: { transform: "translate(500 500) rotate(0)" }, opacity: 0.24 });
      gsap.set(redRays, { attr: { transform: "translate(500 500) rotate(0)" }, opacity: 0.16 });
      gsap.set(blueRays, { attr: { transform: "translate(500 500) rotate(0)" }, opacity: 0.2 });
      gsap.set(prompt, { opacity: 0.78, y: 0 });
      gsap.set(caption, { opacity: 0, attr: { y: 704 }, filter: "blur(9px)" });
      // The mission is orientation, not a scroll reward: keep the exact
      // lockup readable in the first viewport while the identity assembly
      // remains the cinematic event around it.
      gsap.set(copy, { opacity: 0.94, y: 0, filter: "blur(0px)" });
      allFragments.forEach((fragment, index) => {
        const spec = ALL_GLYPHS[index];
        gsap.set(fragment, { attr: { transform: spec.startTransform }, opacity: spec.startOpacity });
      });

      const master = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } });
      const setIdentity = (position: number, duration: number, y: number, scale: number, ease: string) => {
        master.to(seal, { attr: { transform: sealTransform(y, scale) }, duration, ease }, position);
        master.to(orbitFrame, { attr: { transform: orbitTransform(y, scale) }, duration, ease }, position);
      };
      const addSpin = (position: number, duration: number, degrees: number, ease: string) => {
        master.to(orbitSpin, { attr: { transform: `rotate(${degrees} 0 0)` }, duration, ease }, position);
      };

      setIdentity(0, 0.2, 466, 0.54, "power2.inOut");
      setIdentity(0.2, 0.26, 390, 0.42, "power3.inOut");
      master.to(halo, { opacity: 0.58, scale: 1.02, duration: 0.2, ease: "power2.out" }, 0);
      master.to(prompt, { opacity: 0, y: -10, duration: 0.16, ease: "power2.out" }, 0.04);

      // One authentic type ring makes a complete counterclockwise revolution:
      // quiet departure, a faster midpoint sweep, then a damped return to rest.
      addSpin(0, 0.22, -18, "power2.inOut");
      addSpin(0.22, 0.22, -104, "power3.in");
      addSpin(0.44, 0.2, -188, "power1.inOut");
      addSpin(0.64, 0.2, -232, "power3.out");
      addSpin(0.84, 0.16, -244, "power4.out");

      // The flare layers share the seal's center but move at independent rates.
      // Every mark is heavily blurred in SVG, so no ray ends in a visible edge.
      master.to(eclipse, { attr: { transform: "translate(500 390) scale(1.06)" }, opacity: 0.78, duration: 0.5, ease: "sine.inOut" }, 0);
      master.to(eclipse, { attr: { transform: "translate(500 390) scale(1.01)" }, opacity: 0.64, duration: 0.5, ease: "sine.inOut" }, 0.5);
      master.to(glare, { attr: { transform: "translate(500 390) rotate(18) scale(1.06)" }, opacity: 0.38, duration: 0.52, ease: "sine.inOut" }, 0);
      master.to(glare, { attr: { transform: "translate(500 390) rotate(2) scale(1.01)" }, opacity: 0.3, duration: 0.48, ease: "sine.inOut" }, 0.52);
      master.to(goldRays, { attr: { transform: "translate(500 390) rotate(-34)" }, duration: 1, ease: "power2.out" }, 0);
      master.to(redRays, { attr: { transform: "translate(500 390) rotate(24)" }, duration: 1, ease: "power1.inOut" }, 0);
      master.to(blueRays, { attr: { transform: "translate(500 390) rotate(-48)" }, duration: 1, ease: "power3.out" }, 0);

      kFragments.forEach((fragment, index) => {
        const spec = K_GLYPHS[index];
        master.to(fragment, { attr: { transform: spec.finalTransform }, opacity: spec.finalOpacity, duration: 0.42, ease: "power3.out" }, 0.22 + index * 0.0008);
      });
      aFragments.forEach((fragment, index) => {
        const spec = A_GLYPHS[index];
        master.to(fragment, { attr: { transform: spec.finalTransform }, opacity: spec.finalOpacity, duration: 0.42, ease: "power3.out" }, 0.22 + index * 0.0008);
      });

      master.to(caption, { attr: { y: 690 }, opacity: 0.82, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }, 0.62);
      master.to(lockup, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.6);
      master.to(halo, { opacity: 0.42, scale: 1, duration: 0.24, ease: "power2.out" }, 0.6);
      master.to(copy, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.24, ease: "power3.out" }, 0.66);

      // After a readable hold, glyphs recede into the persistent field. More
      // distant destinations receive longer power-out tails, which reads as
      // physical deceleration instead of a uniform burst.
      allFragments.forEach((fragment, index) => {
        const spec = ALL_GLYPHS[index];
        master.to(
          fragment,
          {
            attr: { transform: spec.scatterTransform },
            opacity: spec.scatterOpacity,
            duration: spec.scatterDuration,
            ease: "power4.out",
          },
          0.73 + index * 0.00005,
        );
      });
      master.to(seal, { attr: { transform: sealTransform(390, 0.34) }, duration: 0.2, ease: "power3.out" }, 0.8);
      master.to(orbitFrame, { attr: { transform: orbitTransform(390, 0.34) }, duration: 0.2, ease: "power3.out" }, 0.8);
      master.to(stage, { "--intro-glow": 0.22, duration: 0.22, ease: "power2.out" }, 0.66);

      const trigger = ScrollTrigger.create({
        trigger: intro,
        start: "top top",
        end: "+=260%",
        pin: true,
        scrub: 0.32,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: master,
        onUpdate: (self) => {
          const progress = self.progress.toFixed(4);
          intro.dataset.introProgress = progress;
          stage.dataset.introProgress = progress;
          stage.dataset.introFinal = self.progress > 0.985 ? "true" : "false";
          setIntroHeaderState(self.progress < 0.999);
        },
        onRefresh: (self) => {
          intro.dataset.introProgress = self.progress.toFixed(4);
          stage.dataset.introProgress = self.progress.toFixed(4);
          setIntroHeaderState(self.progress < 0.999);
        },
      });

      return () => {
        setIntroHeaderState(false);
        trigger.kill();
        master.kill();
      };
    }, intro);
    return () => context.revert();
  }, [reducedMotion, introCopy]);

  return (
    <section
      ref={introRef}
      className="koa-intro"
      data-koa-intro
      data-lang={lang}
      data-scrolltrigger-pin="true"
      data-scrolltrigger-start="top top"
      data-scrolltrigger-scrub="0.6"
      data-scrolltrigger-end="400%"
      aria-labelledby={`koa-intro-title-${lang}`}
    >
      <div ref={stageRef} className="koa-intro__stage" data-intro-progress="0">
        <div className="koa-intro__grain" aria-hidden="true" />
        <div className="koa-intro__sun" aria-hidden="true" />
        <p ref={promptRef} className="koa-intro__prompt" aria-hidden="true">
          <span>{BURMESE_LABEL}</span><i aria-hidden="true">·</i><span>KOA / 2018</span>
        </p>
        <svg className="koa-intro__art" viewBox="0 0 1000 1000" role="img" aria-labelledby="koa-intro-title koa-intro-description">
          <title id="koa-intro-title">KOA identity assembly</title>
          <desc id="koa-intro-description">The authentic KOA seal rises as its original outer lettering revolves behind a stationary inner seal and fine S'gaw Karen glyphs form the K and A.</desc>
          <defs>
            <linearGradient id="koa-intro-ink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4efe4" />
              <stop offset="0.48" stopColor="#d5ccb8" />
              <stop offset="1" stopColor="#aebed1" />
            </linearGradient>
            <radialGradient id="koa-intro-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#f0c766" stopOpacity="0.2" />
              <stop offset="0.5" stopColor="#6b90bf" stopOpacity="0.06" />
              <stop offset="1" stopColor="#d4a843" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="koa-intro-eclipse" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#020712" stopOpacity="0.96" />
              <stop offset="0.52" stopColor="#071326" stopOpacity="0.9" />
              <stop offset="0.72" stopColor="#d7ad4c" stopOpacity="0.1" />
              <stop offset="0.87" stopColor="#426f9f" stopOpacity="0.06" />
              <stop offset="1" stopColor="#071326" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="koa-intro-occluder" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#071326" stopOpacity="1" />
              <stop offset="0.9" stopColor="#071326" stopOpacity="1" />
              <stop offset="1" stopColor="#071326" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="koa-intro-gold-ray" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d9ad4a" stopOpacity="0" />
              <stop offset="0.5" stopColor="#f0ce79" stopOpacity="0.5" />
              <stop offset="1" stopColor="#d9ad4a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="koa-intro-red-ray" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#b52b38" stopOpacity="0" />
              <stop offset="0.5" stopColor="#d64a51" stopOpacity="0.42" />
              <stop offset="1" stopColor="#b52b38" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="koa-intro-blue-ray" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#386caa" stopOpacity="0" />
              <stop offset="0.5" stopColor="#6f9dcc" stopOpacity="0.44" />
              <stop offset="1" stopColor="#386caa" stopOpacity="0" />
            </linearGradient>
            <filter id="koa-intro-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <filter id="koa-intro-ray-blur" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <filter id="koa-intro-glare-blur" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="11" />
            </filter>
            <clipPath id="koa-intro-seal-core-clip"><circle cx="0" cy="0" r={SEAL_CORE_RADIUS} /></clipPath>
            <clipPath id="koa-intro-seal-orbit-clip"><circle cx="0" cy="0" r={SEAL_ORBIT_OUTER_RADIUS} /></clipPath>
            <mask id="koa-intro-seal-orbit-mask" maskUnits="userSpaceOnUse" x={-SEAL_ORBIT_OUTER_RADIUS} y={-SEAL_ORBIT_OUTER_RADIUS} width={SEAL_ORBIT_OUTER_RADIUS * 2} height={SEAL_ORBIT_OUTER_RADIUS * 2}>
              <circle cx="0" cy="0" r={SEAL_ORBIT_OUTER_RADIUS} fill="white" />
              <circle cx="0" cy="0" r={SEAL_ORBIT_INNER_RADIUS} fill="black" />
            </mask>
            <path id="koa-intro-mini-glyph-0" d="M-3 -2c1.8-2.2 4.4-1 4.4 1.2S.2 3.3-1 2.1M-1 -2.7v5.4" />
            <path id="koa-intro-mini-glyph-1" d="M-3 1.6c1.2-3.9 4.7-4.2 5.8-1.6M-2.5-2.5c1.4 2.8 3.4 3.7 5.5 3.5" />
            <path id="koa-intro-mini-glyph-2" d="M-2.8-2.8c2.2 0 4.3 1.3 5.6 3.2M-2.5 2.6C-.8.5.5-.9 2.8-2.7" />
          </defs>

          <circle ref={haloRef} className="koa-intro__halo" cx="500" cy="500" r="465" fill="url(#koa-intro-halo)" />
          <g ref={lockupRef} className="koa-intro__lockup" aria-hidden="true">
            <g ref={eclipseRef} className="koa-intro__eclipse" transform="translate(500 500)">
              <circle cx="0" cy="0" r="430" fill="url(#koa-intro-eclipse)" />
            </g>
            <g ref={goldRaysRef} className="koa-intro__rays koa-intro__rays--gold" transform="translate(500 500)" filter="url(#koa-intro-ray-blur)">
              <rect x="-470" y="-18" width="940" height="36" rx="18" fill="url(#koa-intro-gold-ray)" />
              <rect x="-390" y="-11" width="780" height="22" rx="11" fill="url(#koa-intro-gold-ray)" transform="rotate(67)" />
            </g>
            <g ref={redRaysRef} className="koa-intro__rays koa-intro__rays--red" transform="translate(500 500)" filter="url(#koa-intro-ray-blur)">
              <rect x="-430" y="-15" width="860" height="30" rx="15" fill="url(#koa-intro-red-ray)" transform="rotate(31)" />
              <rect x="-360" y="-10" width="720" height="20" rx="10" fill="url(#koa-intro-red-ray)" transform="rotate(112)" />
            </g>
            <g ref={blueRaysRef} className="koa-intro__rays koa-intro__rays--blue" transform="translate(500 500)" filter="url(#koa-intro-ray-blur)">
              <rect x="-460" y="-14" width="920" height="28" rx="14" fill="url(#koa-intro-blue-ray)" transform="rotate(-18)" />
              <rect x="-380" y="-9" width="760" height="18" rx="9" fill="url(#koa-intro-blue-ray)" transform="rotate(82)" />
            </g>
            <g ref={glareRef} className="koa-intro__glare" transform="translate(500 500)" filter="url(#koa-intro-glare-blur)">
              <rect x="-430" y="-5" width="860" height="10" rx="5" fill="url(#koa-intro-gold-ray)" transform="rotate(45)" />
              <rect x="-430" y="-5" width="860" height="10" rx="5" fill="url(#koa-intro-blue-ray)" transform="rotate(-45)" />
            </g>
            {/* Paint the woven K/A field first so the seal and orbit type always
                sit in front of the fragments during convergence and release. */}
            <g className="koa-intro__mini-glyphs koa-intro__mini-glyphs--k" aria-hidden="true">
              {K_GLYPHS.map((spec, index) => (
                <text
                  key={`k-${index}`}
                  ref={(node) => { if (node) kRefs.current[index] = node; }}
                  data-intro-glyph
                  className="koa-intro__mini-glyph"
                  data-final-transform={spec.finalTransform}
                  data-start-transform={spec.startTransform}
                  data-scatter-transform={spec.scatterTransform}
                  data-final-opacity={spec.finalOpacity}
                  style={{ "--glyph-delay": `${spec.delay.toFixed(2)}s` } as CSSProperties}
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={spec.variant === 0 ? 12 : spec.variant === 1 ? 15 : 18}
                  fill="url(#koa-intro-ink)"
                >{spec.char}</text>
              ))}
            </g>
            <g className="koa-intro__mini-glyphs koa-intro__mini-glyphs--a" aria-hidden="true">
              {A_GLYPHS.map((spec, index) => (
                <text
                  key={`a-${index}`}
                  ref={(node) => { if (node) aRefs.current[index] = node; }}
                  data-intro-glyph
                  className="koa-intro__mini-glyph"
                  data-final-transform={spec.finalTransform}
                  data-start-transform={spec.startTransform}
                  data-scatter-transform={spec.scatterTransform}
                  data-final-opacity={spec.finalOpacity}
                  style={{ "--glyph-delay": `${spec.delay.toFixed(2)}s` } as CSSProperties}
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={spec.variant === 0 ? 12 : spec.variant === 1 ? 15 : 18}
                  fill="url(#koa-intro-ink)"
                >{spec.char}</text>
              ))}
            </g>
            <g ref={orbitFrameRef} className="koa-intro__orbit koa-intro__authentic-orbit" transform="translate(500 500)">
              <g ref={orbitSpinRef} className="koa-intro__orbit-spin" transform="rotate(0 0 0)" clipPath="url(#koa-intro-seal-orbit-clip)" mask="url(#koa-intro-seal-orbit-mask)">
                <image className="koa-intro__authentic-orbit-image" href="/koa/assets/koa-seal-white-lettering-v2.png" x={-SEAL_SOURCE_SIZE / 2} y={-SEAL_SOURCE_SIZE / 2} width={SEAL_SOURCE_SIZE} height={SEAL_SOURCE_SIZE} preserveAspectRatio="xMidYMid slice" />
              </g>
              <circle className="koa-intro__orbit-occluder" cx="0" cy="0" r={SEAL_ORBIT_INNER_RADIUS} fill="url(#koa-intro-occluder)" />
            </g>
            <g ref={sealRef} className="koa-intro__seal koa-intro__seal--foreground" aria-label="KOA seal O">
              <circle className="koa-intro__seal-shadow" cx="0" cy="18" r="440" fill="#00030b" opacity="0.34" filter="url(#koa-intro-soft-glow)" />
              <g clipPath="url(#koa-intro-seal-core-clip)"><image href="/koa/assets/koa-seal-white-lettering-v2.png" x={-SEAL_SOURCE_SIZE / 2} y={-SEAL_SOURCE_SIZE / 2} width={SEAL_SOURCE_SIZE} height={SEAL_SOURCE_SIZE} preserveAspectRatio="xMidYMid slice" /></g>
            </g>
          </g>
          <text ref={captionRef} className="koa-intro__lockup-caption" x="500" y="690" textAnchor="middle">MANY PLACES · ONE COMMUNITY</text>
        </svg>
        <div ref={copyRef} className="koa-intro__copy" data-intro-copy>
          <p className="koa-intro__copy-kicker">{introCopy.kicker}</p>
          <h1 id={`koa-intro-title-${lang}`} data-koa-mission>{introCopy.title}</h1>
          <p id={`koa-intro-secondary-${lang}`} className="koa-intro__copy-body koa-intro__copy-body--secondary" data-koa-secondary>{introCopy.body}</p>
          <div className="koa-intro__copy-actions">
            <Link data-koa-action="primary" href={introCopy.primaryHref.replace("{lang}", lang)}>{introCopy.primaryLabel}<span aria-hidden="true">↗</span></Link>
            <Link data-koa-action="secondary" href={introCopy.secondaryHref.replace("{lang}", lang)}>{introCopy.secondaryLabel}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <span className="koa-intro__scroll-line" aria-hidden="true" />
      </div>
    </section>
  );
}

export default ScrollScrubIntro;
