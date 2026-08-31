"use client";

import { useCallback, useEffect, useState } from "react";

type ProposalLocale = "th" | "my" | "ksw";
type ProposalStatus = "draft" | "pending_review" | "approved" | "rejected" | "superseded";

type Proposal = {
  id: string;
  contentUnitId: string;
  sourceRevision: number;
  locale: ProposalLocale;
  value: string;
  provider: string | null;
  modelVersion: string | null;
  confidence: number | null;
  status: ProposalStatus;
  reviewerId: string | null;
  reviewNote: string | null;
  trainingEligible: boolean;
  exportEligible: boolean;
};

type ContentUnit = {
  id: string;
  route: string;
  section: string;
  frame: string;
  sourceRevision: number;
  sourceText: string;
  sourceProvenance: Record<string, unknown>;
  proposals: Proposal[];
};

const localeColumns: Array<{ locale: ProposalLocale; label: string }> = [
  { locale: "th", label: "Thai" },
  { locale: "my", label: "Burmese" },
  { locale: "ksw", label: "S'gaw Karen" },
];

export function LanguageStudio({ lang }: { lang: string }) {
  const [units, setUnits] = useState<ContentUnit[]>([]);
  const [viewState, setViewState] = useState<"loading" | "ready" | "empty" | "permission" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [showSourceForm, setShowSourceForm] = useState(false);

  const loadUnits = useCallback(async () => {
    setViewState("loading");
    setNotice("");
    try {
      const response = await fetch("/api/admin/content-units", { headers: { accept: "application/json" } });
      if (response.status === 401 || response.status === 403) {
        setViewState("permission");
        return;
      }
      if (!response.ok) throw new Error(await responseMessage(response, "Content units could not load."));
      const data = await response.json() as { units?: ContentUnit[] };
      const nextUnits = Array.isArray(data.units) ? data.units : [];
      setUnits(nextUnits);
      setViewState(nextUnits.length ? "ready" : "empty");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Content units could not load.");
      setViewState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { void loadUnits(); });
  }, [loadUnits]);

  function replaceProposal(unitId: string, proposal: Proposal) {
    setUnits((current) => current.map((unit) => unit.id === unitId
      ? { ...unit, proposals: [proposal, ...unit.proposals.filter((item) => item.id !== proposal.id)] }
      : unit));
    setViewState("ready");
  }

  return (
    <section className="language-studio" aria-labelledby="language-studio-title">
      <div className="language-studio__toolbar">
        <div>
          <p className="eyebrow">Source-led review matrix</p>
          <h2 id="language-studio-title">One English revision, three independent proposals.</h2>
          <p>Rows stay aligned by route, section, and frame so review decisions never lose their source.</p>
        </div>
        <div className="language-studio__toolbar-actions">
          <button className="button button--secondary" type="button" onClick={() => setShowSourceForm((value) => !value)} aria-expanded={showSourceForm}>
            {showSourceForm ? "Close source form" : "Add English source"}
          </button>
          <button className="button button--quiet" type="button" onClick={() => void loadUnits()} disabled={viewState === "loading"}>Refresh</button>
          <a className="button button--quiet" href={`/${lang}/admin`}>Back to dashboard</a>
        </div>
      </div>

      {showSourceForm ? <EnglishSourceForm onSaved={() => { setShowSourceForm(false); void loadUnits(); }} /> : null}

      <div className="language-studio__boundary" role="note">
        <strong>S&apos;gaw Karen review boundary</strong>
        <span>Unreviewed S&apos;gaw Karen is not training data. Only a current, reviewer-approved proposal can be exported.</span>
      </div>

      {notice ? <p className="language-studio__notice" role="status" aria-live="polite">{notice}</p> : null}
      {viewState === "loading" ? <StudioState title="Loading content units…" detail="Reading current English revisions and proposal history." /> : null}
      {viewState === "permission" ? <StudioState title="Permission denied" detail="An administrator account is required to use Language Studio." /> : null}
      {viewState === "error" ? <StudioState title="Language Studio could not load" detail={notice || "Check the API connection, then refresh."} action={<button className="button button--secondary" type="button" onClick={() => void loadUnits()}>Try again</button>} /> : null}
      {viewState === "empty" ? <StudioState title="No content units yet" detail="Add the first English source above. Translation proposals remain unavailable until a source revision exists." action={<button className="button button--primary" type="button" onClick={() => setShowSourceForm(true)}>Add English source</button>} /> : null}

      {viewState === "ready" ? (
        <div className="language-studio__table" role="region" aria-label="Translation proposal matrix" tabIndex={0}>
          <div className="language-studio__locale-grid language-studio__locale-grid--header" aria-hidden="true">
            <span>English source</span>
            {localeColumns.map(({ locale, label }) => <span key={locale} lang={locale}>{label}</span>)}
          </div>
          {units.map((unit) => (
            <article className="language-studio__unit-row" key={unit.id}>
              <header className="language-studio__unit-heading">
                <div><strong>{unit.route}</strong><span>{unit.section} / {unit.frame}</span></div>
                <span className="language-studio__status language-studio__status--source">English · revision {unit.sourceRevision}</span>
              </header>
              <div className="language-studio__locale-grid">
                <div className="language-studio__source" data-locale-label="English source">
                  <p>{unit.sourceText}</p>
                  <div className="language-studio__meta" aria-label="English source provenance">
                    <span>source · en</span>
                    <span>revision · {unit.sourceRevision}</span>
                    <span>provenance · {provenanceLabel(unit.sourceProvenance)}</span>
                  </div>
                </div>
                {localeColumns.map(({ locale, label }) => (
                  <ProposalCell
                    key={`${locale}:${proposalForLocale(unit, locale)?.id ?? "empty"}`}
                    unit={unit}
                    locale={locale}
                    label={label}
                    onSaved={(proposal) => {
                      replaceProposal(unit.id, proposal);
                      setNotice("Proposal saved. Review status and provenance are shown in this row.");
                    }}
                    onFailure={setNotice}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProposalCell({ unit, locale, label, onSaved, onFailure }: {
  unit: ContentUnit;
  locale: ProposalLocale;
  label: string;
  onSaved: (proposal: Proposal) => void;
  onFailure: (message: string) => void;
}) {
  const proposal = proposalForLocale(unit, locale);
  const [value, setValue] = useState(proposal?.value ?? "");
  const [provider, setProvider] = useState(proposal?.provider ?? "human");
  const [modelVersion, setModelVersion] = useState(proposal?.modelVersion ?? "manual");
  const [confidence, setConfidence] = useState(String(proposal?.confidence ?? 1));
  const [reviewNote, setReviewNote] = useState(proposal?.reviewNote ?? "");
  const [busy, setBusy] = useState(false);

  async function saveDraft() {
    setBusy(true);
    onFailure("");
    try {
      const response = await fetch("/api/admin/translation-proposals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contentUnitId: unit.id,
          sourceRevision: unit.sourceRevision,
          sourceLocale: "en",
          locale,
          value,
          provider,
          modelVersion,
          confidence: Number(confidence),
          status: "draft",
        }),
      });
      if (response.status === 401 || response.status === 403) throw new Error("Permission denied. Administrator access is required.");
      if (!response.ok) throw new Error(await responseMessage(response, "Proposal could not be saved."));
      const data = await response.json() as { proposal: Proposal };
      onSaved(data.proposal);
    } catch (error) {
      onFailure(error instanceof Error ? error.message : "Proposal could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function review(status: "approved" | "rejected" | "superseded") {
    if (!proposal) return;
    setBusy(true);
    onFailure("");
    try {
      const response = await fetch("/api/admin/translation-proposals", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: proposal.id, status, reviewNote }),
      });
      if (response.status === 401 || response.status === 403) throw new Error("Permission denied. Administrator access is required.");
      if (!response.ok) throw new Error(await responseMessage(response, "Review transition could not be saved."));
      const data = await response.json() as { proposal: Proposal };
      onSaved(data.proposal);
    } catch (error) {
      onFailure(error instanceof Error ? error.message : "Review transition could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  const canReview = proposal && !["approved", "rejected", "superseded"].includes(proposal.status);

  return (
    <div className="language-studio__proposal" data-locale-label={label} lang={locale}>
      <div className="language-studio__proposal-topline">
        <span className={`language-studio__status language-studio__status--${proposal?.status ?? "empty"}`}>{statusLabel(proposal?.status)}</span>
        {proposal?.trainingEligible ? <span className="language-studio__status language-studio__status--eligible">Export eligible</span> : null}
      </div>
      <label>
        <span>{label} proposal</span>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} rows={5} placeholder={`Enter ${label} proposal`} />
      </label>
      <div className="language-studio__provenance-fields">
        <label><span>Provider</span><input value={provider} onChange={(event) => setProvider(event.target.value)} /></label>
        <label><span>Model</span><input value={modelVersion} onChange={(event) => setModelVersion(event.target.value)} /></label>
        <label><span>Confidence</span><input type="number" min="0" max="1" step="0.01" value={confidence} onChange={(event) => setConfidence(event.target.value)} /></label>
      </div>
      <div className="language-studio__meta" aria-label={`${label} proposal provenance`}>
        <span>provider · {(proposal?.provider ?? provider) || "unset"}</span>
        <span>model · {(proposal?.modelVersion ?? modelVersion) || "unset"}</span>
        <span>confidence · {formatConfidence(proposal?.confidence ?? Number(confidence))}</span>
        <span>provenance · English r{unit.sourceRevision}</span>
      </div>
      <button className="button button--secondary language-studio__save" type="button" onClick={() => void saveDraft()} disabled={busy || !value.trim()}>
        {busy ? "Saving…" : "Save draft"}
      </button>
      {proposal ? (
        <div className="language-studio__review">
          <label><span>Review note</span><input value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Optional decision note" /></label>
          <div className="language-studio__review-actions">
            <button type="button" onClick={() => void review("approved")} disabled={busy || !canReview}>Approve</button>
            <button type="button" onClick={() => void review("rejected")} disabled={busy || !canReview}>Reject</button>
            <button type="button" onClick={() => void review("superseded")} disabled={busy || proposal.status === "superseded"}>Supersede</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EnglishSourceForm({ onSaved }: { onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/content-units", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          route: form.get("route"),
          section: form.get("section"),
          frame: form.get("frame"),
          sourceText: form.get("sourceText"),
          provenanceNote: form.get("provenanceNote"),
          baseRevision: Number(form.get("baseRevision")),
          sourceLocale: "en",
        }),
      });
      if (response.status === 401 || response.status === 403) throw new Error("Permission denied. Administrator access is required.");
      if (!response.ok) throw new Error(await responseMessage(response, "English source could not be saved."));
      setMessage("English source revision saved.");
      onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "English source could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="language-studio__source-form" onSubmit={submit}>
      <div className="language-studio__source-form-grid">
        <label><span>Route</span><input name="route" placeholder="/about" required /></label>
        <label><span>Section</span><input name="section" placeholder="hero" required /></label>
        <label><span>Frame</span><input name="frame" placeholder="title" required /></label>
        <label><span>Base revision</span><input name="baseRevision" type="number" min="0" defaultValue="0" required /></label>
      </div>
      <label><span>English source</span><textarea name="sourceText" rows={4} required /></label>
      <label><span>Provenance note</span><input name="provenanceNote" placeholder="Where this wording came from" /></label>
      <div className="language-studio__source-form-actions">
        <button className="button button--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save English revision"}</button>
        <span role="status" aria-live="polite">{message}</span>
      </div>
    </form>
  );
}

function StudioState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="language-studio__state"><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

async function responseMessage(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

function statusLabel(status?: ProposalStatus) {
  if (!status) return "No proposal";
  return status.replaceAll("_", " ");
}

function formatConfidence(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value * 100)}%` : "unset";
}

function provenanceLabel(value: Record<string, unknown>) {
  const note = typeof value?.note === "string" ? value.note : null;
  const actor = typeof value?.authoredBy === "string" ? value.authoredBy : null;
  return note || actor || "recorded";
}

function proposalForLocale(unit: ContentUnit, locale: ProposalLocale) {
  return unit.proposals.find((item) => item.locale === locale && item.status !== "superseded")
    ?? unit.proposals.find((item) => item.locale === locale);
}
