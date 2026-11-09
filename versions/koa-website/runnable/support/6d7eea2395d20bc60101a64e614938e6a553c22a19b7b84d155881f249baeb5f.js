import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/DenseGlyphGrid.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var GLYPHS$1 = {
	en: [
		"က",
		"ည",
		"တ",
		"ထ",
		"န",
		"ပ",
		"ဖ",
		"မ",
		"ယ",
		"ရ",
		"လ",
		"ဝ",
		"သ",
		"ဟ",
		"အ",
		"ီ",
		"ၢ",
		"ၤ",
		"့",
		"း"
	],
	ksw: [
		"က",
		"ည",
		"တ",
		"န",
		"ပ",
		"ဖ",
		"မ",
		"ယ",
		"ရ",
		"လ",
		"ဝ",
		"သ",
		"ဟ",
		"အ",
		"ၢ",
		"ၤ",
		"့"
	],
	my: [
		"ခ",
		"ဂ",
		"င",
		"စ",
		"ဆ",
		"ဇ",
		"ဈ",
		"ဉ",
		"ဌ",
		"ဍ",
		"ဎ",
		"ဏ",
		"ထ",
		"ဒ",
		"ဓ",
		"ဗ",
		"ဘ",
		"ဠ"
	],
	th: [
		"ก",
		"ข",
		"ค",
		"ง",
		"จ",
		"ฉ",
		"ช",
		"ญ",
		"ด",
		"ต",
		"ถ",
		"ท",
		"น",
		"บ",
		"ป",
		"ผ",
		"ฝ",
		"พ",
		"ฟ",
		"ม",
		"ย",
		"ร",
		"ล",
		"ว",
		"ส",
		"ห",
		"อ"
	]
};
/** Dense fixed glyphs: pointer speed changes glyph identities, never their positions. */
function DenseGlyphGrid({ lang, reducedMotion }) {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d", { alpha: true });
		if (!canvas || !context) return;
		const base = document.createElement("canvas");
		const baseContext = base.getContext("2d");
		if (!baseContext) return;
		const cell = 12;
		const mutations = /* @__PURE__ */ new Map();
		const pulses = [];
		const pointer = {
			x: -1e3,
			y: -1e3,
			speed: 0,
			lastX: -1e3,
			lastY: -1e3,
			at: 0,
			active: false
		};
		let width = 1;
		let height = 1;
		let cols = 1;
		let rows = 1;
		let frame = 0;
		let lastDraw = 0;
		let lastPulse = 0;
		const glyphs = GLYPHS$1[lang];
		const font = lang === "th" ? "\"Noto Sans Thai\"" : "\"Noto Sans Myanmar\"";
		const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];
		const changeAt = (x, y, now) => {
			const col = Math.floor(x / cell);
			const row = Math.floor(y / cell);
			if (col < 0 || row < 0 || col >= cols || row >= rows) return;
			mutations.set(row * cols + col, {
				glyph: randomGlyph(),
				until: now + 430 + Math.random() * 500
			});
			if (mutations.size > 900) {
				const oldest = mutations.keys().next().value;
				if (oldest !== void 0) mutations.delete(oldest);
			}
		};
		const resize = () => {
			width = Math.max(1, window.innerWidth);
			height = Math.max(1, window.innerHeight);
			cols = Math.ceil(width / cell);
			rows = Math.ceil(height / cell);
			canvas.width = base.width = width;
			canvas.height = base.height = height;
			baseContext.clearRect(0, 0, width, height);
			baseContext.font = `10.8px ${font}, sans-serif`;
			baseContext.textBaseline = "top";
			baseContext.fillStyle = "rgba(151, 191, 232, .2)";
			for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
				const index = (row * 13 + col * 17 + row * col % 29) % glyphs.length;
				baseContext.fillText(glyphs[index], col * cell, row * cell);
			}
			mutations.clear();
		};
		const move = (event) => {
			const now = performance.now();
			const elapsed = Math.max(12, now - pointer.at);
			const distance = Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY);
			pointer.speed = Math.min(2, distance / elapsed);
			if (!reducedMotion && pointer.active) {
				const steps = Math.min(6, Math.ceil(distance / 16));
				for (let step = 1; step <= steps; step++) {
					const t = step / steps;
					changeAt(pointer.lastX + (event.clientX - pointer.lastX) * t, pointer.lastY + (event.clientY - pointer.lastY) * t, now);
				}
			}
			pointer.x = pointer.lastX = event.clientX;
			pointer.y = pointer.lastY = event.clientY;
			pointer.at = now;
			pointer.active = true;
			if (!reducedMotion && pointer.speed > .1 && now - lastPulse > 30) {
				pulses.push({
					x: pointer.x,
					y: pointer.y,
					start: now - 22,
					reach: 18 + pointer.speed * 25,
					life: 220
				});
				if (pulses.length > 12) pulses.shift();
				lastPulse = now;
			}
		};
		const click = (event) => {
			if (!reducedMotion) {
				const now = performance.now();
				pulses.push({
					x: event.clientX,
					y: event.clientY,
					start: now - 18,
					reach: 76,
					life: 320
				});
				pulses.push({
					x: event.clientX,
					y: event.clientY,
					start: now + 58,
					reach: 53,
					life: 310
				});
				changeAt(event.clientX, event.clientY, now);
			}
		};
		const leave = () => {
			pointer.active = false;
			pointer.speed = 0;
		};
		const draw = (now) => {
			frame = 0;
			if (document.hidden) return;
			if (!reducedMotion && now - lastDraw < 32) {
				frame = requestAnimationFrame(draw);
				return;
			}
			lastDraw = now;
			context.clearRect(0, 0, width, height);
			context.drawImage(base, 0, 0);
			if (!reducedMotion) {
				const speed = pointer.active && now - pointer.at < 110 ? pointer.speed : 0;
				const count = 1 + Math.round(Math.min(12, speed * 7));
				for (let index = 0; index < count; index++) {
					const nearPointer = pointer.active && Math.random() < .78;
					const spread = 24 + speed * 34;
					changeAt(nearPointer ? pointer.x + (Math.random() - .5) * spread : Math.random() * width, nearPointer ? pointer.y + (Math.random() - .5) * spread : Math.random() * height, now);
				}
				for (let index = pulses.length - 1; index >= 0; index--) {
					const pulse = pulses[index];
					const progress = (now - pulse.start) / pulse.life;
					if (progress >= 1) {
						pulses.splice(index, 1);
						continue;
					}
					if (progress < 0) continue;
					const radius = progress * pulse.reach;
					const samples = pulse.reach > 60 ? 42 : 26;
					for (let sample = 0; sample < samples; sample++) {
						const angle = sample / samples * Math.PI * 2;
						const liquidRadius = radius + Math.sin(angle * 5 - progress * 13) * Math.min(5, pulse.reach * .08);
						changeAt(pulse.x + Math.cos(angle) * liquidRadius, pulse.y + Math.sin(angle) * liquidRadius, now);
					}
				}
			}
			context.font = `10.8px ${font}, sans-serif`;
			context.textBaseline = "top";
			context.fillStyle = "rgba(151, 191, 232, .2)";
			for (const [index, mutation] of mutations) {
				if (mutation.until < now) {
					mutations.delete(index);
					continue;
				}
				const x = index % cols * cell;
				const y = Math.floor(index / cols) * cell;
				context.clearRect(x, y, cell, cell);
				context.fillText(mutation.glyph, x, y);
			}
			if (!reducedMotion) frame = requestAnimationFrame(draw);
		};
		const wake = () => {
			if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
		};
		resize();
		wake();
		window.addEventListener("resize", resize);
		window.addEventListener("pointermove", move, { passive: true });
		window.addEventListener("pointerdown", click, { passive: true });
		window.addEventListener("pointerleave", leave);
		document.addEventListener("visibilitychange", wake);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerdown", click);
			window.removeEventListener("pointerleave", leave);
			document.removeEventListener("visibilitychange", wake);
		};
	}, [lang, reducedMotion]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "site-atmosphere__dither",
		"aria-hidden": "true"
	});
}
//#endregion
//#region components/AtticDust.tsx
var GLYPHS = {
	en: [
		"က",
		"ည",
		"တ",
		"န",
		"ပ",
		"ဖ",
		"မ",
		"ယ",
		"ရ",
		"လ",
		"ဝ",
		"သ",
		"ဟ",
		"အ"
	],
	ksw: [
		"က",
		"ည",
		"တ",
		"န",
		"ပ",
		"ဖ",
		"မ",
		"ယ",
		"ရ",
		"လ",
		"ဝ",
		"သ",
		"ဟ",
		"အ",
		"ၢ",
		"ၤ",
		"့"
	],
	my: [
		"ခ",
		"ဂ",
		"င",
		"စ",
		"ဆ",
		"ဇ",
		"ဈ",
		"ဉ",
		"ဌ",
		"ဍ",
		"ဎ",
		"ဏ",
		"ထ",
		"ဒ",
		"ဓ",
		"ဗ",
		"ဘ",
		"ဠ"
	],
	th: [
		"ก",
		"ข",
		"ค",
		"ง",
		"จ",
		"ฉ",
		"ช",
		"ญ",
		"ด",
		"ต",
		"ถ",
		"ท",
		"น",
		"บ",
		"ป",
		"ผ",
		"ฝ",
		"พ",
		"ฟ",
		"ม",
		"ย",
		"ร",
		"ล",
		"ว",
		"ส",
		"ห",
		"อ"
	]
};
/** Karen-glyph dust travels in slow straight lines with long, staggered fade cycles. */
function AtticDust({ lang, reducedMotion }) {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context) return;
		const pointer = {
			x: -1e3,
			y: -1e3,
			vx: 0,
			vy: 0,
			at: 0
		};
		let width = 1;
		let height = 1;
		let motes = [];
		let frame = 0;
		let previous = 0;
		const makeMote = (stagger = false) => {
			const depth = .55 + Math.random() * 1.2;
			const angle = Math.random() * Math.PI * 2;
			const speed = (2 + Math.random() * 4) * depth;
			const life = 28 + Math.random() * 22;
			return {
				x: Math.random() * width,
				y: Math.random() * height,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				glyph: GLYPHS[lang][Math.floor(Math.random() * GLYPHS[lang].length)],
				size: 5 + Math.random() * 6 * depth,
				depth,
				age: stagger ? Math.random() * life : 0,
				life,
				driftX: 0,
				driftY: 0
			};
		};
		const resize = () => {
			width = Math.max(1, window.innerWidth);
			height = Math.max(1, window.innerHeight);
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			motes = Array.from({ length: Math.min(120, Math.max(60, Math.round(width * .09))) }, () => makeMote(true));
		};
		const move = (event) => {
			const now = performance.now();
			const dt = Math.max(12, now - pointer.at);
			pointer.vx = pointer.at ? Math.max(-2, Math.min(2, (event.clientX - pointer.x) / dt)) : 0;
			pointer.vy = pointer.at ? Math.max(-2, Math.min(2, (event.clientY - pointer.y) / dt)) : 0;
			pointer.x = event.clientX;
			pointer.y = event.clientY;
			pointer.at = now;
		};
		const draw = (now) => {
			frame = 0;
			if (document.hidden) return;
			const dt = Math.min(.05, previous ? (now - previous) / 1e3 : .016);
			previous = now;
			context.clearRect(0, 0, width, height);
			context.textBaseline = "top";
			for (let index = 0; index < motes.length; index++) {
				const mote = motes[index];
				if (!reducedMotion) {
					mote.age += dt;
					mote.x += mote.vx * dt;
					mote.y += mote.vy * dt;
					if (mote.age >= mote.life) {
						motes[index] = makeMote();
						continue;
					}
					const distance = Math.hypot(mote.x - pointer.x, mote.y - pointer.y);
					if (now - pointer.at < 320 && distance < 115) {
						const flow = (1 - distance / 115) ** 2 * mote.depth;
						mote.driftX += pointer.vx * flow * .4;
						mote.driftY += pointer.vy * flow * .4;
					}
					mote.driftX *= .985;
					mote.driftY *= .985;
				}
				const fade = Math.min(1, mote.age / 9, (mote.life - mote.age) / 9);
				context.globalAlpha = Math.max(0, fade) * .65 * Math.min(1, mote.depth);
				context.fillStyle = mote.depth > 1.15 ? "#f5e6c8" : "#a9bdd6";
				context.font = `${mote.size}px ${lang === "th" ? "\"Noto Sans Thai\"" : "\"Noto Sans Myanmar\""}, sans-serif`;
				context.fillText(mote.glyph, mote.x + mote.driftX, mote.y + mote.driftY);
			}
			context.globalAlpha = 1;
			if (!reducedMotion) frame = requestAnimationFrame(draw);
		};
		const wake = () => {
			if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
		};
		resize();
		wake();
		window.addEventListener("resize", resize);
		window.addEventListener("pointermove", move, { passive: true });
		document.addEventListener("visibilitychange", wake);
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", move);
			document.removeEventListener("visibilitychange", wake);
		};
	}, [lang, reducedMotion]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "site-atmosphere__dust",
		"aria-hidden": "true"
	});
}
//#endregion
//#region components/SiteAtmosphere.tsx
/** Shared aurora grid and Karen-glyph motes sit behind route content. */
function SiteAtmosphere({ lang }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "site-atmosphere",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DenseGlyphGrid, {
			lang,
			reducedMotion: false
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtticDust, {
			lang,
			reducedMotion: false
		})]
	});
}
//#endregion
export { SiteAtmosphere };
