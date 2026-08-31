# KOA Website — Budget Meeting Prep

**Meeting Date:** August 31, 2026  
**Prepared by:** Oliver P (IT Manager / Web Lead)  
**Purpose:** Present the website concept, budget requirements, and implementation roadmap to secure funding approval

---

## 1. Executive Summary (2-Minute Pitch)

**What we're building:**  
A bilingual (S'gaw Karen / English) nonprofit website that serves as the national hub for the Karen community in America. It's not just a website — it's a living monument to the Karen people, a community-driven platform for language preservation, cultural connection, and AI-powered language learning.

**Why it matters:**  
- The Karen community lacks centralized digital resources for language, culture, and community connection
- No existing platform offers bilingual Karen/English dictionary, translation services, or AI language learning
- This positions KOA as the national leader in Karen community services

**What we need:**  
- Annual budget for domain, hosting, email, security, and AI subscriptions
- Approval to proceed with phased implementation
- Commitment from team members for content contribution and moderation

**Timeline:**  
- Phase 1 (Foundation): 2 weeks — bilingual shell, design system, database
- Phase 2 (Dictionary & Community): 3 weeks — the heart of the platform
- Phase 3 (Translation Services): 2 weeks — interpreter directory, court partnerships
- Phase 4 (Community & Donations): 2 weeks — contribution features, donation portal
- Phase 5 (AI Training): 3 weeks — audio collection, language model development
- Phase 6 (Polish & Launch): 2 weeks — SEO, accessibility, security audit

**Total build time:** 14 weeks from funding approval to public launch

---

## 2. Concept Overview (What You'll See)

### Visual Experience
The site opens with a **cinematic scroll experience** — a monument to the Karen people. The KOA seal arrives with animated glyphs converging from all four edges of the viewport. As users scroll, chapters unfold: the Karen story, the mission, the invitation to belong.

**Design principles:**
- Premium, cinematic, editorial (Awwwards-experimental quality)
- Warmth over coldness — human, proud, inviting, never corporate
- Every section ends with an invitation to join, contribute, or return
- Mobile-first, accessible (WCAG 2.1 AA), fast-loading

### Navigation Structure
The navigation is a collapsible banner with 10 tabs split left and right of the center logo:

**Left tabs:** Home, Community, Dictionary, Programs, Contribute  
**Right tabs:** Events, Translation, Culture, History, Beta (coming soon)

Each tab page opens with a **glyph convergence header** — half the screen shows small glyphs converging to form the Burmese numeral of that section (01, 02, 03...), the other half shows the section description. High-contrast typography against background images. Smooth animations and transitions, but not as cinematic as the hero page.

### Core Features

**1. Community Dictionary (the heart)**  
- Searchable bilingual Karen/English dictionary
- Community-uploaded definitions, translations, synonyms, antonyms
- Audio pronunciation for each entry
- Moderated review queue (contributors → reviewers → approved)
- Multiple translation variants per word (contextual, dialectal)
- Edit history with full attribution

**2. Translation & Interpretation Services**  
- Approved translator/interpreter directory
- Document translation (Karen ↔ English)
- In-person, phone, and video interpretation
- Court interpretation partnership (addressing the national Karen interpreter shortage)
- Free for community members, sliding scale for organizations

**3. Community Audio & AI Training**  
- Community members record Karen speech
- Audio paired with transcriptions creates training data
- Trains speech-to-text, text-to-speech, and Karen language models
- Goal: 100+ hours of validated audio for initial model training
- Inspired by Mozilla Common Voice's community collection model

**4. Donation Portal**  
- One-time and recurring donations
- Tax-deductible (501(c)(3) nonprofit)
- Optional donor attribution (anonymous donations allowed)
- Transparent donation logging
- Integration with payment processor (Stripe, PayPal, or similar)

**5. Community Contribution**  
- Feature requests (what services they want)
- Service suggestions (what KOA should provide)
- Collaboration requests (partnerships)
- Username registration and verification tiers
- Contributor profiles with badges and attribution

---

## 3. Non-Negotiables for the Meeting

These are the **must-haves** that cannot be compromised:

### Technical Non-Negotiables
1. **Bilingual architecture** — Every page must render in both English and S'gaw Karen. This is not optional; it's core to the mission.
2. **Community dictionary with moderation** — The dictionary is the heart of the platform. It must have community uploads, review queues, and audio pronunciation.
3. **Donation portal** — The site must be able to accept tax-deductible donations. This is how we sustain the organization.
4. **Mobile-first, accessible design** — WCAG 2.1 AA compliance. Many community members access the internet primarily via mobile.
5. **Audio upload and AI training pipeline** — This is what makes KOA a national leader, not just another nonprofit website.
6. **Full observability and logging** — Every change, decision, and contribution must be tracked. This is legal protection and educational value.

### Budget Non-Negotiables
1. **Domain name** — koaamerica.org or similar (approximately $15-50/year)
2. **Hosting** — Vercel, Cloudflare, or similar (free tier possible initially, but budget for growth)
3. **Email hosting** — Professional email (info@koaamerica.org, contact@koaamerica.org)
4. **AI subscriptions** — API costs for language model training and inference (this is the core innovation)
5. **Database** — Managed database for dictionary, audio, user data (cannot use free tier long-term)
6. **Security** — SSL certificates, backup system, security audit (non-negotiable for nonprofit)

### Team Non-Negotiables
1. **Content contributors** — Team members must provide bios, program descriptions, community stories
2. **Moderation team** — At least 2-3 people committed to reviewing dictionary submissions
3. **Translation reviewers** — Approved translators/interpreters who will review dictionary entries
4. **Oliver as technical lead** — Must have authority to make technical decisions without committee approval for every detail

---

## 4. Budget Breakdown

### Year 1 Budget (Conservative Estimate)

| Category | Item | Monthly | Annual | Notes |
|----------|------|---------|--------|-------|
| **Domain & Hosting** | | | | |
| Domain | koaamerica.org or similar | $2-4 | $15-50 | Namecheap, Cloudflare, or similar |
| Hosting | Vercel Pro or Cloudflare | $0-20 | $0-240 | Free tier possible initially |
| CDN | Cloudflare (free tier) | $0 | $0 | Included with hosting |
| **Email & Communication** | | | | |
| Email hosting | Google Workspace or Zoho | $0-6 | $0-72 | Zoho free tier for up to 5 users |
| Email marketing | Mailchimp or similar | $0-20 | $0-240 | Free tier up to 500 subscribers |
| **Database & Storage** | | | | |
| Database | Supabase, Neon, or PlanetScale | $0-25 | $0-300 | Free tier possible initially |
| File storage | Cloudflare R2 or Backblaze B2 | $0-5 | $0-60 | For audio files, images |
| Backup service | Backblaze B2 or similar | $0-5 | $0-60 | Daily database backups |
| **AI & Development** | | | | |
| AI API subscriptions | OpenAI, Anthropic, or similar | $50-200 | $600-2400 | For language model training |
| GPU compute (training) | RunPod, Lambda Labs, or similar | $0-100 | $0-1200 | Only when training models |
| Code repository | GitHub (free for nonprofits) | $0 | $0 | Free for 501(c)(3) |
| **Security & Compliance** | | | | |
| SSL certificate | Let's Encrypt (free) | $0 | $0 | Free, auto-renewed |
| Security monitoring | Cloudflare (free tier) | $0 | $0 | Basic DDoS protection |
| Privacy compliance | Cookie consent, GDPR/CCPA | $0 | $0 | Built into site |
| **Design & Content** | | | | |
| Stock photos | Unsplash, Pexels (free) | $0 | $0 | Free stock photography |
| Icon library | Lucide, Heroicons (free) | $0 | $0 | Open-source icons |
| Fonts | Google Fonts (free) | $0 | $0 | Including Noto Serif Myanmar |
| **Total (Conservative)** | | **$77-385** | **$675-4,582** | |
| **Total (Recommended)** | | **$200-500** | **$2,400-6,000** | For proper scaling |

### Year 2+ Budget (After Launch)
- Hosting scales with traffic: $20-100/month
- Database scales with data: $25-100/month
- AI API costs scale with usage: $100-500/month
- Email marketing scales with subscribers: $20-100/month
- **Estimated Year 2:** $3,000-8,000/year

### One-Time Costs
- Domain registration: $15-50 (annual)
- Initial security audit: $0-500 (can be done by Oliver)
- Logo/brand design: $0 (already done)
- Content photography: $0-500 (community contributions)

### Cost-Saving Strategies
1. **GitHub for Nonprofits** — Free GitHub Team for verified nonprofits
2. **Google for Nonprofits** — Free Google Workspace for verified nonprofits
3. **Cloudflare for Nonprofits** — Free Pro plan for verified nonprofits
4. **Open-source tools** — Next.js, React, Drizzle ORM are all free
5. **Community contributions** — Dictionary content, audio, translations are volunteer-driven
6. **Phased scaling** — Start with free tiers, upgrade as traffic grows

---

## 5. Questions to Ask in the Meeting

### Strategic Questions
1. **What is KOA's 5-year vision for this website?** Is it a static informational site, or a living platform that grows with the community?
2. **Are we committed to being the national leader in Karen digital resources?** That requires investment in AI and language technology.
3. **What's our risk tolerance?** Do we start small and scale, or do we build the full vision from day one?
4. **Who is our primary audience?** Karen community members in the US, or also international Karen communities?
5. **What's our relationship with other Karen organizations?** Are we coordinating or competing?

### Budget Questions
6. **Do we have 501(c)(3) status?** This affects our ability to receive tax-deductible donations and access nonprofit pricing.
7. **What's our current fundraising capacity?** Can we support ongoing operational costs, or do we need to fundraise specifically for tech?
8. **Are there grants available for language preservation or digital infrastructure?** We should apply for them.
9. **What's our backup plan if costs exceed projections?** Do we have a contingency fund?
10. **Who has financial authority to approve recurring expenses?** We need a clear decision-maker.

### Content & Team Questions
11. **Who is responsible for providing content?** Bios, program descriptions, community stories — these don't write themselves.
12. **Do we have committed translators/interpreters?** The dictionary needs reviewers, not just contributors.
13. **Who will moderate the community?** Dictionary submissions, audio uploads, feature requests — all need moderation.
14. **What's our content approval workflow?** Who decides what gets published?
15. **Are team members willing to undergo verification?** The verification tier system requires team buy-in.

### Technical Questions
16. **Who has access to the technical infrastructure?** We need to document access and have a backup plan if Oliver is unavailable.
17. **What's our disaster recovery plan?** If the database is corrupted or the site is taken down, how quickly can we recover?
18. **How do we handle sensitive data?** Audio recordings, personal information, donation records — all have legal implications.
19. **What's our policy on data ownership?** Who owns dictionary entries? Who owns audio recordings?
20. **Are we committed to open-source?** The code could be open-sourced to attract contributors, but that's a philosophical decision.

---

## 6. Anticipated Obstacles & Responses

### Obstacle 1: "This is too expensive."
**Response:**  
- The conservative budget is $675-4,582/year — less than many nonprofits spend on a single event
- We start with free tiers and scale as traffic grows
- The AI training costs are the core innovation — without them, we're just another website
- We can apply for grants specifically for language preservation and digital infrastructure
- **Key point:** The cost of not building this is remaining invisible in the digital age

### Obstacle 2: "We don't have the team to support this."
**Response:**  
- The phased approach spreads the workload over 14 weeks
- Oliver is committed as technical lead and has already built the foundation
- The community contribution features are designed to distribute the workload
- We need 2-3 committed moderators and 3-5 approved translators/interpreters
- **Key point:** We don't need a large team; we need a committed team

### Obstacle 3: "What if we build it and nobody uses it?"
**Response:**  
- The dictionary is designed to be community-driven — the community creates the content
- The AI training pipeline requires community audio contributions — built-in engagement
- The donation portal and translation services provide ongoing value
- We'll have SEO, social media, and community outreach to drive adoption
- **Key point:** The site is designed to be useful, not just informational

### Obstacle 4: "Why do we need AI? Can't we just use Google Translate?"
**Response:**  
- Google Translate doesn't support Karen (S'gaw)
- Existing translation tools are inadequate for a low-resource language
- The AI training pipeline is what makes KOA a national leader
- The dictionary + audio + AI combination is unique — no other organization is doing this
- **Key point:** This is the difference between being a follower and being a leader

