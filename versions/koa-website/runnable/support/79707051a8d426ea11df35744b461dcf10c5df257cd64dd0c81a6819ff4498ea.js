import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as Link } from "./link-BdWpm11-.js";
import { i as pageLabels, t as getMessages } from "./i18n-CzlE-Eia.js";
//#region components/cinematic/KAGlyphField.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var KAREN_GLYPHS = Array.from({ length: 32 }, (_, index) => String.fromCodePoint(43488 + index));
var clamp = (value) => Math.min(1, Math.max(0, value));
var smooth = (value) => {
	const x = clamp(value);
	return x * x * (3 - 2 * x);
};
function pointInPolygon(point, polygon) {
	let inside = false;
	for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
		const a = polygon[current];
		const b = polygon[previous];
		if (a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
	}
	return inside;
}
function insideK(point) {
	const spine = point.x >= .04 && point.x <= .25;
	const upper = pointInPolygon(point, [
		{
			x: .21,
			y: .46
		},
		{
			x: .58,
			y: 0
		},
		{
			x: .88,
			y: 0
		},
		{
			x: .47,
			y: .49
		}
	]);
	const lower = pointInPolygon(point, [
		{
			x: .21,
			y: .54
		},
		{
			x: .58,
			y: 1
		},
		{
			x: .91,
			y: 1
		},
		{
			x: .47,
			y: .51
		}
	]);
	return spine || upper || lower;
}
function insideA(point) {
	const left = pointInPolygon(point, [
		{
			x: .45,
			y: 0
		},
		{
			x: .56,
			y: 0
		},
		{
			x: .34,
			y: 1
		},
		{
			x: .06,
			y: 1
		}
	]);
	const right = pointInPolygon(point, [
		{
			x: .44,
			y: 0
		},
		{
			x: .55,
			y: 0
		},
		{
			x: .94,
			y: 1
		},
		{
			x: .66,
			y: 1
		}
	]);
	const bar = point.y >= .58 && point.y <= .7 && point.x >= .24 && point.x <= .76;
	return left || right || bar;
}
function buildMarks(width, hero) {
	const rows = hero ? width < 720 ? 20 : 26 : width < 720 ? 20 : 28;
	const baselineRows = width < 720 ? 29 : 40;
	const marks = [];
	const mask = hero ? document.createElement("canvas") : null;
	const maskInk = mask?.getContext("2d", { willReadFrequently: true });
	if (mask && maskInk) {
		mask.width = mask.height = 240;
		maskInk.font = "700 230px \"Cormorant Garamond\", Georgia, serif";
		maskInk.textAlign = "center";
		maskInk.textBaseline = "middle";
		maskInk.lineWidth = 8;
		maskInk.lineJoin = "round";
	}
	for (const letter of ["K", "A"]) {
		const letterStart = marks.length;
		if (maskInk) {
			maskInk.clearRect(0, 0, 240, 240);
			maskInk.fillText(letter, 120, 125);
			maskInk.strokeText(letter, 120, 125);
		}
		const pixels = maskInk?.getImageData(0, 0, 240, 240).data;
		const contains = pixels ? (point) => pixels[(Math.min(239, Math.floor((.08 + point.y * .84) * 240)) * 240 + Math.min(239, Math.floor((.16 + point.x * .68) * 240))) * 4 + 3] > 80 : letter === "K" ? insideK : insideA;
		for (let row = 0; row < rows; row++) for (let column = 0; column < rows; column++) {
			const point = {
				x: (column + .33 + row % 2 * .34) / rows,
				y: (row + .5) / rows
			};
			if (!contains(point)) continue;
			const index = marks.length;
			const edge = [
				[.75 / rows, 0],
				[-.75 / rows, 0],
				[0, .75 / rows],
				[0, -.75 / rows]
			].some(([dx, dy]) => !contains({
				x: point.x + dx,
				y: point.y + dy
			}));
			marks.push({
				letter,
				point,
				char: KAREN_GLYPHS[(index * 13 + row * 7) % KAREN_GLYPHS.length],
				tone: index % 19 === 0 ? "red" : index % 7 === 0 ? "gold" : "paper",
				size: hero ? (edge ? 1.64 : 1.53) * (1.5 + index * .61803398875 % 1) / baselineRows : (edge ? 1.08 : .96) / rows,
				phase: index * .61803398875 % 1 * Math.PI * 2
			});
		}
		if (hero && marks.length > letterStart) {
			const letterMarks = marks.slice(letterStart);
			const xs = letterMarks.map((mark) => mark.point.x);
			const ys = letterMarks.map((mark) => mark.point.y);
			const minX = Math.min(...xs), maxX = Math.max(...xs);
			const minY = Math.min(...ys), maxY = Math.max(...ys);
			for (const mark of letterMarks) mark.point = {
				x: .04 + .92 * (mark.point.x - minX) / Math.max(.01, maxX - minX),
				y: .04 + .92 * (mark.point.y - minY) / Math.max(.01, maxY - minY)
			};
		}
	}
	return marks;
}
function composition(width, height, progress, hero) {
	if (hero) {
		const mobile = width < 720;
		const sealSize = height * (mobile ? .65 : .8);
		const letterWidth = Math.min(sealSize * (mobile ? .92 : .96), (width - sealSize - 20) / 2);
		return {
			centerX: width / 2,
			centerY: height * .54,
			letterWidth,
			letterHeight: sealSize,
			letterOffset: sealSize * .5 + 10 + letterWidth * .5
		};
	}
	const rise = smooth((progress - .55) / .16);
	const sealSize = Math.min(Math.min(width, height) * .68, 560, width * .4) * (1 - rise * .42);
	const mobile = width < 720;
	const gap = Math.min(width * .035, 20);
	const letterWidth = Math.min(mobile ? Math.min(sealSize * .9, width * .25) : sealSize * .74, (width - sealSize - gap * 2) / 2);
	return {
		centerX: width / 2,
		centerY: height * (.54 - rise * .16),
		letterWidth,
		letterHeight: sealSize * (mobile ? 1.14 : 1.04),
		letterOffset: sealSize * .5 + gap + letterWidth * .5
	};
}
function KAGlyphField({ progress, reducedMotion, hero = false, loading = false }) {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context) return;
		let width = 1;
		let height = 1;
		let frame = 0;
		let visible = true;
		let mounted = true;
		let marks = [];
		const startedAt = performance.now();
		const sprites = /* @__PURE__ */ new Map();
		const draw = (now) => {
			frame = 0;
			context.clearRect(0, 0, width, height);
			const layout = composition(width, height, progress.current, hero);
			const phase = (now - startedAt) % 2400 / 2400;
			const scatter = loading && !reducedMotion ? phase < .43 ? smooth(phase / .43) : phase < .88 ? 1 - smooth((phase - .43) / .45) : 0 : 0;
			for (const mark of marks) {
				const key = mark.char + ":" + mark.tone;
				let sprite = sprites.get(key);
				if (!sprite) {
					sprite = document.createElement("canvas");
					sprite.width = 80;
					sprite.height = 80;
					const ink = sprite.getContext("2d");
					if (ink) {
						ink.textAlign = "center";
						ink.textBaseline = "middle";
						ink.font = "64px \"Noto Sans Myanmar\", sans-serif";
						ink.fillStyle = mark.tone === "red" ? "#dc4b4f" : mark.tone === "gold" ? "#f0b84f" : "#f5efe4";
						ink.fillText(mark.char, 40, 40, 64);
					}
					sprites.set(key, sprite);
				}
				const breath = reducedMotion ? 1 : .93 + .07 * Math.sin(now * 65e-5 + mark.phase);
				const cell = mark.size * layout.letterHeight * (reducedMotion ? 1 : .985 + breath * .015) * 1.25;
				const alive = hero && !reducedMotion ? Math.sin(now * .0011 + mark.phase) * 1.1 : 0;
				const loadingOffset = loading ? layout.letterWidth * .5 + 9 : layout.letterOffset;
				const drift = scatter * Math.min(width, height) * .36;
				const x = layout.centerX + (mark.letter === "K" ? -loadingOffset : loadingOffset) + (mark.point.x - .5) * layout.letterWidth + alive + Math.cos(mark.phase * 2.3) * drift;
				const y = layout.centerY + (mark.point.y - .5) * layout.letterHeight + Math.sin(mark.phase * 2.3) * drift * .7;
				context.globalAlpha = (hero ? mark.tone === "paper" ? .52 : .48 : mark.tone === "paper" ? .83 : .76) * breath * (1 - scatter * .32);
				context.drawImage(sprite, x - cell / 2, y - cell / 2, cell, cell);
			}
			context.globalAlpha = 1;
			if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(draw);
		};
		const wake = () => {
			if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
		};
		const resize = () => {
			const bounds = canvas.getBoundingClientRect();
			width = Math.max(1, bounds.width);
			height = Math.max(1, bounds.height);
			const dpr = Math.min(width < 720 ? 1.25 : 1.5, window.devicePixelRatio || 1);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			marks = buildMarks(width, hero);
			draw(performance.now());
		};
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible) wake();
		}, { threshold: .01 });
		const sizeObserver = new ResizeObserver(resize);
		resize();
		document.fonts.ready.then(() => {
			if (mounted) {
				sprites.clear();
				resize();
			}
		});
		observer.observe(canvas);
		sizeObserver.observe(canvas);
		document.addEventListener("visibilitychange", wake);
		return () => {
			mounted = false;
			observer.disconnect();
			sizeObserver.disconnect();
			document.removeEventListener("visibilitychange", wake);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [
		progress,
		reducedMotion,
		hero,
		loading
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "koa-ka-glyph-field",
		"aria-hidden": "true"
	});
}
//#endregion
//#region components/cinematic/SealAssembly.tsx
function SealAssembly({ rotation }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cinematic-seal",
		style: { "--seal-annulus-turn": `${rotation}deg` },
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			className: "cinematic-seal__core",
			src: "/koa/assets/koa-seal-white-lettering-v2.png",
			alt: "",
			width: "1254",
			height: "1254",
			"aria-hidden": "true",
			draggable: "false"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			className: "cinematic-seal__annulus",
			src: "/koa/assets/koa-seal-white-lettering-v2.png",
			alt: "",
			width: "1254",
			height: "1254",
			"aria-hidden": "true",
			draggable: "false"
		})]
	});
}
//#endregion
//#region components/HomeLanding.tsx
var priorities = [
	"home",
	"about",
	"services",
	"community",
	"dictionary",
	"contribute",
	"translation",
	"collaborate",
	"board",
	"changelog",
	"ai",
	"music",
	"contact"
];
var previews = {
	services: {
		image: "/koa/assets/programs-community-mobile-generated.png",
		label: pageLabels.services,
		detail: pageLabels.translation
	},
	collaborate: {
		image: "/koa/assets/fb-capitol-flags-mobile-enhanced.png",
		label: pageLabels.collaborate,
		detail: pageLabels.contribute
	},
	contact: {
		image: "/koa/assets/hero-community-mobile-enhanced.png",
		label: pageLabels.contact,
		detail: pageLabels.community
	}
};
/** A complete first-screen introduction; other journeys begin through explicit links. */
function HomeLanding({ lang }) {
	const messages = getMessages(lang);
	const markProgress = (0, import_react.useRef)(0);
	const sealTilt = (0, import_react.useRef)(null);
	const [reduced, setReduced] = (0, import_react.useState)(true);
	const [line, setLine] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [preview, setPreview] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!preview) return;
		const close = (event) => {
			if (event.key === "Escape") setPreview(null);
		};
		window.addEventListener("keydown", close);
		return () => window.removeEventListener("keydown", close);
	}, [preview]);
	(0, import_react.useEffect)(() => {
		const move = (event) => {
			if (event.pointerType === "touch" || !sealTilt.current) return;
			const bounds = sealTilt.current.getBoundingClientRect();
			const dx = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (window.innerWidth / 2)));
			const dy = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / (window.innerHeight / 2)));
			sealTilt.current.style.setProperty("--tilt-x", `${(-dy * 6).toFixed(2)}deg`);
			sealTilt.current.style.setProperty("--tilt-y", `${(dx * 6).toFixed(2)}deg`);
		};
		window.addEventListener("pointermove", move, { passive: true });
		return () => window.removeEventListener("pointermove", move);
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => setLoading(false), 2600);
		return () => window.clearTimeout(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setReduced(media.matches);
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		if (reduced) return;
		const timer = window.setInterval(() => setLine((current) => (current + 1) % priorities.length), 4200);
		return () => window.clearInterval(timer);
	}, [reduced]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "koa-home",
		"data-preview": preview || void 0,
		"data-styleseed-recipe": "public-service",
		"aria-labelledby": "koa-home-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "koa-home__photo",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "koa-home__veil",
				"aria-hidden": "true"
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "koa-home__loader",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KAGlyphField, {
					progress: markProgress,
					reducedMotion: false,
					hero: true,
					loading: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "koa-home__content",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-home__mark",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KAGlyphField, {
							progress: markProgress,
							reducedMotion: false,
							hero: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "koa-home__seal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "koa-home__seal-arrival",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "koa-home__seal-tilt",
									ref: sealTilt,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SealAssembly, { rotation: 0 })
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-home__names",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "koa-home-title",
							lang: lang === "ksw" ? "en" : lang,
							children: lang === "th" || lang === "my" ? messages.siteName : "Karen Organization of America"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "koa-home__karen",
							lang: "ksw",
							children: "ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "koa-home__subheading",
						lang,
						children: pageLabels.home[lang]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-home__cycle",
						"aria-label": messages.explore,
						lang,
						children: [!reduced && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "koa-home__cycle-index",
							"aria-hidden": "true",
							children: [
								String(line + 1).padStart(2, "0"),
								" / ",
								priorities.length
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: pageLabels[priorities[reduced ? 0 : line]][lang] }, line)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "koa-home__actions",
						"aria-label": messages.explore,
						lang,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "koa-home__action koa-home__action--primary",
								onClick: () => setPreview("services"),
								children: [
									messages.explore,
									" ",
									messages.services,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "↗"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "koa-home__action",
								onClick: () => setPreview("collaborate"),
								children: [
									messages.collaborate,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "↗"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "koa-home__action",
								onClick: () => setPreview("contact"),
								children: [
									messages.contact,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "↗"
									})
								]
							})
						]
					})
				]
			}),
			preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "koa-home__preview",
				role: "region",
				"aria-label": previews[preview].label[lang],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "koa-home__preview-image",
					style: { backgroundImage: `url(${previews[preview].image})` },
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "koa-home__preview-copy",
					lang,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "koa-home__preview-close",
							type: "button",
							autoFocus: true,
							onClick: () => setPreview(null),
							"aria-label": messages.close,
							children: "×"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: previews[preview].label[lang] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: previews[preview].detail[lang] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "koa-home__action",
							href: `/${lang}/${preview}`,
							children: [
								messages.learnMore,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "↗"
								})
							]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { HomeLanding };
