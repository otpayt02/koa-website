import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as Link } from "./link-DiLTuv2w.js";
import { n as publicPartners } from "./partners-cbbpqUHj.js";
//#region components/cinematic/KAGlyphField.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SYLLABLES = [
	"က",
	"ခ",
	"ဂ",
	"င",
	"စ",
	"ဆ",
	"ည",
	"တ",
	"ထ",
	"ဒ",
	"န",
	"ပ",
	"ဖ",
	"ဘ",
	"မ",
	"ယ",
	"ရ",
	"လ",
	"ဝ",
	"သ",
	"ဟ",
	"အ",
	"ကညီ",
	"တၢ်",
	"ပှၤ",
	"ကျိာ်",
	"ဒီး",
	"လၢ",
	"တဝၢ",
	"ဃူ",
	"ဖိး",
	"က့ၤ",
	"မၤ",
	"သ့",
	"ဘၣ်"
];
var K_OUTLINE = [
	{
		x: .14,
		y: .18
	},
	{
		x: .21,
		y: .18
	},
	{
		x: .21,
		y: .42
	},
	{
		x: .34,
		y: .18
	},
	{
		x: .41,
		y: .18
	},
	{
		x: .29,
		y: .48
	},
	{
		x: .42,
		y: .8
	},
	{
		x: .35,
		y: .8
	},
	{
		x: .21,
		y: .56
	},
	{
		x: .21,
		y: .8
	},
	{
		x: .14,
		y: .8
	},
	{
		x: .14,
		y: .18
	}
];
var A_OUTLINE = [
	{
		x: .59,
		y: .8
	},
	{
		x: .7,
		y: .18
	},
	{
		x: .78,
		y: .18
	},
	{
		x: .9,
		y: .8
	},
	{
		x: .83,
		y: .8
	},
	{
		x: .79,
		y: .61
	},
	{
		x: .69,
		y: .61
	},
	{
		x: .66,
		y: .8
	},
	{
		x: .59,
		y: .8
	}
];
var A_BAR = [{
	x: .69,
	y: .51
}, {
	x: .8,
	y: .51
}];
function seeded(index, salt) {
	let value = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
	value = Math.imul(value ^ value >>> 13, 1274126177);
	return ((value ^ value >>> 16) >>> 0) / 4294967296;
}
function clamp$1(value) {
	return Math.min(1, Math.max(0, value));
}
function easeOutQuart(value) {
	return 1 - Math.pow(1 - clamp$1(value), 4);
}
function mix(a, b, amount) {
	return a + (b - a) * amount;
}
function pointAlong(points, amount) {
	if (points.length < 2) return points[0] ?? {
		x: .5,
		y: .5
	};
	const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
	const total = lengths.reduce((sum, length) => sum + length, 0);
	let remaining = clamp$1(amount) * total;
	for (let index = 0; index < lengths.length; index += 1) {
		if (remaining <= lengths[index] || index === lengths.length - 1) {
			const local = lengths[index] === 0 ? 0 : remaining / lengths[index];
			return {
				x: mix(points[index].x, points[index + 1].x, local),
				y: mix(points[index].y, points[index + 1].y, local)
			};
		}
		remaining -= lengths[index];
	}
	return points.at(-1);
}
function formationTarget(index, count) {
	const normalized = index / Math.max(1, count - 1);
	if (normalized < .44) return pointAlong(K_OUTLINE, normalized / .44);
	if (normalized < .88) {
		const local = (normalized - .44) / .44;
		return local < .84 ? pointAlong(A_OUTLINE, local / .84) : pointAlong(A_BAR, (local - .84) / .16);
	}
	const angle = (normalized - .88) / .12 * Math.PI * 2;
	return {
		x: .5 + Math.cos(angle) * .105,
		y: .49 + Math.sin(angle) * .175
	};
}
function buildParticles(count) {
	return Array.from({ length: count }, (_, index) => {
		const target = formationTarget(index, count);
		const side = seeded(index, 4) > .5 ? 1 : -1;
		const start = {
			x: seeded(index, 2),
			y: seeded(index, 3)
		};
		if (index % 4 === 0) start.x = side > 0 ? 1.03 + seeded(index, 5) * .25 : -.03 - seeded(index, 5) * .25;
		if (index % 7 === 0) start.y = seeded(index, 6) > .5 ? 1.02 + seeded(index, 7) * .18 : -.02 - seeded(index, 7) * .18;
		const awayX = target.x - .5;
		const awayY = target.y - .49;
		return {
			char: SYLLABLES[Math.floor(seeded(index, 1) * SYLLABLES.length)],
			start,
			target,
			scatter: {
				x: target.x + awayX * (.9 + seeded(index, 8) * 1.6) + (seeded(index, 9) - .5) * .28,
				y: target.y + awayY * (.7 + seeded(index, 10) * 1.4) + (seeded(index, 11) - .5) * .24
			},
			size: 7 + seeded(index, 12) * 11,
			alpha: .18 + seeded(index, 13) * .58,
			depth: .35 + seeded(index, 14) * .9,
			phase: seeded(index, 15) * Math.PI * 2
		};
	});
}
function KAGlyphField({ progress, reducedMotion }) {
	const canvasRef = (0, import_react.useRef)(null);
	const progressRef = (0, import_react.useRef)(progress);
	const particlesRef = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		progressRef.current = progress;
	}, [progress]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) return;
		let width = 1;
		let height = 1;
		let frame = 0;
		const resize = () => {
			const rectangle = canvas.getBoundingClientRect();
			width = Math.max(1, rectangle.width);
			height = Math.max(1, rectangle.height);
			const pixelRatio = Math.min(1.5, window.devicePixelRatio || 1);
			canvas.width = Math.round(width * pixelRatio);
			canvas.height = Math.round(height * pixelRatio);
			context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
			particlesRef.current = buildParticles(width < 700 ? 170 : width < 1100 ? 240 : 320);
		};
		const draw = (now) => {
			const p = reducedMotion ? .3 : progressRef.current;
			context.clearRect(0, 0, width, height);
			context.textAlign = "center";
			context.textBaseline = "middle";
			const converge = easeOutQuart((p - .045) / .175);
			const scatter = easeOutQuart((p - .38) / .16);
			const holding = p >= .22 && p < .38;
			for (const particle of particlesRef.current) {
				let x = particle.start.x;
				let y = particle.start.y;
				let alpha = particle.alpha * .28;
				if (p >= .045 && p < .22) {
					x = mix(particle.start.x, particle.target.x, converge);
					y = mix(particle.start.y, particle.target.y, converge);
					alpha = particle.alpha * mix(.32, 1, converge);
				} else if (holding || reducedMotion) {
					const breathe = reducedMotion ? 0 : Math.sin(now * .0012 * particle.depth + particle.phase) * .0018 * particle.depth;
					x = particle.target.x + breathe;
					y = particle.target.y + breathe * .7;
					alpha = Math.min(.9, particle.alpha * 1.18);
				} else if (p >= .38) {
					x = mix(particle.target.x, particle.scatter.x, scatter);
					y = mix(particle.target.y, particle.scatter.y, scatter);
					x += Math.sin(now * 35e-5 * particle.depth + particle.phase) * .006 * scatter;
					y += Math.cos(now * 29e-5 * particle.depth + particle.phase) * .005 * scatter;
					alpha = particle.alpha * mix(1, indexDepthAlpha(particle.depth), scatter);
				}
				if (x < -.2 || x > 1.2 || y < -.2 || y > 1.2) continue;
				context.globalAlpha = Math.min(.94, alpha);
				context.font = `${particle.size * particle.depth}px "Noto Sans Myanmar", sans-serif`;
				context.fillStyle = holding ? "#fff8e9" : particle.depth > .85 ? "#f1e8d6" : "#c7bba9";
				context.fillText(particle.char, x * width, y * height);
			}
			context.globalAlpha = 1;
			if (!reducedMotion) frame = window.requestAnimationFrame(draw);
		};
		resize();
		window.addEventListener("resize", resize);
		if (reducedMotion) draw(performance.now());
		else frame = window.requestAnimationFrame(draw);
		return () => {
			window.removeEventListener("resize", resize);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, [reducedMotion]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "koa-ka-glyph-field",
		"aria-hidden": "true"
	});
}
function indexDepthAlpha(depth) {
	return depth > .92 ? .24 : depth > .7 ? .16 : .09;
}
//#endregion
//#region components/cinematic/PartnerMarquee.tsx
function PartnerMarquee({ motionReduced = false }) {
	if (publicPartners.length === 0) return null;
	const rows = [publicPartners.filter((_, index) => index % 2 === 0), publicPartners.filter((_, index) => index % 2 === 1)];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "partner-marquee",
		"data-motion": motionReduced ? "reduced" : "full",
		"aria-labelledby": "partner-marquee-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "partner-marquee__heading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Verified relationships" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "partner-marquee-title",
				children: "Working together, with permission."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "partner-marquee__rows",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerRow, {
				records: rows[0],
				direction: "forward"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerRow, {
				records: rows[1],
				direction: "reverse"
			})]
		})]
	});
}
function PartnerRow({ records, direction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "partner-marquee__row",
		"data-partner-row": direction,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "partner-marquee__track",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerSequence, { records }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerSequence, {
				records,
				duplicate: true
			})]
		})
	});
}
function PartnerSequence({ records, duplicate = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "partner-marquee__sequence",
		"aria-hidden": duplicate ? "true" : void 0,
		children: records.map((partner) => duplicate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "partner-marquee__partner",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: partner.logoPath,
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: partner.name })]
		}, partner.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			className: "partner-marquee__partner",
			href: partner.url,
			target: "_blank",
			rel: "noreferrer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: partner.logoPath,
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: partner.name })]
		}, partner.id))
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
//#region components/CinematicLanding.tsx
var clamp = (value) => Math.min(1, Math.max(0, value));
var missionCards = [
	{
		number: "01",
		title: "Civic voice",
		body: "Help Karen communities understand public systems, organize around priorities, and speak where decisions are made.",
		image: "/koa/assets/fb-capitol-group-mobile-enhanced.png",
		href: "services"
	},
	{
		number: "02",
		title: "Living language",
		body: "Preserve S’gaw Karen through community-reviewed words, recordings, translation, and intergenerational learning.",
		image: "/koa/assets/cultural-community.jpg",
		href: "dictionary"
	},
	{
		number: "03",
		title: "Community care",
		body: "Connect people to practical support, trusted community relationships, and ways to help one another.",
		image: "/koa/assets/humanitarian-assistance.jpg",
		href: "community"
	},
	{
		number: "04",
		title: "Youth leadership",
		body: "Make room for the next generation to learn, build, organize, and lead with confidence.",
		image: "/koa/assets/community-engagement.jpg",
		href: "collaborate"
	},
	{
		number: "05",
		title: "Culture in motion",
		body: "Keep identity visible through gathering, sport, music, food, storytelling, and shared public life.",
		image: "/koa/assets/fb-outdoor-gathering-mobile-enhanced.png",
		href: "community"
	}
];
function phaseFor(progress) {
	if (progress < .045) return "arrival";
	if (progress < .22) return "converge";
	if (progress < .38) return "hold";
	if (progress < .54) return "scatter";
	return "release";
}
function CinematicLanding({ lang, messages }) {
	const filmRef = (0, import_react.useRef)(null);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [motionReduced, setMotionReduced] = (0, import_react.useState)(false);
	const phase = phaseFor(progress);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const query = new URLSearchParams(window.location.search);
		const sync = () => setMotionReduced(media.matches || query.get("motion") === "off");
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		const film = filmRef.current;
		if (!film) return;
		if (motionReduced) {
			film.style.setProperty("--koa-progress", "0.30");
			setProgress(.3);
			return;
		}
		let frame = 0;
		const update = () => {
			frame = 0;
			const rect = film.getBoundingClientRect();
			const available = Math.max(1, film.offsetHeight - window.innerHeight);
			const next = clamp(-rect.top / available);
			film.style.setProperty("--koa-progress", next.toFixed(5));
			setProgress((current) => Math.abs(current - next) > .001 ? next : current);
		};
		const requestUpdate = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", requestUpdate, { passive: true });
		window.addEventListener("resize", requestUpdate);
		return () => {
			window.removeEventListener("scroll", requestUpdate);
			window.removeEventListener("resize", requestUpdate);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, [motionReduced]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			ref: filmRef,
			className: "koa-film",
			"data-phase": phase,
			"data-motion": motionReduced ? "reduced" : "full",
			"aria-labelledby": "koa-film-title",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "koa-film__sticky",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						id: "koa-film-title",
						className: "koa-sr-only",
						children: lang === "ksw" ? "ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ" : "Karen Organization of America"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "koa-film__atmosphere",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KAGlyphField, {
						progress,
						reducedMotion: motionReduced
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "koa-ka-outline",
						viewBox: "0 0 1200 700",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M170 100H250V290L380 100H465L330 340L475 600H385L250 395V600H170Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M735 600L855 100H945L1065 600H980L950 465H850L820 600ZM871 375H929L900 235Z",
							fillRule: "evenodd"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-film__seal",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "koa-film__seal-glow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SealAssembly, { rotation: progress * 360 })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-film__identity",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Karen Organization" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "of America" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-film__phase-label",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Language" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Identity" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Community" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "koa-film__scroll-cue",
						"aria-hidden": "true",
						children: ["Scroll to assemble ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↓" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "koa-film__motion-toggle",
						type: "button",
						"aria-pressed": motionReduced,
						onClick: () => setMotionReduced((value) => !value),
						children: motionReduced ? "Motion off" : "Motion on"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "koa-story",
			id: "main-content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "koa-chapter koa-chapter--split",
					"aria-labelledby": "koa-chapter-one",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "koa-chapter__media koa-chapter__media--portrait",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/koa/assets/fb-capitol-group-mobile-enhanced.png",
							alt: "Karen community advocates gathered during a visit to the United States Capitol"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-chapter__copy",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "koa-chapter__eyebrow",
								children: "Chapter 01 · Civic voice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "koa-chapter-one",
								children: "Knowledge becomes a voice in the room."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "KOA helps Karen leaders and young people understand public systems, speak to decision-makers, and bring what they learn back into community life." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								className: "koa-chapter__link",
								href: `/${lang}/services`,
								children: ["Explore community programs ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "→"
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "koa-chapter koa-chapter--full",
					"aria-labelledby": "koa-chapter-two",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							className: "koa-chapter__full-image",
							src: "/koa/assets/story-community-original.png",
							alt: "Karen community members gathering together"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "koa-chapter__full-shade",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "koa-chapter__full-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "koa-chapter__eyebrow",
									children: "Chapter 02 · Living language"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: "koa-chapter-two",
									children: "Every word is a way home."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Language survives because people use it, record it, correct it, teach it, and carry it into the next generation." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									className: "koa-chapter__link",
									href: `/${lang}/dictionary`,
									children: ["Enter the living dictionary ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "koa-chapter koa-chapter--split koa-chapter--reverse",
					"aria-labelledby": "koa-chapter-three",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "koa-chapter__copy",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "koa-chapter__eyebrow",
								children: "Chapter 03 · Belonging"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "koa-chapter-three",
								children: "Culture, care, and courage—connected."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "From community gatherings to practical support, KOA builds connective tissue between Karen people across cities, generations, and experiences." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								className: "koa-chapter__link",
								href: `/${lang}/community`,
								children: ["Find the community hub ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "→"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "koa-chapter__media koa-chapter__media--wide",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/koa/assets/fb-outdoor-gathering-mobile-enhanced.png",
							alt: "Karen community members gathered outdoors"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "koa-mission",
					"aria-labelledby": "koa-mission-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "koa-mission__header",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "koa-chapter__eyebrow",
								children: "Chapter 04 · Why KOA exists"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "koa-mission-title",
								children: "A national organization should feel as alive as the people it serves."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "koa-mission__carnival",
							children: missionCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "koa-mission-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "koa-mission-card__image",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: card.image,
										alt: ""
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "koa-mission-card__body",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: card.number }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: card.title }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: card.body }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											href: `/${lang}/${card.href}`,
											children: ["Explore ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												children: "↗"
											})]
										})
									]
								})]
							}, card.number))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "koa-mission__statement",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "koa-mission__statement-label",
									children: "Our mission"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "koa-mission__statement-text",
									children: "Strengthen unity, protect Karen rights and language, and build practical pathways for people to participate, contribute, and lead—wherever they call home in America."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "koa-mission__actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										href: `/${lang}/collaborate`,
										children: "Get involved"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										href: `/${lang}/contribute`,
										children: "Contribute language"
									})]
								})
							]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerMarquee, { motionReduced })
	] });
}
//#endregion
export { CinematicLanding, CinematicLanding as default };
