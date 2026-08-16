"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import type { Messages } from "./i18n";

export function AsyncForm({ endpoint, messages, children, className = "form-card", successMessage }: { endpoint: string; messages: Messages; children: ReactNode; className?: string; successMessage?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error("Request failed");
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form className={className} onSubmit={submit}>
      {children}
      <button className="button button--primary" type="submit" disabled={state === "sending"}>{state === "sending" ? messages.sending : messages.submit}</button>
      <p className={`form-status form-status--${state}`} aria-live="polite">{state === "success" ? successMessage ?? messages.success : state === "error" ? messages.error : ""}</p>
    </form>
  );
}
