import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/FormStatus.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function AsyncForm({ endpoint, messages, children, className = "form-card", successMessage }) {
	const [state, setState] = (0, import_react.useState)("idle");
	async function submit(event) {
		event.preventDefault();
		setState("sending");
		const form = event.currentTarget;
		const body = Object.fromEntries(new FormData(form).entries());
		try {
			if (!(await fetch(endpoint, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			})).ok) throw new Error("Request failed");
			setState("success");
			form.reset();
		} catch {
			setState("error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className,
		onSubmit: submit,
		children: [
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary",
				type: "submit",
				disabled: state === "sending",
				children: state === "sending" ? messages.sending : messages.submit
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `form-status form-status--${state}`,
				"aria-live": "polite",
				children: state === "success" ? successMessage ?? messages.success : state === "error" ? messages.error : ""
			})
		]
	});
}
//#endregion
export { AsyncForm };
