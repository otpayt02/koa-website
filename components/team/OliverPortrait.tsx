"use client";

import { useState } from "react";

const REFERENCE_IMAGE = "/koa/assets/team/oliver-payton-college-headshot.jpg";

type PortraitResponse = {
  image?: string;
  error?: string;
};

export function OliverPortrait() {
  const [portrait, setPortrait] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generatePortrait() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/team/oliver-portrait", { method: "POST" });
      const result = (await response.json()) as PortraitResponse;
      if (!response.ok || !result.image) {
        throw new Error(result.error ?? "Portrait generation failed.");
      }
      setPortrait(result.image);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Portrait generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <figure className="oliver-portrait">
      {/* The supplied college headshot remains the fallback until an admin generates and approves a portrait. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="oliver-portrait__image"
        src={portrait ?? REFERENCE_IMAGE}
        alt={portrait ? "AI-generated full-body portrait of Oliver Payton" : "College headshot of Oliver Payton"}
      />
      <figcaption className="oliver-portrait__caption">
        <strong>Oliver Payton</strong>
        <span>IT Manager / Web Lead</span>
        {portrait ? <small>AI-generated portrait based on a supplied reference photo; approval required before publication.</small> : null}
        <button className="button button--secondary" type="button" onClick={generatePortrait} disabled={isGenerating}>
          {isGenerating ? "Generating portrait…" : "Generate team portrait"}
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </figcaption>
    </figure>
  );
}
