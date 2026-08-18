# ADR-0001: Bilingual Architecture via [lang] Route Segment

**Date:** 2026-08-09
**Status:** Accepted
**Decider:** Oliver P
**Context:**
The KOA website must serve both English and S'gaw Karen speakers. Every page must be available in both languages.

**Decision:**
Use Next.js App Router [lang] dynamic route segment to serve bilingual content. UI strings stored in messages/en.json and messages/karen.json. Content translations stored in the database as { en, karen } pairs per content block. A LanguageProvider context manages the active language with a header toggle that persists to cookie + localStorage.

**URL structure:** /en/services, /karen/services, /en/lexicon, /karen/lexicon, etc.

**Consequences:**
- (+) Clean, SEO-friendly URL structure with per-language pages.
- (+) Supports hreflang tags for search engines.
- (+) Each language version is independently crawlable and indexable.
- (+) Content translations are DB-backed.
- (-) Requires duplicating route structure under [lang].
- (-) Must keep messages/ files in sync across languages.
- (-) Karen Unicode font must be loaded and tested across browsers.

**Alternatives considered:**
- Query param (?lang=karen): simpler but worse for SEO and sharing.
- Subdomain (karen.koa.org): strong SEO but complex DNS and SSL setup.
- Client-side only toggle: fast to build but not crawlable for Karen content.
