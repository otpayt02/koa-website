export type KoaBindings = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  MEDIA_PUBLIC_BASE_URL?: string;
  KOA_ADMIN_USER_IDS?: string;
  KOA_ADMIN_EMAILS?: string;
  KOA_BLOCKED_TERMS?: string;
  DONATION_CHECKOUT_URL?: string;
};

type KoaRuntimeGlobal = typeof globalThis & { __koaBindings?: KoaBindings };

export function getBindings(): KoaBindings {
  // The worker installs its request-scoped bindings before dispatching to the
  // Next handler. Keeping this lookup on globalThis avoids importing the
  // Cloudflare-only `cloudflare:workers` module into Node's test/build loader.
  return (globalThis as KoaRuntimeGlobal).__koaBindings ?? {};
}

export function setBindings(bindings: KoaBindings): void {
  (globalThis as KoaRuntimeGlobal).__koaBindings = bindings;
}
