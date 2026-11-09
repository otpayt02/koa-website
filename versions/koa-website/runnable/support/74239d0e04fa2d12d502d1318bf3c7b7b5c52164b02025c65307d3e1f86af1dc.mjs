import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readRequired = (...segments) => {
  const path = resolve(repositoryRoot, ...segments);
  assert.ok(existsSync(path), `${segments.join("/")} must exist`);
  return readFileSync(path, "utf8");
};

test("the protected page loads the canonical manifest into a client Design Studio", () => {
  const page = readRequired("app", "[lang]", "admin", "design-studio", "page.tsx");
  assert.ok(page.indexOf("await requirePageAdmin(") < page.indexOf("return ("));
  assert.match(page, /loadFrameManifest/);
  assert.match(page, /<DesignStudio/);
});

test("the Design Studio is a chronological frame work surface with focused review tabs", () => {
  const studio = readRequired("components", "admin", "DesignStudio.tsx");
  assert.match(studio, /^\s*["']use client["'];/);
  assert.match(studio, /Chronological frame rail/i);
  for (const tab of ["Static", "Motion", "Content"]) assert.match(studio, new RegExp(`label: ["']${tab}["']`));
  assert.match(studio, /reviewTabs\.map/);
  assert.match(studio, /aria-orientation=["']vertical["']/);
  assert.match(studio, /role=["']tablist["']/);
  assert.match(studio, /reference weight/i);
  assert.match(studio, /safe range/i);
});

test("preview controls expose compact labeled viewports, Motion state, and safe actions", () => {
  const studio = readRequired("components", "admin", "DesignStudio.tsx");
  for (const label of ["390 × 844", "768 × 1024", "Full width", "Motion on", "Motion off", "Reload", "Open Full Page"]) {
    assert.match(studio, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(studio, /aria-label=["']Preview viewport["']/);
  assert.match(studio, /koa-preview=1/);
  assert.match(studio, /motion=\$\{motion\}/);
  assert.match(studio, /key=\{previewKey\}/);
  assert.doesNotMatch(studio, /src=.*admin\/design-studio/i);
});

test("the work surface includes a real-app iframe and invalid-manifest direction", () => {
  const studio = readRequired("components", "admin", "DesignStudio.tsx");
  const styles = readRequired("app", "globals.css");
  assert.match(studio, /<iframe/);
  assert.match(studio, /Manifest could not be displayed/i);
  assert.match(studio, /No valid cinematic frames/i);
  assert.match(styles, /\.design-studio__frame-rail/);
  assert.match(styles, /\.design-studio__preview-canvas/);
  assert.match(styles, /@media\s*\(max-width:/);
  assert.doesNotMatch(studio, /metric|analytics|KPI/i);
});