### Obstacle 5: "Who will maintain this long-term?"
**Response:**  
- The site is built with open-source tools (Next.js, React) — not proprietary
- The code is documented and version-controlled
- Oliver is committed as technical lead, but we'll document everything for handoff
- The phased approach ensures we don't build more than we can maintain
- **Key point:** We're building for sustainability, not just launch

### Obstacle 6: "What about security? What if we get hacked?"
**Response:**  
- The site uses industry-standard security (SSL, rate limiting, content moderation)
- We'll use Cloudflare for DDoS protection (free for nonprofits)
- All data is backed up daily
- We'll conduct a security audit before launch
- **Key point:** Security is a non-negotiable, and it's budgeted for

### Obstacle 7: "We need to see a prototype before we commit."
**Response:**  
- The cinematic hero section is already built and can be demonstrated
- The navigation banner is built and functional
- The design system is in place
- We can show the working prototype at the next meeting
- **Key point:** We're not asking for commitment to the full vision — just to Phase 1

### Obstacle 8: "What's the ROI? How does this help KOA?"
**Response:**  
- Positions KOA as the national leader in Karen community services
- Provides a platform for fundraising (donation portal)
- Attracts grants for language preservation and AI development
- Creates a centralized hub for the Karen community nationwide
- Provides translation services that can generate revenue (sliding scale for organizations)
- **Key point:** This is an investment in KOA's future, not just a website

