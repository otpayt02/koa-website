import assert from "node:assert/strict";
import test from "node:test";

async function render(cookie) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", ...(cookie ? { cookie } : {}) },
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

test("root route directs visitors to the bilingual KOA shell", async (t) => {
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

test("root route honors a returning reader's Karen preference", async (t) => {
  let response;
  try {
    response = await render("koa-language=karen");
  } catch (error) {
    if (error instanceof Error && error.message.includes("cloudflare:")) {
      t.skip("The local Node ESM loader cannot resolve the Cloudflare worker protocol; run this check in the Workers runtime.");
      return;
    }
    throw error;
  }
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost/karen");
});
