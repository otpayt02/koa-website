import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ADMIN_STUDIO_ROLES,
  canAccessAdminStudio,
} from "../lib/authorization.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (...segments) => readFileSync(resolve(repositoryRoot, ...segments), "utf8");

test("only administrators can access an authoring studio", () => {
  assert.deepEqual(ADMIN_STUDIO_ROLES, ["admin"]);
  assert.equal(canAccessAdminStudio("admin"), true);

  for (const role of [
    "public",
    "contributor",
    "reviewer",
    "approved_translator",
    "moderator",
  ]) {
    assert.equal(canAccessAdminStudio(role), false, `${role} must not access an admin studio`);
  }

  assert.equal(canAccessAdminStudio(undefined), false);
  assert.equal(canAccessAdminStudio("unknown"), false);
});

test("API and page authorization share the admin role policy", () => {
  const auth = read("lib", "auth.ts");
  const pageAuth = read("lib", "page-auth.ts");

  assert.match(auth, /import\s*\{[^}]*canAccessAdminStudio[^}]*\}\s*from\s*["']@\/lib\/authorization\.mjs["']/s);
  assert.match(auth, /canAccessAdminStudio\(user\.role\)/);
  assert.match(pageAuth, /requireAnyRole\(request,\s*ADMIN_STUDIO_ROLES\)/);
});

test("page authorization preserves sign-in, concealment, and runtime failure semantics", () => {
  const source = read("lib", "page-auth.ts");

  assert.match(source, /const requestHeaders = await headers\(\)/);
  assert.match(source, /new Request\(/);
  assert.match(source, /error instanceof ApiError\s*&&\s*error\.status === 401/);
  assert.match(source, /redirect\(chatGPTSignInPath\(returnTo\)\)/);
  assert.match(source, /error instanceof ApiError\s*&&\s*error\.status === 403/);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /throw error/);
});

for (const page of [
  ["dashboard", "app", "[lang]", "admin", "page.tsx"],
  ["language studio", "app", "[lang]", "admin", "language-studio", "page.tsx"],
  ["design studio", "app", "[lang]", "admin", "design-studio", "page.tsx"],
]) {
  const [name, ...segments] = page;

  test(`${name} is guarded before protected rendering and excluded from robots`, () => {
    const path = resolve(repositoryRoot, ...segments);
    assert.ok(existsSync(path), `${segments.join("/")} must exist`);
    const source = read(...segments);
    const guardIndex = source.indexOf("await requirePageAdmin(");
    const renderIndex = source.indexOf("return (");

    assert.ok(guardIndex >= 0, `${name} must call requirePageAdmin`);
    assert.ok(renderIndex >= 0, `${name} must render protected UI`);
    assert.ok(guardIndex < renderIndex, `${name} must authorize before rendering`);
    assert.match(source, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  });
}

test("the guarded dashboard links to both authoring studios", () => {
  const source = read("app", "[lang]", "admin", "page.tsx");

  assert.match(source, /\$\{lang\}\/admin\/language-studio/);
  assert.match(source, /\$\{lang\}\/admin\/design-studio/);
});
