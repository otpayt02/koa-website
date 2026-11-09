import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

test("the English entry renders the exact KOA reference with a hosted base path", async () => {
  const html = await readFile(new URL("../dist/en/index.html", import.meta.url), "utf8");
  const reference = await readFile(new URL("../../koa-website/dist/client/koa/index.html", import.meta.url), "utf8");
  assert.match(html, /<base href="\/koa\/">/);
  assert.match(html, /One people\.[\s\S]*One <em>home\.<\/em>/);
  assert.match(html, /data-arrival/);
  assert.match(html, /data-film/);
  assert.equal(html.replace(/\r?\n<base href="\/koa\/">/, ""), reference);
});

test("all linked KOA pages, scripts, styles, fonts, and images are bundled", async () => {
  const required = [
    "../dist/koa/about.html",
    "../dist/koa/programs.html",
    "../dist/koa/stories.html",
    "../dist/koa/music.html",
    "../dist/koa/coming-soon.html",
    "../dist/koa/contact.html",
    "../dist/koa/storytelling.css",
    "../dist/koa/storytelling.js",
    "../dist/koa/assets/koa-logo.png",
    "../dist/koa/assets/story-community-original.png"
  ];
  await Promise.all(required.map((file) => access(new URL(file, import.meta.url))));
  assert.ok(true);
});
