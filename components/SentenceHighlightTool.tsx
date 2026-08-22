"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnnotationRule = {
  id: string;
  titleEn: string;
  titleKaren: string | null;
  summary: string | null;
  explanation: string;
};

type Annotation = {
  id: string;
  karenText: string;
  startOffset: number;
  endOffset: number;
  ruleId: string | null;
  confidence: number | null;
  source: "agent" | "member";
  rule: AnnotationRule | null;
};

type ApprovedRule = { id: string; titleEn: string; titleKaren: string | null };

// Sentence highlight tool: paste a Karen sentence, see community-verified
// grammar spans. Hover/tap a highlighted span to reveal the governing rule.
// Members can attach a rule to a new span; agent proposals arrive with a
// confidence score and go through the same review queue.
export function SentenceHighlightTool() {
  const [text, setText] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [approvedRules, setApprovedRules] = useState<ApprovedRule[]>([]);
  const [active, setActive] = useState<Annotation | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Annotation-creation state (textarea selection = exact UTF-16 offsets).
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [ruleId, setRuleId] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error" | "auth">("idle");

  useEffect(() => {
    fetch("/api/grammar/rules?limit=50")
      .then((response) => (response.ok ? response.json() : { rules: [] }))
      .then((data) => setApprovedRules(data.rules ?? []))
      .catch(() => setApprovedRules([]));
  }, []);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length < 2) { setAnnotations([]); setActive(null); return; }
    setLoading(true);
    setFetchError(false);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/grammar/annotations?text=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => { if (!response.ok) throw new Error("Failed"); return response.json(); })
        .then((data) => {
          const rows = (data.annotations ?? []) as Annotation[];
          setAnnotations(rows);
          setActive(rows[0] ?? null);
          setLoading(false);
        })
        .catch(() => { setFetchError(true); setLoading(false); });
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [text]);

  // Split the sentence into segments: plain text and annotated spans.
  const segments = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [] as { text: string; annotation: Annotation | null }[];
    const boundaries = new Set<number>([0, trimmed.length]);
    for (const annotation of annotations) {
      boundaries.add(Math.max(0, Math.min(annotation.startOffset, trimmed.length)));
      boundaries.add(Math.max(0, Math.min(annotation.endOffset, trimmed.length)));
    }
    const points = [...boundaries].sort((a, b) => a - b);
    const result: { text: string; annotation: Annotation | null }[] = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const [start, end] = [points[i], points[i + 1]];
      if (end <= start) continue;
      const covering = annotations
        .filter((annotation) => annotation.startOffset <= start && annotation.endOffset >= end)
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
      result.push({ text: trimmed.slice(start, end), annotation: covering[0] ?? null });
    }
    return result;
  }, [text, annotations]);

  function captureSelection() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    setSelection(end > start ? { start, end } : null);
    setSubmitState("idle");
  }

  async function submitAnnotation() {
    const el = textareaRef.current;
    if (!el || !selection || !ruleId) return;
    setSubmitState("sending");
    try {
      const response = await fetch("/api/grammar/annotations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          karenText: el.value.trim(),
          startOffset: selection.start,
          endOffset: selection.end,
          ruleId,
          source: "member",
        }),
      });
      if (response.status === 401) { setSubmitState("auth"); return; }
      if (!response.ok) throw new Error("Failed");
      setSubmitState("success");
      setSelection(null);
    } catch {
      setSubmitState("error");
    }
  }

  const selectedText = selection && textareaRef.current ? text.slice(selection.start, selection.end) : null;

  return (
    <div className="highlight-tool">
      <label className="field" htmlFor="highlight-sentence">
        <span>Karen sentence</span>
        <textarea
          id="highlight-sentence"
          ref={textareaRef}
          rows={2}
          lang="ksw"
          placeholder="ဘၣ်လၢ်အိၣ်ယွၤဒိၣ်…"
          value={text}
          maxLength={2000}
          onChange={(event) => setText(event.target.value)}
          onSelect={captureSelection}
        />
      </label>

      {segments.length ? (
        <div className="highlight-render" aria-label="Sentence with grammar highlights">
          {segments.map((segment, index) =>
            segment.annotation && segment.annotation.rule ? (
              <span
                key={index}
                className="highlight-span"
                data-active={active?.id === segment.annotation!.id || undefined}
                onMouseEnter={() => setActive(segment.annotation)}
                onFocus={() => setActive(segment.annotation)}
                onClick={() => setActive(segment.annotation)}
                tabIndex={0}
                role="button"
                aria-label={`Grammar rule: ${segment.annotation.rule.titleEn}`}
              >
                {segment.text}
              </span>
            ) : (
              <span key={index}>{segment.text}</span>
            )
          )}
        </div>
      ) : text.trim().length >= 2 ? (
        <p className="romanization">{loading ? "Looking up annotations…" : fetchError ? "Annotations could not be loaded." : "No verified grammar annotations for this sentence yet."}</p>
      ) : null}

      {active?.rule ? (
        <aside className="rule-popover" aria-live="polite">
          <p className="eyebrow">{active.source === "agent" ? `Agent proposal · ${Math.round((active.confidence ?? 0) * 100)}% confidence` : "Verified by community"}</p>
          <h4>{active.rule.titleKaren ?? active.rule.titleEn}</h4>
          {active.rule.titleKaren ? <p className="romanization">{active.rule.titleEn}</p> : null}
          {active.rule.summary ? <p>{active.rule.summary}</p> : <p>{active.rule.explanation}</p>}
        </aside>
      ) : null}

      <div className="highlight-attach">
        <p className="eyebrow">Know a rule this span follows?</p>
        <div className="form-grid">
          <label className="field" htmlFor="highlight-rule"><span>Governing rule</span>
            <select id="highlight-rule" value={ruleId} onChange={(event) => setRuleId(event.target.value)} disabled={!selection}>
              <option value="">{selection ? "Choose a rule…" : "Select text in the sentence first"}</option>
              {approvedRules.map((rule) => (
                <option key={rule.id} value={rule.id}>{rule.titleKaren ?? rule.titleEn}</option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>Selected text</span>
            <p className="dictionary-word" lang="ksw">{selectedText || "—"}</p>
            <button type="button" className="button button--primary" disabled={!selection || !ruleId || submitState === "sending"} onClick={submitAnnotation}>
              {submitState === "sending" ? "Saving…" : "Attach rule"}
            </button>
          </div>
        </div>
        <p className={`form-status form-status--${submitState === "auth" ? "error" : submitState}`} aria-live="polite">
          {submitState === "success" ? "Submitted — a verifier will review this annotation." : submitState === "auth" ? "Sign in to attach grammar annotations." : submitState === "error" ? "Something went wrong — please try again." : ""}
        </p>
      </div>
    </div>
  );
}
