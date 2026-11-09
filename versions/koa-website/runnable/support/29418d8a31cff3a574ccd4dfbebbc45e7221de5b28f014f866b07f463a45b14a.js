import { t as require_jsx_runtime } from "../index.js";
//#region components/StatusPill.tsx
var import_jsx_runtime = require_jsx_runtime();
function StatusPill({ children, tone = "gold" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `status status--${tone}`,
		children
	});
}
//#endregion
export { StatusPill as t };
