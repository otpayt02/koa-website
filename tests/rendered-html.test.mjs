import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
const workerPath = workerUrl.pathname.replace(/^\/(?:[A-Za-z]:)/, (drive) => drive.slice(1));
const sourcePaths = [
  new URL("../app/(default)/page.tsx", import.meta.url),
  new URL("../app/(default)/layout.tsx", import.meta.url),
  new URL("../app/[lang]/layout.tsx", import.meta.url),
  new URL("../components/i18n.ts", import.meta.url),
  new URL("../lib/locale-metadata.ts", import.meta.url),
];
const builtArtifactIsCurrent =
  existsSync(workerPath) &&
  sourcePaths.every((source) => statSync(workerPath).mtimeMs >= statSync(source).mtimeMs);

async function render() {
  const cacheBustedWorkerUrl = new URL(workerUrl);
  cacheBustedWorkerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(cacheBustedWorkerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("root route redirects visitors to the canonical English React route", { skip: !builtArtifactIsCurrent && "run npm run build before rendered checks" }, async (t) => {
  let response;
  try {
    response = await render();
  } catch (error) {
    if (error instanceof Error && error.message.includes("cloudflare:")) {
      t.skip("The local Node ESM loader cannot resolve the Cloudflare worker protocol; run this check in the Workers runtime.");
      return;
    }
    throw error;
  }
  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "http://localhost/en",
  );
});