### Obstacle 9: "Why can't we just use WordPress or Wix?"
**Response:**  
- WordPress/Wix can't support the bilingual architecture, AI training pipeline, or community moderation system
- We need custom features: dictionary with audio, interpreter directory, donation logging, audit trails
- The cinematic design quality is not achievable with templates
- We're building a platform, not a brochure
- **Key point:** The complexity of the features requires custom development

### Obstacle 10: "What if Oliver gets hit by a bus?"
**Response:**  
- All code is documented and version-controlled
- The tech stack is industry-standard (Next.js, React, TypeScript)
- We'll document all access credentials and procedures
- We'll train at least one other team member on the technical infrastructure
- **Key point:** We're building for resilience, not just for one person

---

## 7. Donation Strategy (Subtle but Effective)

### Design Principles
- **Never annoying** — no pop-ups, no aggressive CTAs
- **Always present** — subtle buttons in header, footer, and relevant sections
- **Easy to say yes** — clear value proposition, transparent about where money goes
- **Multiple entry points** — header, footer, sidebar, inline with content

### Implementation

**Header (always visible)**  
- Small "Donate" button in the navigation banner (right side, near language toggle)
- Subtle styling — not the primary CTA, but always accessible
- On hover: "Support the Karen community" tooltip

**Footer (every page)**  
- "Support KOA's mission" section with donation button
- Brief text: "Your donation funds language preservation, community services, and AI development for the Karen community."
- Link to donation page with more details

