"use client";

import { useMemo, useState } from "react";
import type { CinematicFrame, FrameManifestLoadResult } from "@/lib/cinema/frame-manifest";
import { partners, publicPartners } from "@/content/partners";

type ReviewTab = "static" | "motion" | "content";
type MotionSetting = "on" | "off";
type ViewportId = "mobile" | "tablet" | "full";

const viewports: Array<{ id: ViewportId; label: string; width: number | string; height: number | string }> = [
  { id: "mobile", label: "390 × 844", width: 390, height: 844 },
  { id: "tablet", label: "768 × 1024", width: 768, height: 1024 },
  { id: "full", label: "Full width", width: "100%", height: "min(78vh, 960px)" },
];

const reviewTabs: Array<{ id: ReviewTab; label: string }> = [
  { id: "static", label: "Static" },
  { id: "motion", label: "Motion" },
  { id: "content", label: "Content" },
];

export function DesignStudio({ lang, manifest }: { lang: string; manifest: FrameManifestLoadResult }) {
  const frames = manifest.ok ? manifest.frames : [];
  const [selectedFrameId, setSelectedFrameId] = useState(frames[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<ReviewTab>("static");
  const [viewportId, setViewportId] = useState<ViewportId>("mobile");
  const [motion, setMotion] = useState<MotionSetting>("on");
  const [previewKey, setPreviewKey] = useState(0);

  const selectedFrame = frames.find((frame) => frame.id === selectedFrameId) ?? frames[0];
  const viewport = viewports.find((candidate) => candidate.id === viewportId) ?? viewports[0];
  const previewUrl = useMemo(() => `/${lang}?koa-preview=1&motion=${motion}`, [lang, motion]);
  const draftPartners = partners.filter((partner) => !publicPartners.includes(partner));

  if (!manifest.ok) {
    return (
      <StudioState title="Manifest could not be displayed" detail="Correct the invalid frame definitions, then reload this protected workspace.">
        <ul>{manifest.errors.map((error) => <li key={error}>{error}</li>)}</ul>
      </StudioState>
    );
  }

  if (!selectedFrame) {
    return <StudioState title="No valid cinematic frames" detail="Add at least one validated frame to the canonical manifest before opening the preview." />;
  }

  return (
    <section className="design-studio" aria-labelledby="design-studio-title">
      <header className="design-studio__toolbar">
        <div>
          <p className="eyebrow">Frame-authored review surface</p>
          <h2 id="design-studio-title">Read the film one deliberate beat at a time.</h2>
          <p>The rail follows the public story. The preview is the real localized application, never a second studio runtime.</p>
        </div>
        <div className="design-studio__toolbar-actions">
          <button className="button button--secondary" type="button" onClick={() => setPreviewKey((value) => value + 1)}>Reload</button>
          <a className="button button--secondary" href={previewUrl} target="_blank" rel="noreferrer">Open Full Page</a>
          <a className="button button--quiet" href={`/${lang}/admin`}>Back to dashboard</a>
        </div>
      </header>

      <div className="design-studio__controls" aria-label="Preview controls">
        <ControlGroup label="Preview viewport">
          <div className="design-studio__button-group" role="group" aria-label="Preview viewport">
            {viewports.map((candidate) => (
              <button key={candidate.id} type="button" aria-pressed={candidate.id === viewportId} onClick={() => setViewportId(candidate.id)}>
                {candidate.label}
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup label="Motion">
          <div className="design-studio__button-group" role="group" aria-label="Motion setting">
            <button type="button" aria-pressed={motion === "on"} onClick={() => setMotion("on")}>Motion on</button>
            <button type="button" aria-pressed={motion === "off"} onClick={() => setMotion("off")}>Motion off</button>
          </div>
        </ControlGroup>
        <p className="design-studio__preview-source"><span>Preview source</span><code>{previewUrl}</code></p>
      </div>

      <section className="design-studio__partner-review" aria-labelledby="design-studio-partner-title">
        <header>
          <div><span>Draft / empty state</span><h3 id="design-studio-partner-title">Partner review</h3></div>
          <strong>{publicPartners.length} public · {draftPartners.length} draft</strong>
        </header>
        {partners.length === 0 ? (
          <div className="design-studio__partner-empty">
            <p>No partner records are ready for public display.</p>
            <p>Add a draft only after a verified relationship source and approved logo-use permission can be recorded.</p>
          </div>
        ) : (
          <ul>
            {draftPartners.map((partner) => (
              <li key={partner.id}>
                <strong>{partner.name}</strong>
                <span>Relationship: {partner.relationshipStatus}</span>
                <span>Logo permission: {partner.logoPermission}</span>
                <span>Review: {partner.reviewStatus}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="design-studio__workspace">
        <aside className="design-studio__frame-rail" aria-label="Chronological frame rail">
          <div className="design-studio__rail-heading">
            <span>Chronological frame rail</span>
            <strong>{frames.length} beats</strong>
          </div>
          <ol role="tablist" aria-orientation="vertical">
            {frames.map((frame, index) => (
              <li key={frame.id}>
                <button type="button" role="tab" aria-selected={frame.id === selectedFrame.id} aria-controls="design-studio-frame-inspector" aria-current={frame.id === selectedFrame.id ? "step" : undefined} onClick={() => setSelectedFrameId(frame.id)}>
                  <span className="design-studio__frame-index">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{frame.title}</strong><small>{formatProgress(frame.entry.progress)}–{formatProgress(frame.exit.progress)}</small></span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section id="design-studio-frame-inspector" className="design-studio__inspector" aria-labelledby="selected-frame-title">
          <header className="design-studio__frame-heading">
            <div><span>{selectedFrame.id}</span><h3 id="selected-frame-title">{selectedFrame.title}</h3></div>
            <p>{formatProgress(selectedFrame.entry.progress)} → {formatProgress(selectedFrame.exit.progress)}</p>
          </header>

          <div className="design-studio__tabs" role="tablist" aria-label="Frame review mode">
            {reviewTabs.map((tab) => (
              <button
                id={`design-studio-tab-${tab.id}`}
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`design-studio-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >{tab.label}</button>
            ))}
          </div>

          <div id={`design-studio-panel-${activeTab}`} className="design-studio__tab-panel" role="tabpanel" aria-labelledby={`design-studio-tab-${activeTab}`}>
            {activeTab === "static" ? <StaticReview frame={selectedFrame} /> : null}
            {activeTab === "motion" ? <MotionReview frame={selectedFrame} /> : null}
            {activeTab === "content" ? <ContentReview frame={selectedFrame} cookbook={manifest.cookbook} /> : null}
          </div>
        </section>

        <section className="design-studio__preview" aria-labelledby="preview-title">
          <header><div><span>Real-app preview</span><h3 id="preview-title">{viewport.label}</h3></div><strong>{motion === "on" ? "Motion on" : "Motion off"}</strong></header>
          <div className="design-studio__preview-canvas" data-viewport={viewport.id}>
            <iframe
              key={previewKey}
              src={previewUrl}
              title={`KOA ${lang} public home preview at ${viewport.label}`}
              style={{ width: viewport.width, height: viewport.height }}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

function StaticReview({ frame }: { frame: CinematicFrame }) {
  return <div className="design-studio__review-grid"><FeatureList title="Foreground" items={frame.foreground} /><FeatureList title="Background" items={frame.background} /><FeatureList title="Settled composition" items={frame.staticFeatures} /></div>;
}

function MotionReview({ frame }: { frame: CinematicFrame }) {
  const tunables = Object.entries(frame.tunables);
  return (
    <div className="design-studio__motion-review">
      <FeatureList title="Authored motion" items={frame.motionFeatures} />
      <FeatureList title={`Motion off · ${frame.motionOff.summary}`} items={frame.motionOff.result} />
      <div className="design-studio__tunables">
        <h4>Safe tunables</h4>
        {tunables.length ? tunables.map(([name, tunable]) => (
          <article key={name}>
            <header><strong>{humanize(name)}</strong><span>{tunable.value} {tunable.unit}</span></header>
            <meter min={tunable.min} max={tunable.max} value={tunable.value}>{tunable.value}</meter>
            <p>{tunable.description}</p>
            <small>Safe range {tunable.min}–{tunable.max} {tunable.unit} · reference weight {tunable.referenceWeight}</small>
          </article>
        )) : <p>No motion tunables are documented for this frame.</p>}
      </div>
    </div>
  );
}

function ContentReview({ frame, cookbook }: { frame: CinematicFrame; cookbook: string }) {
  return (
    <div className="design-studio__content-review">
      <div><h4>Story purpose</h4><p>{frame.why}</p></div>
      <div><h4>Locale coverage</h4><p>{frame.locales.join(" · ")}</p></div>
      <FeatureList title="Evidence references" items={frame.evidence} />
      <p className="design-studio__cookbook">Long-form choreography stays in <code>{cookbook}</code>.</p>
    </div>
  );
}

function FeatureList({ title, items }: { title: string; items: string[] }) {
  return <div className="design-studio__feature-list"><h4>{title}</h4>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No authored features are recorded.</p>}</div>;
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="design-studio__control-group"><span>{label}</span>{children}</div>;
}

function StudioState({ title, detail, children }: { title: string; detail: string; children?: React.ReactNode }) {
  return <section className="design-studio design-studio__state" role="alert"><p className="eyebrow">Design Studio unavailable</p><h2>{title}</h2><p>{detail}</p>{children}</section>;
}

function formatProgress(progress: number) {
  return `${Math.round(progress * 100)}%`;
}

function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}
