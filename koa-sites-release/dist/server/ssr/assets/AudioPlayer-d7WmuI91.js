import { T as __toESM, b as require_react, t as require_jsx_runtime, w as __exportAll } from "../index.js";
//#region components/AudioPlayer.tsx
var AudioPlayer_exports = /* @__PURE__ */ __exportAll({ AudioPlayer: () => AudioPlayer });
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function AudioPlayer({ word, label = "Hear pronunciation" }) {
	const [playing, setPlaying] = (0, import_react.useState)(false);
	function speak() {
		if (!("speechSynthesis" in window)) return;
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(word);
		utterance.lang = "ksw";
		utterance.onend = () => setPlaying(false);
		setPlaying(true);
		window.speechSynthesis.speak(utterance);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: "audio-button",
		type: "button",
		onClick: speak,
		"aria-pressed": playing,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true" }), playing ? "Playing…" : label]
	});
}
//#endregion
export { AudioPlayer_exports as n, AudioPlayer as t };
