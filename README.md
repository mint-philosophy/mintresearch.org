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

## Sidebar navigation and public microsites

The served sidebar is duplicated in these seven static files:

```text
public/index.html
public/agent-reports/index.html
public/corpus-map/index.html
public/cv/index.html
public/data-dash/index.html
public/guide/index.html
public/newsletter/index.html
```

Generated newsletter and report pages use `src/data/navigation.ts` and
`src/components/Sidebar.astro`. Keep the static copies and generated-page
navigation synchronized whenever the sidebar changes.

Public microsites share the main site's navigation hierarchy and typography
roles, but not every microsite shares the full runtime theme. The presentation
routes below use the shared main-site shell. The externally hosted Blind Refusal
site keeps its paper theme self-contained in `mint-philosophy/b-r-minisite`, but
loads the banner-only contract and banner images from this repository.
Across both implementations, use JetBrains Mono for structural UI, headings,
labels, legends, and metadata, and Newsreader for sustained prose.

The canonical masthead implementation is `public/assets/mint-banner.css` plus
`public/assets/mint-banner.js`. `theme.css` imports its geometry and `theme.js`
loads its markup/asset contract for every main-site banner. External microsites
may load those two files directly, but must not import the full main-site theme.
Do not duplicate banner dimensions or image lists in a microsite. The shared
ownership boundary prevents the oversized-banner regression without blocking
deployment. `npm run check:banner` is available as an optional local diagnostic;
add `-- --check-blind-refusal` to inspect the current Blind Refusal `main` branch.

`Microsites` is a non-clickable, always-expanded sidebar branch. Its public
leaves are currently:

- `Blind Refusal` — `https://blindrefusal.mintresearch.org/`
- `Can Machines Reason Morally?` — `/lab-overview/`
- `Evaluating LLM Normative Competence` — `/nc/`
- `The AGI-Ready Policy Student` — `/FDC`

Only add maintained, public, indexable project microsites. Do not expose
private or deliberately unlisted surfaces such as `/proofeditor/`, `/camps/`,
`/coquelin/`, the legacy direct FDC deck files, or the access-gated review
service.

## Presentation microsites

The public presentation routes `/lab-overview/`, `/nc/`, and `/FDC` use the
shared shell in `public/assets/presentation-shell.css` and
`public/assets/presentation-shell.js`. The shell renders the standard MINT
banner, sidebar, status line, mobile navigation, and theme control around each
self-contained deck. Its presentation-mode control hides or restores all site
chrome without modifying the deck itself.

The canonical wrappers and their isolated deck sources are:

```text
public/lab-overview/index.html -> public/lab-overview/deck.html
public/nc/index.html           -> public/nc/deck.html
public/FDC.html                -> public/FDC-deck.html
```

Keep deck code isolated inside its iframe so deck-specific keyboard controls,
scaling, styles, and animations cannot conflict with the site shell. The deck
sources remain `noindex`; only the branded wrapper routes are canonical and
indexable. When the Microsites branch changes, update the seven static
sidebars, `src/data/navigation.ts`, and the shared presentation-shell
navigation together.

`public/FDC-deck.html` uses a bounded browser-native search for the largest scale
at which each slide is fully contained. The rendered postcondition
keeps every rendered text-node edge inside the actual iframe slide plane and
reserves a six-pixel safety inset at the right and bottom clipping boundaries.
The slide uses a top-left CSS transform because WebKit reports inconsistent
geometry for CSS `zoom`; the deliberately enlarged layout wrapper is excluded
from containment checks because it compensates for the visual scale. Candidate
text is measured before transformation and projected into the frame, so the
search never depends on Safari's transformed-range geometry. Rectangle reads
force synchronous layout, avoiding Safari stalls on animation frames while a
candidate temporarily uses compensated dimensions. The compensated slide child
cannot flex-shrink, so inverse dimensions survive until the final transform.
The branded shell's banner, sidebar, status line, toolbar, padding,
and borders therefore reduce the type scale even when the outer display remains
large. An unframed `2560x1080` presentation is the authored `1.0` reference; at
each framed size the search begins at that authored `1.0` type scale and shrinks
only when rendered text crosses an actual slide edge. The former `24px` body and
`14px` label floors are readability diagnostics rather than hard limits, because
a fixed minimum font size cannot guarantee containment in a smaller frame.
Fitting runs at every iframe width, including responsive tablet and phone
layouts. If containment fails at the safety minimum, the slide restores its
responsive source layout and readable scrolling instead of hiding text.

Only the visible slide is measured. Navigation fits synchronously before paint;
viewport changes close any tooltip and refit on the next animation frame. The
parent shell observes the iframe element and sends same-origin resize notices,
so presentation-mode and sidebar transitions also refit against the final frame.
The deck fits once immediately, again when web fonts become ready, and after
later font-loading events. Candidate measurement suppresses overflow so temporary
compensated dimensions do not create scrollbars and recursively fire iframe
resize events. Hidden tooltip copy is excluded. The versioned iframe URL
prevents a stale subframe from surviving a deployment. The shell measures both
banner and status-bar height instead of estimating the available frame. Run
`npm run check:fdc-fit` for the source-contract checks; final acceptance must
inspect all ten slides and both shell states in Safari because transformed text
geometry is engine-dependent.

`/FDC-AI.html` is a separate private presentation. Its public artifact contains
only an AES-256-GCM encrypted payload generated by
`scripts/encrypt_static_page.mjs`; the plaintext source lives at
`minty-private/Thread-Contexts/mint-website-maintenance/private-assets/FDC-AI-source.html`.
The passphrase is stored in macOS Keychain as
`minty-vault-FDC_AI_PASSWORD`. Regenerate the encrypted artifact with:

```sh
STATIC_PAGE_PASSWORD="$(security find-generic-password -s minty-vault-FDC_AI_PASSWORD -w)" \
  node scripts/encrypt_static_page.mjs \
  --input ../../minty-private/Thread-Contexts/mint-website-maintenance/private-assets/FDC-AI-source.html \
  --output public/FDC-AI.html \
  --title "Mapping the MPP Core Pitches"
```

Never copy the plaintext source back into `public/`. This gate protects the
current endpoint, but the deck existed in this public repository's history
before encryption and must not be treated as never-published confidential
material.

## Newsletter archive

The public newsletter landing page is `public/newsletter/index.html`. YinAI
issues live under `public/newsletters/yinai/<YYYY-MM-DD>/`; each issue directory
contains its aggregate index and any full-report child pages. The archive
currently begins with the 13 July 2026 Deep Edition, the earliest YinAI issue
stored locally. Add each future issue to that directory structure and add a
dated archive link under `#back-issues` on the landing page. Do not relabel the
older `src/pages/newsletters/*-weekly.md` files as YinAI: those sixteen files
are the discontinued `Minty's Week in AI` product.

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
  camps/               # Summer Camps for Kids Who Aren't Sporty (passphrase-gated
                       #   SPA + camps.json dataset; a weekly Claude Routine pushes
                       #   data-only updates here — see camps/camps-hub.js header)
  coquelin/            # private house tracker (GitHub-token unlock; its state JSON
                       #   lives in the mint-website repo so saves don't redeploy)
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
