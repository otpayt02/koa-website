"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Messages } from "./i18n";

type ExampleDraft = { karen: string; english: string };

// Community grammar-rule submission. Rules land as `pending`; reviewers see
// them in the moderation queue. Examples travel with the rule but are judged
// individually.
export function GrammarRuleForm({ messages }: { messages: Messages }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [examples, setExamples] = useState<ExampleDraft[]>([{ karen: "", english: "" }]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const body = {
      titleEn: data.titleEn,
      titleKaren: data.titleKaren || null,
      summary: data.summary || null,
      explanation: data.explanation,
      scope: data.scope === "none" ? null : data.scope,
      source: data.source,
      provenanceUrl: data.provenanceUrl || null,
      provenancePage: data.provenancePage || null,
      examples: examples
        .filter((example) => example.karen.trim() || example.english.trim())
        .map((example) => ({ karen: example.karen.trim(), english: example.english.trim() })),
    };
    try {
      const response = await fetch("/api/grammar/rules", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error("Request failed");
      setState("success");
      form.reset();
      setExamples([{ karen: "", english: "" }]);
    } catch {
      setState("error");
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-intro">
        <p className="eyebrow">Community grammar knowledge</p>
        <h2>Describe a rule of S&apos;gaw Karen as you know it.</h2>
        <p>Explain the pattern, then show it in real sentences. Reviewers check accuracy and attribution before publication.</p>
      </div>
      <div className="form-grid">
        <label className="field" htmlFor="rule-title-en"><span>Rule title (English)</span><input id="rule-title-en" name="titleEn" required maxLength={200} placeholder="e.g. Tone 3 marks completed action" /></label>
        <label className="field" htmlFor="rule-title-ksw"><span>Rule title (Karen, optional)</span><input id="rule-title-ksw" name="titleKaren" lang="ksw" maxLength={200} /></label>
        <label className="field" htmlFor="rule-scope"><span>What this rule governs</span>
          <select id="rule-scope" name="scope" defaultValue="none">
            <option value="none">General / not sure</option>
            <option value="phonology">Sounds &amp; phonology</option>
            <option value="tone">Tone</option>
            <option value="syllable">Syllable structure</option>
            <option value="word_order">Word order</option>
            <option value="particles">Particles</option>
            <option value="negation">Negation</option>
            <option value="questions">Questions</option>
            <option value="verbs">Verbs</option>
            <option value="nouns">Nouns</option>
            <option value="numerals">Numerals</option>
            <option value="discourse">Discourse / conversation</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="field" htmlFor="rule-source"><span>Where this comes from</span>
          <select id="rule-source" name="source" defaultValue="community">
            <option value="community">My own knowledge / community</option>
            <option value="grammar_book">A grammar book</option>
            <option value="scraped">Another published source</option>
          </select>
        </label>
        <label className="field" htmlFor="rule-prov-url"><span>Source URL (if not yours)</span><input id="rule-prov-url" name="provenanceUrl" maxLength={500} /></label>
        <label className="field" htmlFor="rule-prov-page"><span>Source page (if a book)</span><input id="rule-prov-page" name="provenancePage" maxLength={160} /></label>
      </div>
      <label className="field" htmlFor="rule-summary"><span>One-line summary</span><input id="rule-summary" name="summary" maxLength={500} placeholder="The shortest true version of this rule" /></label>
      <label className="field" htmlFor="rule-explanation"><span>Full explanation</span><textarea id="rule-explanation" name="explanation" rows={6} required placeholder="Describe when this pattern applies, what changes, and any regional variation you know…" /></label>
      <div className="form-intro"><p className="eyebrow">Example sentences</p><p>Show the rule at work. Up to ten pairs of Karen + English.</p></div>
      {examples.map((example, index) => (
        <div className="form-grid" key={index}>
          <div>
            <label className="field" htmlFor={`rule-ex-ksw-${index}`}><span>Karen sentence</span>
              <input id={`rule-ex-ksw-${index}`} lang="ksw" value={example.karen} maxLength={500} onChange={(event) => setExamples((value) => value.map((item, i) => (i === index ? { ...item, karen: event.target.value } : item)))} />
            </label>
            {examples.length > 1 ? <button type="button" className="text-link" onClick={() => setExamples((value) => value.filter((_, i) => i !== index))}>Remove this example</button> : null}
          </div>
          <label className="field" htmlFor={`rule-ex-en-${index}`}><span>English translation</span>
            <input id={`rule-ex-en-${index}`} value={example.english} maxLength={500} onChange={(event) => setExamples((value) => value.map((item, i) => (i === index ? { ...item, english: event.target.value } : item)))} />
          </label>
        </div>
      ))}
      {examples.length < 10 ? <button type="button" className="button button--quiet" onClick={() => setExamples((value) => [...value, { karen: "", english: "" }])}>Add another example</button> : null}
      <div className="checkbox-row">
        <input id="rule-rights" type="checkbox" required />
        <label htmlFor="rule-rights">I created this explanation or have permission to share it under KOA&apos;s community language license.</label>
      </div>
      <button className="button button--primary" type="submit" disabled={state === "sending"}>{state === "sending" ? messages.sending : messages.submit}</button>
      <p className={`form-status form-status--${state}`} aria-live="polite">
        {state === "success" ? "Thank you — your rule is queued for community review." : state === "error" ? messages.error : ""}
      </p>
    </form>
  );
}
