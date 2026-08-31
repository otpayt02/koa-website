# KOA home copy

The editable source for the homepage words lives in [`content/koa-home-copy.json`](../content/koa-home-copy.json). Edit that file when changing the landing message, navigation labels, chapter headings, links, image alt text, or the three downstream section titles.

## Shape

- `en` is the English source catalog.
- `ksw` is the S'gaw Karen presentation used by the `/ksw` route.
- `tabs` controls the compact story/navigation vocabulary.
- `intro` is revealed only after the pinned KOA seal/K/A assembly reaches its readable state.
- `chapters` controls the image/copy story scenes after the intro. Keep the order `02`, `03`, `04` so the Burmese chapter transition remains chronological.
- `sections` supplies the purpose, language, and community headings below the cinematic film.

Use `/{lang}` in links. The React page replaces that token with the active locale, so a copy edit does not require JSX changes. Keep copy short enough for the narrow reading corridor and provide meaningful `imageAlt` text for every documentary image.

After editing, run:

```powershell
cd C:\Users\olive\Projects\koa-website
npm.cmd run build
```

Then check `/en` and `/ksw` at the intro start, mid-scrub, and final lockup before publishing a hosted Sites version.
