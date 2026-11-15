import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
if (!input) { console.error("Usage: node scripts/import-translation-proposals.mjs <muse-output.jsonl> [output.json]"); process.exit(2); }
const output = process.argv[3] ?? path.join("output", "translation-proposals", "review-queue.json");
const source = JSON.parse(fs.readFileSync(path.join("content", "translation-queue.generated.json"), "utf8"));
const byId = new Map(source.sentences.map((sentence) => [sentence.id, sentence]));
const lines = fs.readFileSync(input, "utf8").split(/\r?\n/).filter((line) => line.trim());
const seen = new Set();
const proposals = [];

for (const [lineNumber, line] of lines.entries()) {
  let item;
  try { item = JSON.parse(line); } catch { throw new Error(`Line ${lineNumber + 1}: invalid JSON`); }
  const sourceSentence = byId.get(item.id);
  if (!sourceSentence) throw new Error(`Line ${lineNumber + 1}: unknown source id ${item.id}`);
  if (!["ksw", "th", "my"].includes(item.locale)) throw new Error(`Line ${lineNumber + 1}: locale must be ksw, th, or my`);
  if (typeof item.text !== "string" || !item.text.trim()) throw new Error(`Line ${lineNumber + 1}: missing translated text`);
  const identity = `${item.id}|${item.locale}`;
  if (seen.has(identity)) throw new Error(`Line ${lineNumber + 1}: duplicate ${identity}`);
  seen.add(identity);
  if (!Array.isArray(item.alignments) || item.alignments.length !== sourceSentence.tokens.length) throw new Error(`Line ${lineNumber + 1}: expected ${sourceSentence.tokens.length} word alignments`);
  const wordPairs = item.alignments.map((alignment, index) => {
    if (alignment.index !== index || (alignment.target !== null && typeof alignment.target !== "string")) throw new Error(`Line ${lineNumber + 1}: invalid alignment at token ${index}`);
    if (alignment.target === null && !alignment.note) throw new Error(`Line ${lineNumber + 1}: null alignment ${index} needs a grammatical note`);
    return { index, en: sourceSentence.tokens[index].en, target: alignment.target, note: alignment.note ?? null, status: "unapproved" };
  });
  const segmenter = new Intl.Segmenter(item.locale === "ksw" ? "my" : item.locale, { granularity: "word" });
  const targetTokens = [...segmenter.segment(item.text)].filter((part) => part.isWordLike).map((part) => part.segment);
  proposals.push({ id: item.id, locale: item.locale, en: sourceSentence.en, text: item.text.trim(), source: sourceSentence.source, area: sourceSentence.area, targetTokens, wordPairs, provenance: item.provenance ?? [], status: "machine_proposal", approval: null });
}

const coverage = Object.fromEntries(["ksw", "th", "my"].map((locale) => [locale, { proposed: proposals.filter((item) => item.locale === locale).length, required: source.sentences.length }]));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({ version: 1, policy: "Review required; never publish or train from this file directly.", coverage, proposals }, null, 2)}\n`);
console.log(JSON.stringify({ output, coverage }));
