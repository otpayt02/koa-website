"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Lang } from "@/components/i18n";
import { generatedContentBindings } from "@/content/catalog";
import type { PublishedContent } from "@/lib/content";

export function PublishedContentHydrator({ lang, published }: { lang: Lang; published: PublishedContent }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!Object.keys(published).length) return;
    const route = pathname.replace(/^\/(en|karen)(?=\/|$)/, "") || "/";
    const bindings = generatedContentBindings.filter((binding) => routeMatches(binding.route, route) && published[binding.key]);
    if (!bindings.length) return;

    let applying = false;
    const apply = () => {
      if (applying) return;
      applying = true;
      try {
        const root = document.querySelector("#main-content")?.parentElement ?? document.body;
        const textNodes = collectTextNodes(root);
        for (const binding of bindings) {
          const base = lang === "karen" ? binding.karen || binding.en : binding.en;
          const replacement = published[binding.key];
          if (!replacement || replacement === base) continue;
          if (binding.kind === "text") {
            const matches = textNodes.filter((node) => normalize(node.textContent) === base);
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

    apply();
    const observer = new MutationObserver(() => window.requestAnimationFrame(apply));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
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
