import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("the canonical checkout has the locked vinext runtime", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.devDependencies.vinext, "0.0.50");
  assert.ok(existsSync(new URL("../node_modules/.bin/vinext.cmd", import.meta.url)));
});
