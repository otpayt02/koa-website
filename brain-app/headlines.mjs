#!/usr/bin/env node
/**
 * KOA brain — daily 10:00 AM Eastern headline run.
 * Reads brain-app/brain.json, scrapes every feed in it (MCARI first),
 * filters by keywords, ranks, dedupes, writes public/feeds.json.
 * Zero dependencies — Node 18+. Optional SIGNAL_WEBHOOK ping on completion.
 *
 * Usage (from repo root): node brain-app/headlines.mjs
 */
import { readFile, writeFile } from "node:fs/promises";

const BRAIN_URL = new URL("./brain.json", import.meta.url);
const OUTPUT_URL = new URL("../public/feeds.json", import.meta.url);
const UA = "KOA-Headline-Bot/1.0 (+https://koamerica.org; contact: web@koamerica.org)";

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function stripTags(s) {
  return s.replace(/<[^>]*>/g, " ").replace(/&/g, "&").replace(/&#8217;|&rsquo;/g, "'")
          .replace(/&#8216;|&lsquo;/g, "'").replace(/&#8212;|&mdash;/g, "—")
          .replace(/"|&#8220;|&#8221;/g, '"').replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ").trim();
}

function unCDATA(s) {
  return s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

/** Minimal RSS/Atom item parser — good enough for headlines. */
function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) || [];
  for (const b of blocks) {
    const title = unCDATA(b.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const link = unCDATA(b.match(/<link[^>]*href="([^"]+)"/i)?.[1] ||
                     b.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "");
    const date = b.match(/<(pubDate|published|updated)[^>]*>([\s\S]*?)<\//i)?.[2] || "";
    if (title) items.push({ title: stripTags(title), link: link.trim(), date: Date.parse(date) || 0 });
  }
  return items;
}

/** Page-watch (for sources without RSS, e.g. MCARI): scrape h2/h3 headings. */
function parsePage(html) {
  const items = [];
  const heads = html.match(/<h[23][^>]*>[\s\S]*?<\/h[23]>/gi) || [];
  for (const h of heads) {
    const t = stripTags(h);
    if (t.length > 20 && t.length < 200) items.push({ title: t, link: "", date: 0 });
  }
  return items;
}

(async () => {
  const brain = JSON.parse(await readFile(BRAIN_URL, "utf8"));
  const cfg = brain.headlineRun || {};
  const keywords = (cfg.keywords || []).map(k => k.toLowerCase());
  const maxItems = cfg.maxItems || 12;

  const all = [];
  for (const feed of brain.feeds || []) {
    try {
      const raw = await get(feed.url);
      const items = feed.type === "rss" ? parseFeed(raw) : parsePage(raw);
      const scored = items.filter(it =>
        feed.weight >= 3 || keywords.some(k => it.title.toLowerCase().includes(k))
      );
      for (const it of scored) all.push({ source: feed.name, ...it, weight: feed.weight || 1 });
      console.log(`[ok] ${feed.name}: ${scored.length}/${items.length} items`);
    } catch (e) {
      console.warn(`[skip] ${feed.name}: ${e.message}`);
    }
  }

  // rank: weight first, then recency; dedupe by normalized title prefix
  all.sort((a, b) => (b.weight - a.weight) || (b.date - a.date));
  const seen = new Set();
  const items = [];
  for (const it of all) {
    const key = it.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ source: it.source, title: it.title, link: it.link });
    if (items.length >= maxItems) break;
  }

  const out = {
    generated_at: new Date().toISOString(),
    sources: (brain.feeds || []).map(f => f.name),
    items
  };
  await writeFile(OUTPUT_URL, JSON.stringify(out, null, 2) + "\n");
  console.log(`[done] wrote ${items.length} headlines -> public/feeds.json`);

  // optional Signal ping (set SIGNAL_WEBHOOK to a full URL ending in "text=")
  if (process.env.SIGNAL_WEBHOOK) {
    const summary = `KOA 10AM headline run: ${items.length} headlines from ${out.sources.join(", ")}`;
    try {
      await fetch(process.env.SIGNAL_WEBHOOK + encodeURIComponent(summary));
      console.log("[signal] ping sent");
    } catch (e) {
      console.warn("[signal] failed:", e.message);
    }
  }
})();
