# KOA — Purpose, Vision & Site Information Architecture

> Governing spec for the KOA (Karen Organization of America) website.
> Every design decision must be grounded in the organization's purpose and
> function in society. If a feature or section is unclear, resolve it against
> this document first.

## The purpose in one sentence

KOA is building a more accessible Karen community in America — a national
movement and a **complete hub** — humbly rivaling the giant non-profit
monopolizers — and doing it *with* the community, not just *for* them.

The site has two jobs:
1. **Tell the story** — who the S'gaw Karen people are, why they matter, and
   why to support them.
2. **Invite in** — communicate the vision, let people join the beta, help
   build the AI, and keep them coming back.

## The centerpiece: S'gaw-Mango

A bilingual ~15B-parameter Karen AI agent. It:
- **Teaches** S'gaw Karen — sentence breakdown, parts of speech, grammar
  rules, common phrases, sentence translation.
- **Dictionary** with web-crawl/scrape of the entire internet for real
  instances of any word (plus databases and texts).
- **OCR / vision** model data for Karen script.
- **Side-by-side text generation**: English ↔ Karen, and also **Thai** and
  **Burmese** (highly understood by S'gaw Karen speakers).

It is the emotional and technical heart of the movement. Present it as the
marquee "coming soon — join the beta" feature with an early-access email
signup.

## Information architecture (nav)

1. **Home** — the cinematic film: who the S'gaw Karen people are, the
   movement, the invitation to belong.
2. **S'gaw-Mango** *(marquee)* — the AI. Teaching + dictionary + OCR/vision +
   English↔Karen/Thai/Burmese text gen. "Coming soon — join the beta" +
   early-access email signup + how to help train it (voices, text, dictionary,
   document translations).
3. **The Mission** — history of the nonprofit, who the Karen people are, why
   to support them, making an accessible Karen community in America, plus the
   news hub.
4. **Community** — the invitation to co-build:
   - Verification tiers: verified admin → word-auditors → contributors.
   - Username registration (prepares people to contribute).
   - How to submit: voices, photos, AI text, document translations,
     never-translated-but-necessary word requests, recipes, music.
   - Newsletter / email signup (beta access, community training, dictionary,
     English↔Karen side-by-side).
   - Contact the people making it.
5. **Directory** — verified national registry:
   - Karen **churches** (address + pastor name).
   - Karen **businesses & restaurants**.
   - **Resources** across the entire United States.
6. **Music** — Karen music showcase: **thra eh keh lah** + Karen artists
   across the internet (links out to the founder's Karen music website).
7. **Events** — sepak takraw, volleyball, soccer tournaments; **cooking /
   recipes** — community-upvoted, top-upvoted dishes get featured on the
   front thumbnail.
8. **Podcast** — the KOA podcast: episodes, listen, subscribe.
9. **Contact** — contact form + submissions (church registry, business
   listing, recipe, word request).

> "Learn S'gaw Karen" is folded into **S'gaw-Mango**, not a separate nav slot.

## Now vs. coming-soon (scoping)

**Built as real content/sections now:**
- The premium cinematic editorial site itself.
- Music showcase (seeded with thra eh keh lah + artists).
- Directory (churches, businesses, resources) — seeded with real entries.
- Events (tournaments + recipes with upvote flow).
- History/news hub (The Mission).
- Email signup + coming-soon roadmap + contribution/verification explainer +
  username-registration explainer (the "front door" flows that capture the
  community).

**Presented as "coming soon / join the beta" (the backends that feed later):**
- The live S'gaw-Mango 15B agent.
- Real authentication / verification system.
- The internet word-instance crawler.
- The Karen OCR / vision model.

The signups and "join" flows are what feed those backends. The site's job
today is to communicate the vision and keep people invested.

## Design principles (grounded in purpose)

- **Premium, cinematic, editorial, Awwwards-experimental.** This is a
  monument to a people, not a brochure.
- **The message is sovereign.** Responsive behavior only where it *adds* to
  the message, never where it distracts from it.
- **Warmth over coldness.** This is a community of real people and a founder
  building a national movement with joy. The tone should feel human, proud,
  and inviting — never corporate.
- **Everything is an invitation.** Each section should end in a way that pulls
  the reader toward joining, contributing, or coming back.
- **Foundational, not decorative.** Layout, spacing, and hierarchy exist to
  make the story land, not to show off.

## Stakeholder note

The founder is building this as a national movement (hired/asked to by Eh Nay
Thaw, consulted weekly). This is deeply personal to them. Treat the site as a
keystone project and protect the purpose above aesthetics when the two
conflict.
