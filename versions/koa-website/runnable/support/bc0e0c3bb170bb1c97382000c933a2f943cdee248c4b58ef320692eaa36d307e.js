import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/AsciiDitherCanvas.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* ASCII Dithering Canvas - "The Static Veil"
* 
* A full-screen dithering texture with:
* - Karen glyph dithering patterns
* - Cursor-reactive revelation (glyphs bloom at cursor)
* - Subtle animation (breathing, flowing)
* - Bilingual character sets
* - Configurable density and contrast
*/
var KAREN_DITHER_CHARS = [
	" ",
	" ",
	" ",
	"·",
	"·",
	"•",
	"◦",
	"◘",
	"◙",
	"ှ",
	"ံ",
	"့",
	"း",
	"ၠ",
	"ၡ",
	"ၢ",
	"ၣ",
	"ၤ",
	"ၥ",
	"ၦ",
	"ၧ",
	"ၨ",
	"ၩ",
	"က",
	"ခ",
	"ဂ",
	"ဃ",
	"င",
	"စ",
	"ဆ",
	"ဇ",
	"ဈ",
	"ဉ",
	"ည",
	"တ",
	"ထ",
	"ဒ",
	"ဓ",
	"န",
	"ပ",
	"ဖ",
	"ဗ",
	"ဘ",
	"မ",
	"ယ",
	"ရ",
	"လ",
	"ဝ",
	"သ",
	"ဟ",
	"ဠ",
	"အ",
	"၀",
	"၁",
	"၂",
	"၃",
	"၄",
	"၅",
	"၆",
	"၇",
	"၈",
	"၉",
	"░",
	"▒",
	"▓",
	"▄",
	"▀",
	"▌",
	"▐",
	"█"
];
var SGAW_AURORA_CHARS = [
	"က",
	"ည",
	"ီ",
	"ၢ",
	"ၤ",
	"ၥ",
	"့",
	"း",
	"၀",
	"၁",
	"၂",
	"၃",
	"၄",
	"၅",
	"၆",
	"၇",
	"၈",
	"၉"
];
function AsciiDitherCanvas({ canvasRef, isReducedMotion = false, cursorReveal = true, revealRadius = 180, density = .5, lang = "en", onRevealArea = () => {} }) {
	const gridRef = (0, import_react.useRef)([]);
	const animationRef = (0, import_react.useRef)(null);
	const lastTimeRef = (0, import_react.useRef)(0);
	const canvasSizeRef = (0, import_react.useRef)({
		width: 0,
		height: 0
	});
	const cellSizeRef = (0, import_react.useRef)(8);
	const cursorRef = (0, import_react.useRef)({
		x: 0,
		y: 0,
		active: false,
		radius: revealRadius
	});
	const colsRef = (0, import_react.useRef)(0);
	const rowsRef = (0, import_react.useRef)(0);
	const initializedRef = (0, import_react.useRef)(false);
	const initializeGrid = (0, import_react.useCallback)((width, height) => {
		const cellSize = cellSizeRef.current;
		const cols = Math.ceil(width / cellSize) + 2;
		const rows = Math.ceil(height / cellSize) + 2;
		colsRef.current = cols;
		rowsRef.current = rows;
		const grid = [];
		for (let row = 0; row < rows; row++) {
			const rowCells = [];
			for (let col = 0; col < cols; col++) {
				const nx = col * .15;
				const ny = row * .15;
				const noise = Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453;
				const baseNoise = noise - Math.floor(noise);
				const gradientX = col / cols;
				const gradientY = row / rows;
				const vignette = 1 - Math.hypot(gradientX - .5, gradientY - .5) * .8;
				const baseBrightness = Math.floor((baseNoise * .6 + vignette * .4) * 255);
				const charIndex = Math.floor(baseBrightness / 255 * KAREN_DITHER_CHARS.length * density);
				const clampedIndex = Math.max(0, Math.min(charIndex, KAREN_DITHER_CHARS.length - 1));
				rowCells.push({
					char: KAREN_DITHER_CHARS[clampedIndex],
					baseBrightness,
					currentBrightness: baseBrightness,
					targetBrightness: baseBrightness,
					animationOffset: Math.random() * Math.PI * 2,
					isRevealed: false,
					revealIntensity: 0
				});
			}
			grid.push(rowCells);
		}
		gridRef.current = grid;
		initializedRef.current = true;
	}, []);
	(0, import_react.useEffect)(() => {
		if (!cursorReveal) return;
		const handleMouseMove = (e) => {
			cursorRef.current.x = e.clientX;
			cursorRef.current.y = e.clientY;
			cursorRef.current.active = true;
			cursorRef.current.radius = revealRadius;
		};
		const handleMouseLeave = () => {
			cursorRef.current.active = false;
		};
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseleave", handleMouseLeave);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [cursorReveal, revealRadius]);
	(0, import_react.useEffect)(() => {
		if (isReducedMotion) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			canvasSizeRef.current.width = window.innerWidth;
			canvasSizeRef.current.height = window.innerHeight;
			canvas.width = canvasSizeRef.current.width * dpr;
			canvas.height = canvasSizeRef.current.height * dpr;
			canvas.style.width = `${canvasSizeRef.current.width}px`;
			canvas.style.height = `${canvasSizeRef.current.height}px`;
			ctx.scale(dpr, dpr);
			if (!initializedRef.current) initializeGrid(canvasSizeRef.current.width, canvasSizeRef.current.height);
		};
		resize();
		window.addEventListener("resize", resize);
		const animate = (time) => {
			Math.min(time - lastTimeRef.current, 33);
			lastTimeRef.current = time;
			const width = canvasSizeRef.current.width;
			const height = canvasSizeRef.current.height;
			const cellSize = cellSizeRef.current;
			const cols = colsRef.current;
			const rows = rowsRef.current;
			const grid = gridRef.current;
			const cursor = cursorRef.current;
			ctx.clearRect(0, 0, width, height);
			ctx.font = `${cellSize}px 'Noto Sans Myanmar', monospace`;
			ctx.textBaseline = "top";
			ctx.textAlign = "left";
			for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
				const cell = grid[row][col];
				const x = col * cellSize;
				const y = row * cellSize;
				if (x > width + cellSize || y > height + cellSize) continue;
				let targetBrightness = cell.baseBrightness;
				let revealIntensity = 0;
				if (cursor.active) {
					const dx = cursor.x - (x + cellSize / 2);
					const dy = cursor.y - (y + cellSize / 2);
					const dist = Math.hypot(dx, dy);
					if (dist < cursor.radius) {
						const influence = Math.pow(1 - dist / cursor.radius, 2);
						revealIntensity = influence;
						targetBrightness = Math.min(255, cell.baseBrightness + influence * 200);
						if (influence > .6) cell.char = SGAW_AURORA_CHARS[(row * 7 + col * 11) % SGAW_AURORA_CHARS.length];
						else if (influence > .3) {
							const midIndex = Math.floor(influence * 20) + 10;
							cell.char = KAREN_DITHER_CHARS[Math.min(midIndex, KAREN_DITHER_CHARS.length - 1)];
						}
						cell.isRevealed = true;
					} else if (cell.isRevealed) cell.isRevealed = false;
				}
				cell.currentBrightness += (targetBrightness - cell.currentBrightness) * .08;
				cell.revealIntensity += (revealIntensity - cell.revealIntensity) * .1;
				const breath = Math.sin(time * 5e-4 + cell.animationOffset) * 15;
				const finalBrightness = Math.max(0, Math.min(255, cell.currentBrightness + breath));
				const charIndex = Math.floor(finalBrightness / 255 * KAREN_DITHER_CHARS.length * density);
				const clampedIndex = Math.max(0, Math.min(charIndex, KAREN_DITHER_CHARS.length - 1));
				if (Math.random() < .002) cell.char = KAREN_DITHER_CHARS[Math.max(0, clampedIndex + (Math.random() - .5) * 4 | 0)];
				else cell.char = KAREN_DITHER_CHARS[clampedIndex];
				let color;
				let alpha;
				const hue = 190 + (Math.sin(x * .009 + time * 16e-5) + Math.cos(y * .013 - time * 11e-5) + 2) * 23;
				if (cell.revealIntensity > .1) {
					const intensity = cell.revealIntensity;
					alpha = .02 + intensity * .15;
					color = intensity > .5 ? "#f4d883" : `hsl(${hue} 78% 82%)`;
				} else {
					alpha = .01 + finalBrightness / 255 * .025;
					color = `hsl(${hue} 58% ${42 + Math.round(finalBrightness / 14)}%)`;
				}
				ctx.globalAlpha = alpha;
				ctx.fillStyle = color;
				ctx.fillText(cell.char, x, y);
			}
			ctx.globalAlpha = 1;
			if (cursor.active) onRevealArea(cursor.x, cursor.y, cursor.radius);
			animationRef.current = requestAnimationFrame(animate);
		};
		animationRef.current = requestAnimationFrame(animate);
		return () => {
			window.removeEventListener("resize", resize);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [
		canvasRef,
		isReducedMotion,
		cursorReveal,
		initializeGrid,
		lang
	]);
	return null;
}
//#endregion
//#region components/CommunityAtmosphere.tsx
var import_jsx_runtime = require_jsx_runtime();
function CommunityAtmosphere({ lang }) {
	const canvasRef = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "community-current__atmosphere",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "community-current__dither"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AsciiDitherCanvas, {
			canvasRef,
			isReducedMotion: false,
			cursorReveal: true,
			revealRadius: 220,
			density: .34,
			lang
		})]
	});
}
//#endregion
export { CommunityAtmosphere };
