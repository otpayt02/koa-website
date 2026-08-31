"use client";

import { useState } from "react";
import type { Lang } from "./i18n";

export function DonationForm({ lang }: { lang: Lang }) {
  const [amount, setAmount] = useState(50);
  const [recurring, setRecurring] = useState(false);
  return (
    <form className="donation-card" action="/api/donations" method="post">
      <p className="eyebrow">{lang === "ksw" ? "မၤစၢၤတၢ်မၤ" : "Sustain the work"}</p>
      <h2>{lang === "ksw" ? "နတၢ်ဟ့ၣ်မၤစၢၤပှၤတဝၢ။" : "Your gift stays with community."}</h2>
      <div className="amount-grid" aria-label="Donation amount">
        {[25, 50, 100, 250].map((value) => <button key={value} type="button" aria-pressed={amount === value} onClick={() => setAmount(value)}>${value}</button>)}
      </div>
      <label className="field"><span>Amount (USD)</span><input name="amount" type="number" min="5" step="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required /></label>
      <label className="toggle-row"><input name="recurring" type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} /><span>{recurring ? "Monthly gift" : "One-time gift"}</span></label>
      <label className="field"><span>Email for receipt</span><input name="email" type="email" required /></label>
      <button className="button button--primary" type="submit">{lang === "ksw" ? "ဟ့ၣ်မၤစၢၤ" : `Donate $${amount}${recurring ? "/month" : ""}`}</button>
      <small>Secure processing is completed by KOA&apos;s payment provider. Tax receipt eligibility is confirmed with your receipt.</small>
    </form>
  );
}
