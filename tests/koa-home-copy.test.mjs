import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("content/koa-home-copy.json"));
const intro = read("components/cinematic/ScrollScrubIntro.tsx");

test("the English intro keeps the approved mission lockup exact", () => {
  assert.equal(catalog.en.intro.title, "America's home for the Karen community.");
  assert.equal(catalog.en.intro.body, "Providing, combining, and inviting a national Karen voice.");
});

test("the intro renders the mission and secondary statement as semantic copy", () => {
  assert.match(intro, /data-koa-mission/);
  assert.match(intro, /data-koa-secondary/);
  assert.match(intro, /koa-intro__copy-body koa-intro__copy-body--secondary/);
  assert.match(intro, /data-koa-action="primary"/);
  assert.match(intro, /data-koa-action="secondary"/);
});
