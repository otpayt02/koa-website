import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/VerifierApplicationForm.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function VerifierApplicationForm({ messages }) {
	const [state, setState] = (0, import_react.useState)("idle");
	const [message, setMessage] = (0, import_react.useState)("");
	async function submit(event) {
		event.preventDefault();
		setState("sending");
		const form = event.currentTarget;
		const data = Object.fromEntries(new FormData(form).entries());
		try {
			const response = await fetch("/api/verifier-applications", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(data)
			});
			if (response.status === 401) {
				setState("auth");
				return;
			}
			if (response.status === 409) {
				setMessage((await response.json().catch(() => null))?.error ?? "You already applied.");
				setState("conflict");
				return;
			}
			if (!response.ok) throw new Error("Request failed");
			setState("success");
			form.reset();
		} catch {
			setState("error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "form-card",
		onSubmit: submit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-intro",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Become a community verifier"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Your voice carries a place." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Karen is spoken differently across camps, cities, and states. Tell us where your Karen comes from — it becomes part of every word you approve." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-name",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "verapp-name",
							name: "displayName",
							required: true,
							maxLength: 120
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-email",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "verapp-email",
							name: "email",
							type: "email",
							required: true,
							maxLength: 254
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-country",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Where did you grow up? (country)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "verapp-country",
							name: "grewUpCountry",
							required: true,
							maxLength: 120,
							placeholder: "e.g. Burma / Thailand / United States"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-region",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Region, camp, or town" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "verapp-region",
							name: "grewUpRegion",
							required: true,
							maxLength: 200,
							placeholder: "e.g. Mae La camp, Hpa-An, St. Paul"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-placetype",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Where did you learn Karen?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "verapp-placetype",
							name: "learnedKarenPlaceType",
							required: true,
							defaultValue: "camp",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "camp",
									children: "Refugee / border camp"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "city",
									children: "City"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "state",
									children: "State (e.g. Karen State)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "province",
									children: "Province / region in another country"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "other",
									children: "Other / family home"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-place",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Name that place" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "verapp-place",
							name: "learnedKarenPlace",
							required: true,
							maxLength: 200,
							placeholder: "e.g. Mae La camp, section 4"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "verapp-dialect",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your Karen, in your own words (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "verapp-dialect",
							name: "dialectSelfNamed",
							maxLength: 200,
							placeholder: "e.g. S'gaw as spoken in Mergui-Tavoy"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				htmlFor: "verapp-motivation",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Why do you want to verify? (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "verapp-motivation",
					name: "motivation",
					rows: 4,
					maxLength: 2e3,
					placeholder: "What you can contribute — dictionary entries, grammar rules, audio review…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary",
				type: "submit",
				disabled: state === "sending",
				children: state === "sending" ? messages.sending : "Apply to become a verifier"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `form-status form-status--${state === "auth" || state === "conflict" ? "error" : state}`,
				"aria-live": "polite",
				children: state === "success" ? "Application received — moderators will review it. You'll see your status when you sign in." : state === "auth" ? "Sign in with ChatGPT to apply." : state === "conflict" ? message : state === "error" ? messages.error : ""
			})
		]
	});
}
//#endregion
export { VerifierApplicationForm };
