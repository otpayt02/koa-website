import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the release reference is recorded as the canonical KOA motion source", () => {
  const spec = read("docs/KOA-REFERENCE-CANONICAL-SPEC.md");
  assert.match(spec, /koa-sites-release\/dist\/koa\.html/);
  assert.match(spec, /4401840E3FB69B584E076657C4245B9B6DF11A8B662D10F689D7544D34627460/);
  assert.match(spec, /150 \/ 60 glyphs/);
  assert.match(spec, /0\.10–0\.32/);
  assert.match(spec, /0\.74–0\.98/);
});
