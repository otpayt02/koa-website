"use client";

import { FormEvent, useState } from "react";
import type { Lang } from "./i18n";

type DonationResult = { checkoutUrl: string | null; notice: string };

export function DonationForm({ lang }: { lang: Lang }) {
  const [amount, setAmount] = useState(50);
  const [recurring, setRecurring] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true); setStatus(null);
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(amount * 100), donorEmail: form.get("email"), donorName: form.get("name") || undefined,
          anonymous: false, frequency: recurring ? "monthly" : "one_time", purpose: "General support",
        }),
      });
      const result = await response.json() as DonationResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to prepare secure checkout.");
      if (result.checkoutUrl) { window.location.assign(result.checkoutUrl); return; }
      setStatus(result.notice);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to prepare secure checkout.");
    } finally { setSubmitting(false); }
  }

  return (
    <form className="donation-card" onSubmit={submit}>
      <p className="eyebrow">{lang === "ksw" ? "မၤစၢၤတၢ်မၤ" : "Sustain the work"}</p>
      <h2>{lang === "ksw" ? "နတၢ်ဟ့ၣ်မၤစၢၤပှၤတဝၢ။" : "Your gift stays with community."}</h2>
      <div className="amount-grid" aria-label="Donation amount">
        {[25, 50, 100, 250].map((value) => <button key={value} type="button" aria-pressed={amount === value} onClick={() => setAmount(value)}>${value}</button>)}
      </div>
      <label className="field"><span>Amount (USD)</span><input name="amount" type="number" min="5" step="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required /></label>
      <label className="toggle-row"><input name="recurring" type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} /><span>{recurring ? "Monthly gift" : "One-time gift"}</span></label>
      <label className="field"><span>Name (optional)</span><input name="name" autoComplete="name" /></label>
      <label className="field"><span>Email for receipt</span><input name="email" type="email" autoComplete="email" required /></label>
      <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? "Preparing checkout…" : `${lang === "ksw" ? "ဟ့ၣ်မၤစၢၤ" : "Donate"} $${amount}${recurring ? "/month" : ""}`}</button>
      <p className="donation-card__wallet-note">Google Pay can appear in the secure checkout when KOA&apos;s configured payment provider and the donor&apos;s device support it.</p>
      {status ? <p className="donation-card__status" role="status">{status}</p> : null}
      <small>Secure processing is completed by KOA&apos;s payment provider. A tax receipt is issued only after a confirmed payment.</small>
    </form>
  );
}
