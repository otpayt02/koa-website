"use client";

import { useEffect } from "react";

const SELECTOR = "main > section, main article, main .card, main .page-hero__content, main .section-heading, main form";

export function ContentRevealSystem() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    nodes.forEach((node, index) => {
      node.dataset.contentReveal = ["rise", "sweep", "focus", "drift"][index % 4];
      if (reduced) node.dataset.revealed = "true";
    });
    if (reduced) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return null;
}