**Relevant sections (contextual)**  
- Dictionary page: "Help us build the Karen dictionary. [Contribute] or [Donate to support this project]"
- AI landing page: "Support the development of the Karen language AI. [Donate]"
- Translation services: "Support our court interpretation partnership. [Donate]"
- Community page: "Help us serve the Karen community. [Volunteer] or [Donate]"

**Donation page**  
- Clear breakdown of where money goes:
  - 40% — Language preservation (dictionary, audio collection, AI training)
  - 30% — Community services (translation, interpretation, events)
  - 20% — Technology infrastructure (hosting, database, AI subscriptions)
  - 10% — Operations (administrative costs)
- One-time and recurring donation options
- Optional donor attribution
- Tax receipt information

**Coming soon banner**  
- At the top of every page: "We're building something special. [Join the beta] or [Support our mission]"
- Subtle, not intrusive
- Links to beta signup and donation page

---

## 8. Design Direction Notes

### Typography
- **Primary font:** Manrope (clean, modern, highly readable)
- **Serif font:** Bodoni Moda (for headlines, cinematic feel)
- **Myanmar font:** Noto Serif Myanmar (for Karen script, excellent rendering)
- **Monospace:** JetBrains Mono (for code, technical content)

### Color Palette
- **Primary:** Deep navy (#0a1929) — trust, stability
- **Accent:** Karen red (#c41e3a) — energy, passion, cultural significance
- **Secondary:** Gold (#d4af37) — warmth, value, tradition
- **Neutral:** Warm grays (#f5f5f5 to #2a2a2a) — readability, contrast
- **Success:** Forest green (#2d6a4f) — growth, community

### Animation Philosophy
- **Hero page:** Full cinematic experience — scroll-driven, immersive, monument-like
- **Tab pages:** Smooth animations and transitions, but not as cinematic — functional beauty
- **Glyph convergence:** Each tab page opens with half the screen showing small glyphs converging to form the Burmese numeral (01, 02, 03...)
- **High contrast:** Typography against background images must be highly legible
- **Responsive:** Portrait and landscape considerations for glyph convergence

### Coming Soon Tab
- The 10th tab is "Beta" or "Coming Soon" — a different color (red accent)
- Links to the AI landing page and beta signup
- Prominent but not overwhelming
- Communicates: "We're building something special, join us early"

---

## 9. Next Steps (After Meeting)

### If Budget is Approved
1. **Week 1:** Purchase domain, set up hosting, configure email
2. **Week 1-2:** Implement Phase 1 (bilingual shell, design system, database)
3. **Week 2:** Set up GitHub for Nonprofits, apply for Google for Nonprofits
4. **Week 3:** Begin Phase 2 (dictionary, community features)
5. **Week 4:** Content collection push (bios, program descriptions, stories)
6. **Week 5-6:** Continue Phase 2, begin Phase 3 (translation services)
7. **Week 7-8:** Phase 4 (community, donations)
8. **Week 9-11:** Phase 5 (AI training pipeline)
9. **Week 12-13:** Phase 6 (polish, SEO, accessibility, security)
10. **Week 14:** Soft launch, gather feedback, iterate

### If Budget is Not Approved
1. **Document the decision** and the reasons
2. **Ask what would make it approvable** — lower cost? smaller scope? more team members?
3. **Propose a minimal viable version** — just the domain, hosting, and Phase 1
4. **Explore grant opportunities** — language preservation, digital infrastructure
5. **Revisit in 3 months** with updated proposal

---

## 10. Key Takeaways

1. **This is not just a website** — it's a platform for language preservation, community connection, and AI innovation
2. **The budget is reasonable** — $675-4,582/year conservative, $2,400-6,000/year recommended
3. **The timeline is realistic** — 14 weeks from funding to launch
4. **The team is committed** — Oliver as technical lead, with community contributions
5. **The impact is significant** — positions KOA as the national leader in Karen community services
6. **The risk is manageable** — phased approach, free tiers, cost-saving strategies
7. **The opportunity is time-sensitive** — no other organization is building this

**Final pitch:**  
We have a unique opportunity to build something that no other Karen organization has ever built — a living, bilingual, AI-powered platform that preserves the Karen language, connects the community, and positions KOA as the national leader. The budget is reasonable, the timeline is realistic, and the impact is significant. Let's build this together.

---

## Appendix A: Technical Stack (For Reference)

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5.9
- **Styling:** Tailwind CSS 4, custom CSS (cinematic animations)
- **Database:** Drizzle ORM (PostgreSQL or SQLite)
- **Hosting:** Vercel or Cloudflare
- **Email:** Google Workspace or Zoho
- **AI:** OpenAI API, Anthropic API, custom training pipeline
- **Storage:** Cloudflare R2 or Backblaze B2 (for audio files)
- **Security:** Let's Encrypt SSL, Cloudflare DDoS protection
- **Analytics:** Plausible or Fathom (privacy-focused)

## Appendix B: Competitor Analysis

- **No direct competitors** — no other Karen organization has a bilingual website with dictionary, AI, and community features
- **Indirect competitors:** Other ethnic nonprofit websites, language learning platforms (Duolingo, Rosetta Stone)
- **Our advantage:** Community-driven, culturally specific, AI-powered, bilingual

## Appendix C: Grant Opportunities

- **Language preservation grants** — Endangered Language Fund, Foundation for Endangered Languages
- **Digital infrastructure grants** — Knight Foundation, Ford Foundation
- **AI for social good grants** — Google.org, Microsoft Philanthropies
- **Community development grants** — Local community foundations, United Way

---

**End of Budget Meeting Prep**
