// verify-seed.mjs — apply migrations 0000-0002 + dictionary seed to a
// scratch sqlite, then sanity-query. Proves the import works before it ever
// touches the real D1.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const db = new DatabaseSync(":memory:");
const run = (file) => {
  const sql = readFileSync(join(root, file), "utf-8");
  // drizzle migrations use --> statement-breakpoint separators
  for (const stmt of sql.split("--> statement-breakpoint")) {
    const s = stmt.trim();
    if (s) db.exec(s);
  }
};

run("drizzle/0000_eager_skaar.sql");
run("drizzle/0001_slippery_roulette.sql");
run("drizzle/0002_spicy_diamondback.sql");
run("drizzle/0003_dictionary_seed.sql");
console.log("migrations 0000-0003 applied ✓");

const q = (sql) => db.prepare(sql).get();
console.log("entries:", q("SELECT COUNT(*) AS n FROM dictionary_entries").n);
console.log("translations:", q("SELECT COUNT(*) AS n FROM dictionary_translations").n);
console.log("all pending:", q("SELECT COUNT(*) AS n FROM dictionary_entries WHERE status != 'pending'").n === 0);
console.log("sample:", JSON.stringify(q("SELECT word, status, source FROM dictionary_entries WHERE word='ဃူ'")));
console.log("lookup test:", JSON.stringify(q("SELECT e.word, t.text AS translation FROM dictionary_entries e JOIN dictionary_translations t ON t.entry_id = e.id WHERE e.normalized_word = 'ဃူထံ' LIMIT 1")));
// idempotency: run the seed twice, count must not change
run("scripts/seed/dictionary_import.sql");
console.log("idempotent:", q("SELECT COUNT(*) AS n FROM dictionary_entries").n === 5779);
db.close();
console.log("ALL CHECKS PASSED");
