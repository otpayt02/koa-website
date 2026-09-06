import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/ui/CursorGlareImage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function CursorGlareImage({ src, alt, className = "", loading = "lazy", fetchPriority = "auto" }) {
	const frameRef = (0, import_react.useRef)(null);
	const glareRef = (0, import_react.useRef)(null);
	const entrySideRef = (0, import_react.useRef)(100);
	const progressRef = (0, import_react.useRef)(0);
	const moveGlare = (position, duration = 90) => {
		if (!glareRef.current) return;
		glareRef.current.style.transitionDuration = `${duration}ms`;
		glareRef.current.style.transform = `translate3d(${position - 50}%, 0, 0)`;
	};
	const onPointerEnter = (event) => {
		if (event.pointerType === "touch") return;
		const bounds = event.currentTarget.getBoundingClientRect();
		entrySideRef.current = (event.clientX - bounds.left) / bounds.width < .5 ? 100 : 0;
		progressRef.current = 0;
		moveGlare(entrySideRef.current, 0);
		requestAnimationFrame(() => frameRef.current?.setAttribute("data-glare-active", "true"));
	};
	const onPointerMove = (event) => {
		if (event.pointerType === "touch") return;
		const bounds = event.currentTarget.getBoundingClientRect();
		const inversePosition = (1 - Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))) * 100;
		progressRef.current = Math.abs(inversePosition - entrySideRef.current) / 100;
		moveGlare(inversePosition);
	};
	const onPointerLeave = () => {
		const destination = progressRef.current < .5 ? entrySideRef.current : entrySideRef.current === 100 ? 0 : 100;
		const current = Number(glareRef.current?.style.transform.match(/-?\d+(?:\.\d+)?/)?.[0] ?? 0) + 50;
		moveGlare(destination, Math.max(260, Math.abs(destination - current) * 9));
		window.setTimeout(() => frameRef.current?.removeAttribute("data-glare-active"), 920);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: frameRef,
		className: `cursor-glare ${className}`.trim(),
		onPointerEnter,
		onPointerMove,
		onPointerLeave,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt,
			loading,
			decoding: "async",
			fetchPriority
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			ref: glareRef,
			className: "cursor-glare__film",
			"aria-hidden": "true"
		})]
	});
}
//#endregion
export { CursorGlareImage };
