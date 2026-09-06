import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/DonationForm.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function DonationForm({ lang }) {
	const [amount, setAmount] = (0, import_react.useState)(50);
	const [recurring, setRecurring] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "donation-card",
		action: "/api/donations",
		method: "post",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: lang === "ksw" ? "မၤစၢၤတၢ်မၤ" : "Sustain the work"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: lang === "ksw" ? "နတၢ်ဟ့ၣ်မၤစၢၤပှၤတဝၢ။" : "Your gift stays with community." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "amount-grid",
				"aria-label": "Donation amount",
				children: [
					25,
					50,
					100,
					250
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": amount === value,
					onClick: () => setAmount(value),
					children: ["$", value]
				}, value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Amount (USD)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "amount",
					type: "number",
					min: "5",
					step: "1",
					value: amount,
					onChange: (event) => setAmount(Number(event.target.value)),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "toggle-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "recurring",
					type: "checkbox",
					checked: recurring,
					onChange: (event) => setRecurring(event.target.checked)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: recurring ? "Monthly gift" : "One-time gift" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Email for receipt" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "email",
					type: "email",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary",
				type: "submit",
				children: lang === "ksw" ? "ဟ့ၣ်မၤစၢၤ" : `Donate $${amount}${recurring ? "/month" : ""}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Secure processing is completed by KOA's payment provider. Tax receipt eligibility is confirmed with your receipt." })
		]
	});
}
//#endregion
export { DonationForm };
