"use client";

import { useMemo, useState } from "react";
import { dictionaryEntries } from "./data";
import { DictionaryEntry } from "./DictionaryEntry";
import type { Lang, Messages } from "./i18n";

const categories = ["all", "identity", "language", "everyday", "community", "family", "values"];

export function DictionarySearch({ lang, messages }: { lang: Lang; messages: Messages }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const results = useMemo(() => {
    const needle = query.toLocaleLowerCase();
    return dictionaryEntries.filter((entry) => (category === "all" || entry.category === category) && (!needle || [entry.word, entry.romanization, ...entry.translations, entry.definition.en, entry.definition.karen].join(" ").toLocaleLowerCase().includes(needle)));
  }, [query, category]);

  return (
    <div className="dictionary-explorer">
      <div className="search-panel">
        <label htmlFor="dictionary-query"><span>{messages.searchDictionary}</span><input id="dictionary-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={lang === "ksw" ? "ကညီ မ့တမ့ၢ် English" : "Try “community” or ကညီ"} autoComplete="off" /></label>
        <div className="filter-row" aria-label="Filter by category">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      <div className="result-count" aria-live="polite"><strong>{results.length}</strong> {results.length === 1 ? "entry" : "entries"}<span>Approved S&apos;gaw Karen records</span></div>
      {results.length ? <div className="dictionary-grid">{results.map((entry) => <DictionaryEntry key={entry.id} entry={entry} lang={lang} />)}</div> : <div className="empty-state"><h2>No matching entry yet.</h2><p>Try another spelling, or share the word with community reviewers.</p><a className="button button--primary" href={`/${lang}/contribute`}>Suggest this word</a></div>}
    </div>
  );
}
