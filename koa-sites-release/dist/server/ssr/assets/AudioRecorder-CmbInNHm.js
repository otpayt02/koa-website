import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/AudioRecorder.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function AudioRecorder({ lang, messages }) {
	const recorder = (0, import_react.useRef)(null);
	const chunks = (0, import_react.useRef)([]);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [url, setUrl] = (0, import_react.useState)();
	async function start() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			chunks.current = [];
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (event) => chunks.current.push(event.data);
			mediaRecorder.onstop = () => {
				const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType });
				setUrl(URL.createObjectURL(blob));
				setStatus("ready");
				stream.getTracks().forEach((track) => track.stop());
			};
			mediaRecorder.start();
			recorder.current = mediaRecorder;
			setStatus("recording");
		} catch {
			setStatus("error");
		}
	}
	async function upload() {
		if (!url) return;
		setStatus("uploading");
		try {
			const blob = await fetch(url).then((response) => response.blob());
			const body = new FormData();
			body.append("audio", blob, "karen-recording.webm");
			body.append("language", "karen");
			body.append("dialect", "sgaw");
			if (!(await fetch("/api/audio/upload", {
				method: "POST",
				body
			})).ok) throw new Error("Upload failed");
			setStatus("done");
		} catch {
			setStatus("error");
		}
	}
	const text = {
		record: lang === "ksw" ? "စးထီၣ်ဖီၣ်ကလုၢ်" : "Start recording",
		stop: lang === "ksw" ? "ပတုာ်" : "Stop recording",
		upload: lang === "ksw" ? "ဆှၢလီၤကလုၢ်" : "Upload recording",
		ready: lang === "ksw" ? "ကွၢ်ကဒါနကလုၢ်" : "Review your recording"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "recorder",
		"aria-label": "Karen audio recorder",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "recorder__visual",
				"data-recording": status === "recording",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: status === "recording" ? text.stop : status === "ready" ? text.ready : text.record }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: lang === "ksw" ? "တဲဖျါထီၣ်ကညီကျိာ်တဖျၢၣ် မ့တမ့ၢ် တကျိာ်။" : "Record a Karen word or sentence in a quiet place." })] }),
			url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				controls: true,
				src: url,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("track", { kind: "captions" })
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "button-row",
				children: [status === "recording" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--secondary",
					type: "button",
					onClick: () => recorder.current?.stop(),
					children: text.stop
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--secondary",
					type: "button",
					onClick: start,
					disabled: status === "uploading",
					children: text.record
				}), status === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--primary",
					type: "button",
					onClick: upload,
					children: text.upload
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "form-status",
				"aria-live": "polite",
				children: status === "uploading" ? messages.sending : status === "done" ? messages.success : status === "error" ? messages.error : ""
			})
		]
	});
}
//#endregion
export { AudioRecorder };
