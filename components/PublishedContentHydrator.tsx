"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Lang } from "@/components/i18n";
import { generatedContentBindings } from "@/content/catalog";
import type { PublishedContent } from "@/lib/content";

export function PublishedContentHydrator({ lang, published }: { lang: Lang; published: PublishedContent }) {
  const pathname = usePathname();

  useEffect(() => {
    const route = pathname.replace(/^\/(en|karen)(?=\/|$)/, "") || "/";
    const bindings = generatedContentBindings.filter((binding) => routeMatches(binding.route, route));
    if (!bindings.length) return;

    let applying = false;
    let activeValues = published;
    const apply = () => {
      if (applying) return;
      applying = true;
      try {
        const root = document.querySelector("#main-content")?.parentElement ?? document.body;
        const textNodes = collectTextNodes(root);
        for (const binding of bindings) {
          const base = lang === "karen" ? binding.karen || binding.en : binding.en;
          const replacement = activeValues[binding.key];
          if (!replacement || replacement === base) continue;
          if (binding.kind === "text") {
            const currentPublished = published[binding.key];
            const matches = textNodes.filter((node) => {
              const value = normalize(node.textContent);
              return value === base || Boolean(currentPublished && value === currentPublished);
            });
            const target = matches[binding.occurrence[lang]];
            if (target) target.textContent = preserveOuterWhitespace(target.textContent ?? "", replacement);
          } else if (binding.attribute) {
            const matches = Array.from(root.querySelectorAll<HTMLElement>(`[${binding.attribute}]`)).filter((element) => normalize(element.getAttribute(binding.attribute)) === base);
            matches[binding.occurrence[lang]]?.setAttribute(binding.attribute, replacement);
          }
        }
      } finally {
        applying = false;
      }
    };

    const receivePreview = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const message = event.data as { type?: string; values?: Record<string, string> };
      if (message?.type !== "koa-translation-preview" || !message.values) return;
      activeValues = { ...published, ...message.values };
      apply();
    };

    apply();
    const observer = new MutationObserver(() => window.requestAnimationFrame(apply));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("message", receivePreview);
    return () => {
      observer.disconnect();
      window.removeEventListener("message", receivePreview);
    };
  }, [lang, pathname, published]);

  return null;
}

function collectTextNodes(root: Element): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, [data-no-content-hydration], .translation-studio")) return NodeFilter.FILTER_REJECT;
      return normalize(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

function routeMatches(bindingRoute: string, route: string): boolean {
  if (bindingRoute === "*") return true;
  const pattern = bindingRoute.replaceAll(/\[[^\]]+\]/g, "[^/]+");
  return new RegExp(`^${pattern}$`).test(route);
}

function normalize(value: string | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function preserveOuterWhitespace(original: string, replacement: string): string {
  return `${original.match(/^\s*/)?.[0] ?? ""}${replacement}${original.match(/\s*$/)?.[0] ?? ""}`;
}
