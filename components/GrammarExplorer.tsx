"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "./StatusPill";

type RuleExample = { id: string; karen: string | null; english: string | null; note: string | null };

type Rule = {
  id: string;
  titleEn: string;
  titleKaren: string | null;
  summary: string | null;
  explanation: string;
  scope: string | null;
  source: string;
  provenanceUrl: string | null;
  provenancePage: string | null;
  examples: RuleExample[];
};

const SCOPE_LABELS: Record<string, string> = {
  phonology: "Sounds", tone: "Tone", syllable: "Syllable", word_order: "Word order",
  particles: "Particles", negation: "Negation", questions: "Questions", verbs: "Verbs",
  nouns: "Nouns", numerals: "Numerals", discourse: "Discourse", other: "Other",
};

export function GrammarExplorer() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/grammar/rules?limit=50", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Failed to load"); return response.json(); })
      .then((data) => { setRules(data.rules ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) return <div className="empty-state"><p>Loading approved grammar rules…</p></div>;
  if (error) return <div className="empty-state"><p>Grammar rules could not be loaded right now.</p></div>;
  if (!rules.length) {
    return (
      <div className="empty-state">
        <h3>No approved rules published yet.</h3>
        <p>Grammar rules appear here after community review. Share what you know using the form below — the language&apos;s structure belongs to its speakers.</p>
      </div>
    );
  }

  return (
    <div className="grammar-list">
      {rules.map((rule) => {
        const open = openId === rule.id;
        return (
          <article className="dictionary-card" key={rule.id}>
            <button type="button" className="grammar-card-toggle" aria-expanded={open} onClick={() => setOpenId(open ? null : rule.id)}>
              <div>
                <p className="dictionary-word" lang="ksw">{rule.titleKaren ?? rule.titleEn}</p>
                {rule.titleKaren ? <p className="romanization">{rule.titleEn}</p> : null}
                {rule.summary ? <p>{rule.summary}</p> : null}
              </div>
              <div className="grammar-card-toggle__meta">
                {rule.scope ? <StatusPill tone="blue">{SCOPE_LABELS[rule.scope] ?? rule.scope}</StatusPill> : null}
                <span className="text-link">{open ? "Close" : "Read rule"}</span>
              </div>
            </button>
            {open ? (
              <div className="grammar-card-body">
                <p>{rule.explanation}</p>
                {rule.examples.length ? (
                  <>
                    <p className="eyebrow">Example sentences</p>
                    <div className="grammar-examples">
                      {rule.examples.map((example) => (
                        <div key={example.id}>
                          {example.karen ? <p lang="ksw" className="dictionary-word">{example.karen}</p> : null}
                          {example.english ? <p>{example.english}</p> : null}
                          {example.note ? <p className="romanization">{example.note}</p> : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
                {rule.provenanceUrl || rule.provenancePage ? (
                  <p className="romanization">
                    Source: {rule.provenanceUrl ? <a className="text-link" href={rule.provenanceUrl} rel="noreferrer" target="_blank">{rule.provenanceUrl}</a> : rule.provenancePage}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
