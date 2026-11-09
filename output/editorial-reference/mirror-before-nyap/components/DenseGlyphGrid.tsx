"use client";

import { useEffect, useRef } from "react";

const GLYPHS = ["က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ည", "တ", "ထ", "ဒ", "န", "ပ", "ဖ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ၡ", "အၢ", "အၣ", "အၤ"];
const CELL = 12;
const EMPTY = 255;

/** The October 5 persistent grid remains the base; one Gaussian wake dissolves over its cells. */
export function DenseGlyphGrid({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const staticMotion = new URLSearchParams(window.location.search).get("motion") === "off";
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const field = canvas.parentElement;
    const base = document.createElement("canvas");
    const baseContext = base.getContext("2d");
    if (!baseContext) return;

    let width = 1;
    let height = 1;
    let columns = 1;
    let rows = 1;
    let cells = new Uint8Array(0);
    let trailEnergy = new Float32Array(0);
    let trailGlyphs = new Uint8Array(0);
    let trailFrame = 0;
    let trailTime = performance.now();
    let visible = true;
    let disposed = false;
    let distanceBudget = 0;
    let glyphEpoch = 0;
    let lastTick = performance.now();
    const awake = new Set<number>();
    const pointer = { x: 0, y: 0, at: 0, speed: 0, active: false };

    const chooseGlyph = (column: number, row: number, current = EMPTY) => {
      const blocked = new Set<number>([current]);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const x = column + dx;
        const y = row + dy;
        if (x < 0 || y < 0 || x >= columns || y >= rows) continue;
        const neighbor = cells[y * columns + x];
        if (neighbor !== EMPTY) blocked.add(neighbor);
      }
      const options = GLYPHS.map((_, index) => index).filter((index) => !blocked.has(index));
      return options[Math.floor(Math.random() * options.length)] ?? 0;
    };

    const paintCell = (column: number, row: number) => {
      const x = column * CELL;
      const y = row * CELL;
      baseContext.save();
      baseContext.beginPath();
      baseContext.rect(x, y, CELL, CELL);
      baseContext.clip();
      baseContext.clearRect(x, y, CELL, CELL);
      const index = row * columns + column;
      baseContext.fillStyle = "rgba(245, 225, 185, .13)";
      baseContext.fillText(GLYPHS[cells[index]], x, y);
      baseContext.restore();
    };

    const render = () => {
      context.clearRect(0, 0, width, height);
      context.drawImage(base, 0, 0);
      context.save();
      context.textBaseline = "top";
      for (const index of awake) {
        const energy = trailEnergy[index];
        if (energy < .008) continue;
        const eased = 1 - Math.pow(1 - Math.min(1, energy), 3);
        const column = index % columns;
        const row = Math.floor(index / columns);
        const fontSize = 10.8 + eased * 1.8;
        context.font = `400 ${fontSize}px "Noto Sans Myanmar", sans-serif`;
        context.fillStyle = `rgba(246, 211, 132, ${.09 + eased * .34})`;
        context.shadowColor = `rgba(227, 180, 92, ${eased * .28})`;
        context.shadowBlur = 3 + eased * 9;
        context.fillText(GLYPHS[trailGlyphs[index]], column * CELL, row * CELL - eased * .7);
      }
      context.restore();
    };

    const paintAll = () => {
      baseContext.font = '10.8px "Noto Sans Myanmar", sans-serif';
      baseContext.textBaseline = "top";
      baseContext.fillStyle = "rgba(245, 225, 185, .13)";
      baseContext.clearRect(0, 0, width, height);
      for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) paintCell(column, row);
      render();
    };

    const resize = () => {
      const bounds = field?.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds?.width ?? window.innerWidth));
      const nextHeight = Math.max(1, Math.round(bounds?.height ?? window.innerHeight));
      if (nextWidth === width && nextHeight === height && cells.length) return;
      width = nextWidth;
      height = nextHeight;
      columns = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      base.width = width;
      base.height = height;
      cells = new Uint8Array(columns * rows);
      trailEnergy = new Float32Array(columns * rows);
      trailGlyphs = new Uint8Array(columns * rows);
      awake.clear();
      cells.fill(EMPTY);
      // Row order plus the neighbor check makes the initial random field nonrepeating.
      for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
        cells[row * columns + column] = chooseGlyph(column, row);
      }
      paintAll();
    };

    const replaceRandomCell = () => {
      const column = Math.floor(Math.random() * columns);
      const row = Math.floor(Math.random() * rows);
      const index = row * columns + column;
      cells[index] = chooseGlyph(column, row, cells[index]);
      paintCell(column, row);
    };

    const wakeCell = (column: number, row: number, strength: number) => {
      if (column < 0 || row < 0 || column >= columns || row >= rows) return;
      const index = row * columns + column;
      if (strength <= trailEnergy[index]) return;
      const wasQuiet = !awake.has(index);
      awake.add(index);
      trailEnergy[index] = strength;
      // Hover lights the existing cell. Character changes are quantized by travel/click.
      if (wasQuiet) trailGlyphs[index] = glyphEpoch ? (cells[index] + glyphEpoch) % GLYPHS.length : cells[index];
    };

    const wakeTrail = (fromX: number, fromY: number, toX: number, toY: number, now: number) => {
      const distance = Math.hypot(toX - fromX, toY - fromY);
      const steps = Math.max(1, Math.ceil(distance / (CELL * .7)));
      for (let step = 0; step <= steps; step++) {
        const mix = step / steps;
        const column = Math.floor((fromX + (toX - fromX) * mix) / CELL);
        const row = Math.floor((fromY + (toY - fromY) * mix) / CELL);
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const radiusSquared = dx * dx + dy * dy;
          if (radiusSquared > 8) continue;
          // Gaussian radial falloff: e^(-r² / 2σ²), tapered along the sampled path.
          const radial = Math.exp(-radiusSquared / 3.2);
          const pathTaper = .72 + .28 * Math.sin(Math.PI * mix);
          wakeCell(column + dx, row + dy, radial * pathTaper);
        }
      }
      wakeTrailFrame();
    };

    const animateTrail = (now: number) => {
      trailFrame = 0;
      const dt = Math.min(.05, Math.max(0, (now - trailTime) / 1000));
      trailTime = now;
      // Exponential decay is frame-rate independent: E(t)=E0·e^(-λt).
      const decay = Math.exp(-1.12 * dt);
      let alive = false;
      for (const index of awake) {
        trailEnergy[index] *= decay;
        if (trailEnergy[index] >= .008) alive = true;
        else { trailEnergy[index] = 0; awake.delete(index); }
      }
      render();
      if (alive && visible && !document.hidden) trailFrame = requestAnimationFrame(animateTrail);
    };

    function wakeTrailFrame() {
      if (!trailFrame && visible && !document.hidden) {
        trailTime = performance.now();
        trailFrame = requestAnimationFrame(animateTrail);
      }
    }

    const move = (event: PointerEvent) => {
      const now = performance.now();
      if (event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      const nextX = event.clientX - bounds.left;
      const nextY = event.clientY - bounds.top;
      if (pointer.active) {
        const elapsed = Math.max(8, now - pointer.at);
        pointer.speed = Math.min(2.4, Math.hypot(nextX - pointer.x, nextY - pointer.y) / elapsed);
      }
      if (pointer.active) {
        distanceBudget += Math.hypot(nextX - pointer.x, nextY - pointer.y);
        if (distanceBudget >= 64 && !staticMotion && !reducedMotion) {
          glyphEpoch++; distanceBudget %= 64;
          for (let cell = 0; cell < 6; cell++) replaceRandomCell();
        }
      }
      if (pointer.active && !staticMotion && !reducedMotion && now - pointer.at < 180) wakeTrail(pointer.x, pointer.y, nextX, nextY, now);
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.at = now;
      pointer.active = true;
    };

    const click = (event: PointerEvent) => {
      if (staticMotion || reducedMotion || event.pointerType === "touch") return;
      glyphEpoch++;
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
      wakeTrail(x - CELL * 2, y, x + CELL * 2, y, performance.now());
    };
    const leave = () => { pointer.active = false; pointer.speed = 0; };
    const tick = () => {
      if (staticMotion) return;
      const now = performance.now();
      const elapsed = Math.min(.2, Math.max(0, (now - lastTick) / 1000));
      lastTick = now;
      if (document.hidden || !visible) return;
      // Cached ink breathes autonomously; pointer/click mutations keep their separate distance budget.
      if (reducedMotion) return;
      canvas.style.opacity = String(.32 + .04 * Math.sin(now * .00027));

    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTick = performance.now();
    }, { threshold: 0 });
    const sizeObserver = new ResizeObserver(resize);
    resize();
    if (field) observer.observe(field);
    if (field) sizeObserver.observe(field);
    const timer = window.setInterval(tick, 80);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", click, { passive: true });
    void document.fonts.ready.then(() => { if (!disposed) paintAll(); });

    return () => {
      disposed = true;
      window.clearInterval(timer);
      if (trailFrame) cancelAnimationFrame(trailFrame);
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", click);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="site-atmosphere__dither" aria-hidden="true" />;
}
