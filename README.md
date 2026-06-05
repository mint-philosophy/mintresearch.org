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
- The homepage Papers/Publications list is loaded at runtime from `public/assets/papers/latest-paper-deliverables.csv`.
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

## Updating homepage Papers

The homepage Papers/Publications section is generated in the browser from:

```text
public/assets/papers/latest-paper-deliverables.csv
```

This CSV should be exported from the Notion papers-only database view. The website filters rows where both `Site: in Papers Section?` and `Site: Public?` are `Yes`, then sorts by `Date (D/M/Y)` newest-to-oldest.

Preferred Notion API update flow:

1. Create a local `.env` file in the repo root. Do not commit it; it should be ignored by .gitignore.
2. Add the Notion credentials:
   ```text
   NOTION_API_KEY=your_notion_secret
   NOTION_PAPERS_VIEW_ID=your_notion_view_id
   ```
3. Run `npm run update:papers:notion`.
   - In Windows PowerShell, use `npm.cmd run update:papers:notion` if script execution policy blocks `npm`.
4. Review the listed additions, removals, and changed rows.
5. Type `y` to update `public/assets/papers/latest-paper-deliverables.csv`, or `n` to cancel without changing the site CSV.
6. Refresh the local preview and check the homepage Papers/Publications section.

The Notion updater fetches page details sequentially and retries if Notion returns a rate-limit response, using Notion's `Retry-After` header before continuing.

CSV fallback update flow:

1. Export the papers-only Notion view as CSV.
2. Import the export with `npm run import:papers -- <path-to-notion-export.csv>`.
   - In Windows PowerShell, use `npm.cmd run import:papers -- <path-to-notion-export.csv>` if script execution policy blocks `npm`.
3. Confirm public visible rows have the intended link fields. Codenames are maintained in Notion for paper artefacts and stability checks, and should use short kebab-case when present, e.g. `blind-refusal`. If future duplicates occur, use `paper-name`, then `paper-name-2`.
4. Verify locally by serving `public/` (`python3 -m http.server -d public 8090`) and checking the homepage Papers/Publications section.

The import script blocks duplicate non-empty codenames, or changed codenames for papers already known to the current site CSV. The loader ignores placeholder links such as `no github` and `no post yet`. If `Site: Alt Source` is populated, the Papers section shows it as an `Alt source` link immediately after `View paper`. Create `public/assets/papers/<codename>/` folders only when a paper has artefacts that need to be served from the site.
