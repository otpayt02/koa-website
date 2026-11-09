from pathlib import Path

root = Path(__file__).resolve().parents[1]
def edit(name, old, new):
    path = root / name
    text = path.read_text(encoding='utf-8')
    assert old in text, name
    path.write_text(text.replace(old, new), encoding='utf-8')

edit('components/motionPreference.ts', '// Ambient grid and motes move by default; the explicit QA query freezes them.', '// Motion runs by default; respect the OS preference and the explicit QA freeze.')
edit('components/motionPreference.ts', '_media: MediaQueryList', 'media: MediaQueryList')
edit('components/motionPreference.ts', 'return mode === "off";', 'return mode === "off" || media.matches;')

edit('components/CinematicLanding.tsx', 'import { useEffect, useState }', 'import { useEffect, useRef, useState }')
edit('components/CinematicLanding.tsx', 'import type { Lang, Messages }', 'import { shouldReduceMotion } from "./motionPreference";\nimport type { Lang, Messages }')
edit('components/CinematicLanding.tsx', '  useEffect(() => {\n    const timer', '''  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(shouldReduceMotion(media));
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Fifteen-second chapters pause while someone reads or operates the tabs.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer''')
edit('components/CinematicLanding.tsx', '() => setActivePillar((current) => (current + 1) % pillars.length)', '() => { if (!document.hidden) setActivePillar((current) => (current + 1) % pillars.length); }')
edit('components/CinematicLanding.tsx', '  }, []);\n  const pillar', '  }, [paused, reducedMotion, activePillar]);\n  const pillar')
edit('components/CinematicLanding.tsx', '''    <div className="koa-static-portrait">
      <img src="/koa/assets/fb-capitol-flags-mobile-enhanced.png" alt="Karen community members holding flags before the U.S. Capitol" fetchPriority="high" />
    </div>''', '''    <div className="koa-static-portrait" aria-hidden="true">
      {/* Preserve the existing lead photo; additional frames are documented originals. */}
      <img src="/koa/assets/fb-capitol-flags-mobile-enhanced.png" alt="" fetchPriority="high" />
      <img src="/koa/assets/washington-advocacy.jpg" alt="" />
      <img src="/koa/assets/fb-outdoor-gathering.jpg" alt="" />
    </div>''')
edit('components/CinematicLanding.tsx', '<HeritageGlyphMark reducedMotion={false} />', '<HeritageGlyphMark reducedMotion={reducedMotion} />')
edit('components/CinematicLanding.tsx', '<div className="koa-static-pillars" aria-label="KOA\'s three core services">', '''<div className="koa-static-pillars" aria-label="KOA's three core services" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false); }}>''')
edit('components/CinematicLanding.tsx', '<div className="koa-static-pillar-tabs" role="tablist" aria-label="Three core pillars">', '''<div ref={tabsRef} className="koa-static-pillar-tabs" role="tablist" aria-label="Three core pillars" onKeyDown={(event) => {
        const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? pillars.length - 1 : (activePillar + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + pillars.length) % pillars.length;
        setActivePillar(next); tabsRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
      }}>''')
edit('components/CinematicLanding.tsx', 'role="tab" aria-selected=', 'role="tab" tabIndex={activePillar === index ? 0 : -1} aria-selected=')
edit('components/CinematicLanding.tsx', 'role="tabpanel" aria-live="polite"', 'role="tabpanel" tabIndex={0}')

