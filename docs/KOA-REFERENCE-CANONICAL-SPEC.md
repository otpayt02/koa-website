# KOA release reference — canonical implementation specification

## Authority

The visual and motion source of truth is `koa-sites-release/dist/koa.html`, SHA-256 `4401840E3FB69B584E076657C4245B9B6DF11A8B662D10F689D7544D34627460`. It is a reference artifact; the production implementation remains the React/Vinext route `app/[lang]/page.tsx` → `components/CinematicLanding.tsx`.

When an older KOA design note conflicts with this document, this document controls the active cinematic behavior. Existing content, the authentic seal, localized routes, semantic markup, and payment/publication approval boundaries remain unchanged.

## Canonical glyph engine

The reference uses one canvas engine with two observable roles. The active app keeps those roles split into `KarenGlyphField` (background atmosphere) and `KAGlyphField` (the identity arrival), while preserving the same physical rules.

| Rule | Canonical value | Active implementation |
| --- | --- | --- |
| Desktop / mobile arrival count | 150 / 60 glyphs | `KAGlyphField` uses the same caps. |
| Glyph repertoire | `KOAKAREကAKOကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇` | The arrival field uses this exact source set. |
| Arrival target | Pixel-sampled K and A only | Private offscreen masks create targets; no K/A outline, path, or solid face is mounted. |
| Seal rule | Seal is the only O | `SealAssembly` stays at the formation center. |
| Formation physics | Spring stiffness `.045–.095`; alpha settles toward `.66`, otherwise `.30` | `KAGlyphField` applies the source ranges every rAF frame. |
| Cursor response | Settled arrival glyphs make room inside 130px, with a maximum 8.5px force | `KAGlyphField` uses the same radius and force. |
| Arrival transform | Anchor `42% → 18%`; scale `1 → 1.16`; edge scatter | Derived directly from normalized scroll progress. |
| Ambient glyphs | Low-alpha, depth-varied drift with pointer parallax and scroll streaks | Background field remains behind content and never receives a shared target. |
| Glyph rain | Four columns on small screens / seven on desktop; variable 4–14 glyph strings; 1.4–4.2s life | Background field supplies intermittent, source-style columns without DOM nodes. |

## Scroll choreography

The reference’s home sequence is a 220vh arrival followed by a 560vh sticky chapter film. The active route preserves that continuous take in one 620svh desktop / 520svh narrow sticky runway, avoiding a blank handoff while retaining the source’s normalized state boundaries and native scroll behavior.

| Normalized arrival progress | Canonical state |
| --- | --- |
| `0.00–0.10` | Seal holds at the heart of the composition; glyph engine wakes. |
| `0.10–0.32` | K/A spring out from the seal and settle. |
| `0.32–0.46` | Formed K/A holds at the seal line and answers the cursor. |
| `0.46–0.76` | Seal and glyph K/A rise together from 42% to 18% of the viewport; the mark grows by 16%. |
| `0.50+` | Title, charter, and the approved voice cycle become readable. |
| `0.74–0.98` | K/A particles disperse toward independent edge destinations and glyph rain strengthens. |
| `0.98–1.00` | Editorial story takes over. |

The active route does not impose magnetic snapping or intercept wheel/touch input. `prefers-reduced-motion` and the local Motion control resolve to a complete static seal, K/A, charter, and accessible content state.

## Visual and responsive rules

- Use deep ink, warm gold, paper, Cormorant Garamond display type, Space Grotesk body type, and Noto Sans Myanmar for glyph rendering.
- Canvas layers never capture pointer events. Foreground text, links, header, and footer remain above motion layers.
- Use opacity, transforms, blur, and canvas drawing for motion. Do not animate layout on every frame.
- Header state is driven by normal scrolling. Its narrow layout keeps the language navigation and menu readable without pill controls.
- Editorial chapters use deliberate media/copy alternation, a restrained focus-pull entrance, and a readable central measure. The rejected `story-community-original.png` asset remains retired.
- Service/card replacement changes one occupied location at a time, with a fade/blur transition and reduced-motion static fallback.

## Verification required for a canonical pass

1. Inspect hero at start, assembly, hold, rise, scatter, and reverse-scroll.
2. Check desktop and a narrow mobile viewport; verify 150/60 arrival caps from source.
3. Hover the K/A formation and confirm the 130px give-space response without violent scattering.
4. Confirm ambient glyphs stay distributed behind foreground content and have no shared central target.
5. Run focused motion contracts, `npm.cmd run build`, and a fresh local browser check before any publication claim.
