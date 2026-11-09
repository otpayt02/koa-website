import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const referenceRoot = path.resolve(projectRoot, "..", "koa-website", "dist", "client", "koa");
const outputRoot = path.join(projectRoot, "dist");
const koaRoot = path.join(outputRoot, "koa");
const englishRoot = path.join(outputRoot, "en");

await access(path.join(referenceRoot, "index.html"), constants.R_OK);
await mkdir(koaRoot, { recursive: true });
await mkdir(englishRoot, { recursive: true });
await cp(referenceRoot, koaRoot, { recursive: true, force: true });

const source = await readFile(path.join(referenceRoot, "index.html"), "utf8");
const english = source.includes('<base href="/koa/">')
  ? source
  : source.replace("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">", "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<base href=\"/koa/\">");
await writeFile(path.join(englishRoot, "index.html"), english);
