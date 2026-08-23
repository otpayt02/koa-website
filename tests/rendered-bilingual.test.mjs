import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workerPath = resolve(repositoryRoot, "dist/server/index.js");

function newestSourceModification(directory) {
  if (!existsSync(directory)) return 0;
  return readdirSync(directory, { withFileTypes: true }).reduce((newest, entry) => {
    const path = resolve(directory, entry.name);
    return Math.max(
      newest,
      entry.isDirectory() ? newestSourceModification(path) : statSync(path).mtimeMs,
    );
  }, 0);
}

const sourceModification = Math.max(
  newestSourceModification(resolve(repositoryRoot, "app")),
  newestSourceModification(resolve(repositoryRoot, "components")),
  newestSourceModification(resolve(repositoryRoot, "messages")),
);
const builtArtifactIsCurrent =
  existsSync(workerPath) && statSync(workerPath).mtimeMs >= sourceModification;

async function loadWorker() {
  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

function environment() {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
}

function context() {
  return {
    waitUntil() {},
    passThroughOnException() {},
  };
}

test(
  "built English and Karen home pages render semantic, localized HTML without a dev server",
  { skip: !builtArtifactIsCurrent && "run npm run build before rendered checks" },
  async (t) => {
    let worker;
    try {
      worker = await loadWorker();
    } catch (error) {
      if (error instanceof Error && error.message.includes("cloudflare:")) {
        t.skip("The local Node ESM loader cannot resolve the Cloudflare worker protocol; run this check in the Workers runtime.");
        return;
      }
      throw error;
    }
    const responses = await Promise.all(
      ["en", "karen"].map((language) =>
        worker.fetch(
          new Request(`http://localhost/${language}`, {
            headers: { accept: "text/html" },
          }),
          environment(),
          context(),
        ),
      ),
    );

    for (const response of responses) {
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    }

    const [englishHtml, karenHtml] = await Promise.all(responses.map((response) => response.text()));
    for (const html of [englishHtml, karenHtml]) {
      assert.match(html, /<main\b[^>]*\bid="main-content"/i);
      assert.match(html, /<h1\b/i);
      assert.match(html, /<title>[^<]+<\/title>/i);
      assert.match(html, /<meta\b[^>]*name="description"/i);
    }

    assert.notEqual(karenHtml, englishHtml, "Localized pages rendered identical HTML");
    assert.match(karenHtml, /[\u1000-\u109f]/u, "Karen page lacks Karen/Myanmar Unicode text");
  },
);