edit('components/cinematic/HeritageGlyphMark.tsx', 'for (const mark of [...marks].sort((a, b) => a.layer - b.layer))', 'for (const mark of marks)')
edit('components/cinematic/HeritageGlyphMark.tsx', 'marks = buildMarks(width);', 'marks = buildMarks(width).sort((a, b) => a.layer - b.layer);')
edit('components/cinematic/HeritageGlyphMark.tsx', 'Math.exp(-15 * pointerDt)', 'Math.exp(-22 * pointerDt)')
edit('components/cinematic/HeritageGlyphMark.tsx', '[1.15, 2.45, 4.2]', '[1.4, 3.2, 5.6]')
edit('components/cinematic/HeritageGlyphMark.tsx', '      for (const mark of marks)', '''      canvas.parentElement?.style.setProperty("--seal-lean-x", `${staticMotion ? 0 : -pointerY * 2}deg`);
      canvas.parentElement?.style.setProperty("--seal-lean-y", `${staticMotion ? 0 : pointerX * 3}deg`);
      for (const mark of marks)''')

edit('components/DenseGlyphGrid.tsx', '    let budget = 0;', '    let distanceBudget = 0;\n    let glyphEpoch = 0;')
edit('components/DenseGlyphGrid.tsx', '    let lastTick = performance.now();', '    let lastTick = performance.now();\n    const awake = new Set<number>();')
edit('components/DenseGlyphGrid.tsx', 'for (let index = 0; index < trailEnergy.length; index++) {', 'for (const index of awake) {')
edit('components/DenseGlyphGrid.tsx', '        context.font = `600', '        context.font = `400')
edit('components/DenseGlyphGrid.tsx', '      trailEnergy[index] = strength;\n      trailGlyphs[index] = chooseGlyph(column, row, cells[index]);', '''      const wasQuiet = !awake.has(index);
      awake.add(index);
      trailEnergy[index] = strength;
      // Hover lights the existing cell. Character changes are quantized by travel/click.
      if (wasQuiet) trailGlyphs[index] = glyphEpoch ? (cells[index] + glyphEpoch) % GLYPHS.length : cells[index];''')
edit('components/DenseGlyphGrid.tsx', 'Math.exp(-1.72 * dt)', 'Math.exp(-1.12 * dt)')
edit('components/DenseGlyphGrid.tsx', '        if (trailEnergy[index] >= .008) alive = true;', '        if (trailEnergy[index] >= .008) alive = true;\n        else { trailEnergy[index] = 0; awake.delete(index); }')
edit('components/DenseGlyphGrid.tsx', '      trailGlyphs = new Uint8Array(columns * rows);', '      trailGlyphs = new Uint8Array(columns * rows);\n      awake.clear();')
edit('components/DenseGlyphGrid.tsx', '      if (pointer.active && !reducedMotion', '''      if (pointer.active) {
        distanceBudget += Math.hypot(nextX - pointer.x, nextY - pointer.y);
        if (distanceBudget >= 64) { glyphEpoch++; distanceBudget %= 64; }
      }
      if (pointer.active && !staticMotion && !reducedMotion''')
start = '      const recentSpeed = pointer.active ? pointer.speed * Math.max(0, 1 - (now - pointer.at) / 420) : 0;'
path = root / 'components/DenseGlyphGrid.tsx'
text = path.read_text(encoding='utf-8'); begin = text.index(start); end = text.index('      render();', begin)
text = text[:begin] + '''      // No inertial randomization after the pointer stops. Only the wake fades.
      if (reducedMotion || now - pointer.at > 80 || !pointer.active) return;
      const count = Math.min(8, Math.floor(elapsed * pointer.speed * 90));
      for (let index = 0; index < count; index++) replaceRandomCell();
''' + text[end:]
text = text.replace('    const leave = () =>', '''    const click = (event: PointerEvent) => {
      if (staticMotion || reducedMotion || event.pointerType === "touch") return;
      glyphEpoch++;
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
      wakeTrail(x - CELL * 2, y, x + CELL * 2, y, performance.now());
    };
    const leave = () =>''').replace('    window.addEventListener("pointerleave", leave);', '    window.addEventListener("pointerleave", leave);\n    window.addEventListener("pointerdown", click, { passive: true });').replace('      window.removeEventListener("pointerleave", leave);', '      window.removeEventListener("pointerleave", leave);\n      window.removeEventListener("pointerdown", click);')
path.write_text(text, encoding='utf-8')
