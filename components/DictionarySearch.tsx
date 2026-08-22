"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { StatusPill } from "./StatusPill";
import type { Lang, Messages } from "./i18n";

type LiveEntry = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  category: string | null;
  version: number;
  status: string;
  translations: { id: string; language: string; text: string; status: string }[];
};

type LexiconStats = { approvedEntries: number; pendingEntries: number; openRequests: number };

export function DictionarySearch({ lang, messages }: { lang: Lang; messages: Messages }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [entries, setEntries] = useState<LiveEntry[]>([]);
  const [stats, setStats] = useState<LexiconStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Request-a-word flywheel state
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestBusy, setRequestBusy] = useState(false);
  const requestName = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "24" });
        if (debounced) params.set("q", debounced);
        const response = await fetch(`/api/dictionary?${params.toString()}`);
        if (!response.ok) throw new Error(`Lookup failed (${response.status})`);
        const data = (await response.json()) as { entries: LiveEntry[] };
        if (!cancelled) setEntries(data.entries);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Lookup failed");
          setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    fetch("/api/dictionary/requests?status=open")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.stats) setStats(data.stats as LexiconStats);
      })
      .catch(() => {
        /* stats are decorative — never block the dictionary on them */
      });
  }, []);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestBusy(true);
    try {
      const response = await fetch("/api/dictionary/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          term: debounced || query.trim(),
          context: `Requested from dictionary search (${lang})`,
          name: requestName.current?.value.trim() || null,
        }),
      });
      if (!response.ok) throw new Error("request failed");
      setRequestSent(true);
    } catch {
      setError("Could not submit the request. Please try again.");
    } finally {
      setRequestBusy(false);
    }
  }

  const empty = !loading && !error && entries.length === 0;
  const resultLabel = useMemo(
    () => (entries.length === 1 ? "entry" : "entries"),
    [entries.length],
  );

  return (
    <div className="dictionary-explorer">
      <div className="search-panel">
        <label htmlFor="dictionary-query">
          <span>{messages.searchDictionary}</span>
          <input
            id="dictionary-query"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setRequestOpen(false);
              setRequestSent(false);
            }}
            placeholder={lang === "karen" ? "ကညီ မ့တမ့ၢ် English" : "Try “community” or ကညီ"}
            autoComplete="off"
          />
        </label>
      </div>
      <div className="result-count" aria-live="polite">
        <strong>{loading ? "…" : entries.length}</strong> {resultLabel}
        <span>
          {stats
            ? `${stats.approvedEntries.toLocaleString()} approved · ${stats.pendingEntries.toLocaleString()} under review`
            : "Approved S'gaw Karen records"}
        </span>
      </div>
      {error ? <div className="empty-state"><p>{error}</p></div> : null}
      {entries.length ? (
        <div className="dictionary-grid">
          {entries.map((entry) => {
            const translations = entry.translations.map((t) => t.text);
            return (
              <article className="dictionary-card" key={entry.id}>
                <div className="dictionary-card__top">
                  <StatusPill tone="green">Community reviewed</StatusPill>
                  <span>v{entry.version}</span>
                </div>
                <div>
                  <p className="dictionary-word" lang="ksw">{entry.word}</p>
                  {entry.partOfSpeech ? <p className="romanization">{entry.partOfSpeech}</p> : null}
                </div>
                <h3>{translations.length ? translations.slice(0, 2).join(" · ") : "Translation pending"}</h3>
                <div className="dictionary-card__foot">
                  <Link className="text-link" href={`/${lang}/dictionary/${entry.id}`}>View full entry</Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
      {empty ? (
        <div className="empty-state">
          <h2>No matching entry yet.</h2>
          <p>
            This word is not in the approved lexicon. Request it below — community
            reviewers see every request and can claim it.
          </p>
          {!requestSent ? (
            <form className="request-word-form" onSubmit={submitRequest}>
              {!requestOpen ? (
                <button type="button" className="button button--primary" onClick={() => setRequestOpen(true)}>
                  Request “{debounced || query.trim()}”
                </button>
              ) : (
                <>
                  <input ref={requestName} type="text" placeholder="Your name (optional)" maxLength={120} />
                  <button type="submit" className="button button--primary" disabled={requestBusy || !debounced}>
                    {requestBusy ? "Sending…" : "Send request"}
                  </button>
                  <button type="button" className="button button--quiet" onClick={() => setRequestOpen(false)}>Cancel</button>
                </>
              )}
            </form>
          ) : (
            <p className="request-word-thanks">
              ✓ Request logged. It now appears on the community requests board,
              where contributors can claim it and reviewers approve it.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
