# mintresearch.org

The MINT Research Lab website (https://mintresearch.org/).

## Architecture — read this before editing

**This site is no longer built by Astro.** It is hand-edited static HTML served from `public/`.

It started as an Astro project, but in commit `c35aea3` (2026-03-30, "Deploy floating Minty overlay across all pages") all six pages were converted to static HTML so a Python post-processor (`scripts/inject_minty.py`) could inject the walking Minty sprite + reflowing text into every page. The original `.astro` sources were moved to `src/pages-archive/` and are no longer part of the build. Hashed Astro asset bundles are persisted in `public/_astro/`.

**What this means in practice:**

- The source of truth for page content is `public/*.html` (each page sits at `public/<page>/index.html`).
- `npm run build` will *not* regenerate the homepage — `src/pages/` no longer contains it.
- Edits go directly into the served HTML. To re-apply the Minty overlay after edits, run `python3 scripts/inject_minty.py`.
- The team data array is embedded in `public/index.html` as `<script id="personData" type="application/json">[...]</script>`. Edit that JSON to add/change people.
- The `chatbot-worker/` and `paper-map/` subprojects retain their own build steps (see their READMEs).

## Asset directories — do not delete without checking the rendered HTML

`public/assets/people/` and `public/assets/cv/` are referenced from the served `public/*.html` files (the people detail panel uses `/assets/people/*.jpg`; the floating Minty avatars use `/assets/cv/*.png`).

**A `src/`-tree grep for these paths will return nothing**, because the references live in the static HTML, not in any `.astro` source file. Past cleanup commits (`0d7a203`) deleted these directories on the assumption they were unused; they were not. If you're considering removing assets, search `public/` directly:

```bash
grep -rE '/assets/(people|cv)/' public/
```

## Layout

```
public/                # served as-is (static HTML + assets)
  index.html           # homepage (hand-edited; people grid + detail panel)
  <page>/index.html    # other top-level pages (cv, newsletter, corpus-map, ...)
  assets/people/       # team headshots — referenced from public/index.html
  assets/cv/           # Minty costume sprites — referenced from multiple pages
  _astro/              # frozen Astro asset bundles from the last build
src/
  pages-archive/       # archived original .astro sources (not built)
  data/people.ts       # archived people data (not used at runtime)
scripts/
  inject_minty.py      # post-processes public/*.html to add the Minty overlay
chatbot-worker/        # Cloudflare Worker for the Minty chatbot
```

## Adding a new team member

1. Add their photo to `public/assets/people/<firstname-lastname>.jpg` (consistent kebab-case naming).
2. In `public/index.html`, find the `<script id="personData" ...>` JSON array and add an object:
   ```json
   {"name":"...","role":"...","disc":"...","affiliation":"...","bio":"...","headshot":"/assets/people/<firstname-lastname>.jpg"}
   ```
   Set `"headshot":null` if no photo is available — the panel will fall back to initials.
3. Verify locally by serving `public/` (`python3 -m http.server -d public 8090`) and clicking the person in the team grid.
