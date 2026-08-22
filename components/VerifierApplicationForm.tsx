"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Messages } from "./i18n";

// Verifier application with dialect profile. Pronunciation varies by region
// and refugee camp, so we ask where the applicant grew up and where they
// learned Karen. On approval this context attaches to their account and to
// every entry they review.
export function VerifierApplicationForm({ messages }: { messages: Messages }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error" | "auth" | "conflict">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    try {
      const response = await fetch("/api/verifier-applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.status === 401) { setState("auth"); return; }
      if (response.status === 409) {
        const body = await response.json().catch(() => null);
        setMessage(body?.error ?? "You already applied.");
        setState("conflict");
        return;
      }
      if (!response.ok) throw new Error("Request failed");
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-intro">
        <p className="eyebrow">Become a community verifier</p>
        <h2>Your voice carries a place.</h2>
        <p>Karen is spoken differently across camps, cities, and states. Tell us where your Karen comes from — it becomes part of every word you approve.</p>
      </div>
      <div className="form-grid">
        <label className="field" htmlFor="verapp-name"><span>Full name</span><input id="verapp-name" name="displayName" required maxLength={120} /></label>
        <label className="field" htmlFor="verapp-email"><span>Email</span><input id="verapp-email" name="email" type="email" required maxLength={254} /></label>
        <label className="field" htmlFor="verapp-country"><span>Where did you grow up? (country)</span><input id="verapp-country" name="grewUpCountry" required maxLength={120} placeholder="e.g. Burma / Thailand / United States" /></label>
        <label className="field" htmlFor="verapp-region"><span>Region, camp, or town</span><input id="verapp-region" name="grewUpRegion" required maxLength={200} placeholder="e.g. Mae La camp, Hpa-An, St. Paul" /></label>
        <label className="field" htmlFor="verapp-placetype"><span>Where did you learn Karen?</span>
          <select id="verapp-placetype" name="learnedKarenPlaceType" required defaultValue="camp">
            <option value="camp">Refugee / border camp</option>
            <option value="city">City</option>
            <option value="state">State (e.g. Karen State)</option>
            <option value="province">Province / region in another country</option>
            <option value="other">Other / family home</option>
          </select>
        </label>
        <label className="field" htmlFor="verapp-place"><span>Name that place</span><input id="verapp-place" name="learnedKarenPlace" required maxLength={200} placeholder="e.g. Mae La camp, section 4" /></label>
        <label className="field" htmlFor="verapp-dialect"><span>Your Karen, in your own words (optional)</span><input id="verapp-dialect" name="dialectSelfNamed" maxLength={200} placeholder="e.g. S'gaw as spoken in Mergui-Tavoy" /></label>
      </div>
      <label className="field" htmlFor="verapp-motivation"><span>Why do you want to verify? (optional)</span>
        <textarea id="verapp-motivation" name="motivation" rows={4} maxLength={2000} placeholder="What you can contribute — dictionary entries, grammar rules, audio review…" />
      </label>
      <button className="button button--primary" type="submit" disabled={state === "sending"}>{state === "sending" ? messages.sending : "Apply to become a verifier"}</button>
      <p className={`form-status form-status--${state === "auth" || state === "conflict" ? "error" : state}`} aria-live="polite">
        {state === "success" ? "Application received — moderators will review it. You'll see your status when you sign in." :
         state === "auth" ? "Sign in with ChatGPT to apply." :
         state === "conflict" ? message :
         state === "error" ? messages.error : ""}
      </p>
    </form>
  );
}
