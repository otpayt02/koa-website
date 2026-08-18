"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "./i18n";
import type { StudioEntry, StudioResponse, StudioStatus } from "@/content/studio-types";

type DraftValues = { en: string; karen: string };
type ImportChange = { key: string; en: string; karen: string };

const statusLabels: Record<StudioStatus | "all" | "session", string> = {
  all: "All entries",
  missing: "Missing Karen",
  draft: "Draft",
  unverified: "Unverified",
  verified: "Verified",
  session: "Changed this session",
};

export function TranslationStudio({ lang }: { lang: Lang }) {
  const [data, setData] = useState<StudioResponse | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftValues>>({});
  const [sessionKeys, setSessionKeys] = useState<string[]>([]);
  const [route, setRoute] = useState("*");
  const [filter, setFilter] = useState<StudioStatus | "all" | "session">("all");
  const [query, setQuery] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [importChanges, setImportChanges] = useState<ImportChange[]>([]);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const previewRef = useRef<HTMLIFrameElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/translations", { cache: "no-store" });
      const payload = await response.json() as StudioResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load the Translation Studio");
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the Translation Studio");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const routes = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.entries.map((entry) => entry.route))).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const visibleEntries = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLocaleLowerCase();
    return data.entries.filter((entry) => {
      if (route !== "*" && entry.route !== route) return false;
      if (filter === "session" && !sessionKeys.includes(entry.key)) return false;
      if (filter !== "all" && filter !== "session" && entry.status !== filter) return false;
      return !needle || [entry.key, entry.section, entry.enState.value, entry.karenState.value].join(" ").toLocaleLowerCase().includes(needle);
    });
  }, [data, filter, query, route, sessionKeys]);

  const progress = useMemo(() => {
    if (!data?.entries.length) return 0;
    return Math.round((data.entries.filter((entry) => entry.karenState.value.trim()).length / data.entries.length) * 100);
  }, [data]);

  const previewValues = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.entries.map((entry) => {
      const values = drafts[entry.key] ?? { en: entry.enState.value, karen: entry.karenState.value };
      return [entry.key, lang === "karen" ? values.karen || values.en : values.en];
    }));
  }, [data, drafts, lang]);

  function updatePreview() {
    previewRef.current?.contentWindow?.postMessage({ type: "koa-translation-preview", values: previewValues }, window.location.origin);
  }

  useEffect(() => {
    const timer = window.setTimeout(updatePreview, 0);
    return () => window.clearTimeout(timer);
  }, [previewValues, route]);

  function openEntry(entry: StudioEntry) {
    setDrafts((current) => ({
      ...current,
      [entry.key]: current[entry.key] ?? { en: entry.enState.value, karen: entry.karenState.value },
    }));
    setEditingKey(entry.key);
    setError("");
  }

  function cancelEntry(entry: StudioEntry) {
    setDrafts((current) => ({ ...current, [entry.key]: { en: entry.enState.value, karen: entry.karenState.value } }));
    setEditingKey(null);
  }

  async function saveEntry(entry: StudioEntry, direction: -1 | 0 | 1 = 0, imported = false, values?: DraftValues) {
    const nextValues = values ?? drafts[entry.key] ?? { en: entry.enState.value, karen: entry.karenState.value };
    setSavingKey(entry.key);
    setError("");
    try {
      const response = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key: entry.key,
          en: nextValues.en,
          karen: nextValues.karen,
          expected: { en: entry.enState.revisionId, karen: entry.karenState.revisionId },
          imported,
        }),
      });
      const payload = await response.json() as { entry?: StudioEntry; error?: string };
      if (!response.ok || !payload.entry) throw new Error(payload.error || "The entry could not be saved");
      setData((current) => current ? { ...current, entries: current.entries.map((item) => item.key === entry.key ? payload.entry! : item) } : current);
      setDrafts((current) => ({ ...current, [entry.key]: { en: payload.entry!.enState.value, karen: payload.entry!.karenState.value } }));
      setSessionKeys((current) => current.includes(entry.key) ? current : [...current, entry.key]);
      setEditingKey(null);
      setNotice(`${entry.key} saved and locked.`);
      moveFocus(entry.key, direction);
      return payload.entry;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The entry could not be saved");
      return null;
    } finally {
      setSavingKey(null);
    }
  }

  function moveFocus(key: string, direction: -1 | 0 | 1) {
    if (!direction) return;
    requestAnimationFrame(() => {
      const index = visibleEntries.findIndex((entry) => entry.key === key);
      const target = visibleEntries[index + direction];
      if (target) cardRefs.current.get(target.key)?.focus();
    });
  }

  function editorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>, entry: StudioEntry) {
    if (event.key === "Tab") {
      event.preventDefault();
      void saveEntry(entry, event.shiftKey ? -1 : 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEntry(entry);
    }
  }

  async function publishSession() {
    if (!data) return;
    const selected = data.entries.filter((entry) => sessionKeys.includes(entry.key));
    if (!selected.length) return;
    setError("");
    try {
      const response = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          entries: selected.map((entry) => ({
            key: entry.key,
            enRevisionId: entry.enState.revisionId,
            karenRevisionId: entry.karenState.revisionId,
          })),
        }),
      });
      const payload = await response.json() as { published?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "The session could not be published");
      setNotice(`${payload.published ?? selected.length} bilingual entries verified and published.`);
      setSessionKeys([]);
      setShowPublish(false);
      await load();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "The session could not be published");
    }
  }

  async function downloadExport(kind: "backup" | "corpus") {
    setError("");
    try {
      const response = await fetch(`/api/admin/translations?export=${kind}`);
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "The export could not be created");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = kind === "backup" ? "koa-bilingual-backup.json" : "koa-verified-en-ksw-corpus.jsonl";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "The export could not be created");
    }
  }

  async function previewImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !data) return;
    setError("");
    try {
      const backup = JSON.parse(await file.text()) as { format?: string; revisions?: Array<{ contentKey: string; language: "en" | "karen"; value: string; version: number }> };
      if (backup.format !== "koa-bilingual-backup" || !Array.isArray(backup.revisions)) throw new Error("Choose a KOA bilingual backup JSON file");
      const latest = new Map<string, { en?: { value: string; version: number }; karen?: { value: string; version: number } }>();
      for (const revision of backup.revisions) {
        const pair = latest.get(revision.contentKey) ?? {};
        const current = pair[revision.language];
        if (!current || revision.version > current.version) pair[revision.language] = { value: revision.value, version: revision.version };
        latest.set(revision.contentKey, pair);
      }
      const changes: ImportChange[] = [];
      for (const entry of data.entries) {
        const imported = latest.get(entry.key);
        if (!imported) continue;
        const en = imported.en?.value ?? entry.enState.value;
        const karen = imported.karen?.value ?? entry.karenState.value;
        if (en !== entry.enState.value || karen !== entry.karenState.value) changes.push({ key: entry.key, en, karen });
      }
      setImportChanges(changes);
      setNotice(changes.length ? `Review ${changes.length} imported differences before applying them.` : "The backup matches the current entries.");
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "The backup could not be read");
    } finally {
      event.target.value = "";
    }
  }

  async function applyImport() {
    if (!data) return;
    for (const change of importChanges) {
      const entry = data.entries.find((item) => item.key === change.key);
      if (!entry) continue;
      const saved = await saveEntry(entry, 0, true, { en: change.en, karen: change.karen });
      if (!saved) return;
    }
    setImportChanges([]);
    setNotice("Imported differences saved as unverified drafts.");
    await load();
  }

  if (loading) return <div className="translation-studio translation-studio--loading"><p>Loading the private Translation Studio…</p></div>;
  if (!data) return <div className="translation-studio translation-studio--loading"><h1>Translation Studio unavailable</h1><p>{error}</p><button className="button button--secondary" type="button" onClick={() => void load()}>Try again</button></div>;

  return (
    <div className="translation-studio">
      <header className="studio-header">
        <div><p className="eyebrow">Private beta · Administrator only</p><h1>KOA Bilingual Translation Studio</h1><p>English and <span lang="ksw">ကညီကျိာ်</span> counterparts · signed in as {data.user.displayName}</p></div>
        <div className="studio-header__actions">
          <a className="button button--quiet" href={`/${lang}`}>Open website</a>
          <button className="button button--quiet" type="button" onClick={() => void downloadExport("backup")}>Export backup</button>
          <button className="button button--quiet" type="button" onClick={() => void downloadExport("corpus")}>Export clean corpus</button>
          <label className="button button--quiet studio-import">Import backup<input type="file" accept="application/json,.json" onChange={previewImport} /></label>
          <button className="button button--primary" type="button" disabled={!sessionKeys.length} onClick={() => setShowPublish(true)}>Review & publish ({sessionKeys.length})</button>
        </div>
      </header>

      {error ? <p className="studio-banner studio-banner--error" role="alert">{error}</p> : null}
      {notice ? <p className="studio-banner" aria-live="polite">{notice}</p> : null}

      <div className="studio-progress" aria-label={`${progress}% of Karen counterparts filled`}><span style={{ width: `${progress}%` }} /><strong>{progress}% filled</strong><small>{data.entries.length} content units</small></div>

      <div className="studio-grid">
        <aside className="studio-sidebar" aria-label="Translation pages and filters">
          <label className="studio-search"><span>Search entries</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Key, English, or Karen" /></label>
          <h2>Pages</h2>
          <button type="button" aria-pressed={route === "*"} onClick={() => setRoute("*")}>All pages</button>
          {routes.filter((item) => item !== "*").map((item) => <button key={item} type="button" aria-pressed={route === item} onClick={() => setRoute(item)}>{item === "/" ? "Home" : item}</button>)}
          <h2>Status</h2>
          {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{statusLabels[item]}</button>)}
        </aside>

        <section className="studio-entries" aria-label="Bilingual content entries">
          <div className="studio-entries__heading"><div><p className="eyebrow">{route === "*" ? "All pages" : route}</p><h2>{visibleEntries.length} bilingual entries</h2></div><p>Tab saves, locks, and advances. Enter adds a new line. Escape cancels.</p></div>
          {visibleEntries.map((entry) => {
            const editing = editingKey === entry.key;
            const values = drafts[entry.key] ?? { en: entry.enState.value, karen: entry.karenState.value };
            return (
              <article
                className="studio-entry"
                data-status={entry.status}
                data-studio-card={entry.key}
                key={entry.key}
                tabIndex={editing ? -1 : 0}
                ref={(node) => { if (node) cardRefs.current.set(entry.key, node); else cardRefs.current.delete(entry.key); }}
                onDoubleClick={() => openEntry(entry)}
                onKeyDown={(event) => { if (!editing && event.key === "Enter") { event.preventDefault(); openEntry(entry); } }}
              >
                <header><div><span className="studio-status">{statusLabels[entry.status]}</span><code>{entry.key}</code></div><div><small>{entry.section} · {entry.type}</small>{!editing ? <button type="button" className="studio-edit" onClick={() => openEntry(entry)}>Edit</button> : null}</div></header>
                {editing ? (
                  <div className="studio-pair studio-pair--editing">
                    <label><span>English</span><textarea lang="en" autoFocus value={values.en} onChange={(event) => setDrafts((current) => ({ ...current, [entry.key]: { ...values, en: event.target.value } }))} onKeyDown={(event) => editorKeyDown(event, entry)} /></label>
                    <label><span lang="ksw">ကညီကျိာ်</span><textarea lang="ksw" value={values.karen} placeholder="Enter the S'gaw Karen counterpart" onChange={(event) => setDrafts((current) => ({ ...current, [entry.key]: { ...values, karen: event.target.value } }))} onKeyDown={(event) => editorKeyDown(event, entry)} /></label>
                    <div className="studio-entry__actions"><button className="button button--primary" type="button" disabled={savingKey === entry.key} onClick={() => void saveEntry(entry, 1)}>{savingKey === entry.key ? "Saving…" : "Save & next"}</button><button className="button button--quiet" type="button" onClick={() => cancelEntry(entry)}>Cancel</button></div>
                  </div>
                ) : (
                  <div className="studio-pair"><div><span>English</span><p lang="en">{entry.enState.value}</p></div><div><span lang="ksw">ကညီကျိာ်</span><p lang="ksw" data-empty={!entry.karenState.value}>{entry.karenState.value || "Empty — readers receive the English fallback"}</p></div></div>
                )}
              </article>
            );
          })}
        </section>

        <aside className="studio-preview" aria-label="Live draft page preview">
          <div><p className="eyebrow">Live draft preview</p><a href={`/${lang}${route === "*" || route === "/" ? "" : route}`} target="_blank" rel="noreferrer">Open published page</a></div>
          <iframe ref={previewRef} title="Live draft website preview" src={`/${lang}${route === "*" || route === "/" ? "" : route}`} onLoad={updatePreview} />
        </aside>
      </div>

      {showPublish ? <div className="studio-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title"><div><p className="eyebrow">Verify & publish session</p><h2 id="publish-title">Review {sessionKeys.length} changed entries</h2><p>These paired revisions will become public together. If validation or conflict checking fails for one entry, none publish.</p><ul>{data.entries.filter((entry) => sessionKeys.includes(entry.key)).map((entry) => <li key={entry.key}><code>{entry.key}</code><span>{entry.enState.publishedValue ?? "No published English"} → {entry.enState.value}</span><span lang="ksw">{entry.karenState.publishedValue ?? "No published Karen"} → {entry.karenState.value || "Missing"}</span></li>)}</ul><div className="button-row"><button className="button button--primary" type="button" onClick={() => void publishSession()}>Verify & publish session</button><button className="button button--quiet" type="button" onClick={() => setShowPublish(false)}>Keep editing</button></div></div></div> : null}

      {importChanges.length ? <div className="studio-modal" role="dialog" aria-modal="true" aria-labelledby="import-title"><div><p className="eyebrow">Import comparison</p><h2 id="import-title">Review {importChanges.length} differences</h2><p>Importing saves unverified drafts. It never silently publishes or overwrites work without this confirmation.</p><ul>{importChanges.slice(0, 50).map((change) => <li key={change.key}><code>{change.key}</code><span>{change.en}</span><span lang="ksw">{change.karen || "Missing Karen"}</span></li>)}</ul><div className="button-row"><button className="button button--primary" type="button" onClick={() => void applyImport()}>Import as drafts</button><button className="button button--quiet" type="button" onClick={() => setImportChanges([])}>Cancel import</button></div></div></div> : null}
    </div>
  );
}
