# mintresearch.org

The MINT Research Lab website (https://mintresearch.org/).

## Architecture — read this before editing

**Primary site pages are hand-edited static HTML served from `public/`.** Astro remains
the packaging tool for generated reports, discontinued newsletter archives, and
the legacy RTS routes under `src/pages/`.

The primary pages were converted from Astro in commit `c35aea3` (2026-03-30) so
the Minty post-processor could update them directly. The infrastructure guide
and 404 page completed that conversion in July 2026. Their former active Astro
routes were removed, and hashed shared asset bundles remain in `public/_astro/`.

**What this means in practice:**

- The source of truth for page content is `public/*.html` (each page sits at `public/<page>/index.html`).
- `npm run build` copies primary pages unchanged and builds only the remaining
  report, archive, and RTS sources under `src/pages/`.
- Edits go directly into the served HTML. To re-apply the Minty overlay after edits, run `python3 scripts/inject_minty.py`.
- The homepage People section is loaded at runtime from `public/assets/people/latest-people.csv`.
- The homepage Papers list is loaded at runtime from `public/assets/papers/latest-paper-deliverables.csv`.
- Volatile infrastructure facts in `public/guide/index.html` bind to
  `public/assets/minty/infra-snapshot.json`. Minty's deterministic
  `guide-updater` owns and publishes that snapshot; do not hand-edit generated
  counts or the daemon inventory.
- The `chatbot-worker/` and `paper-map/` subprojects retain their own build steps (see their READMEs).

## Shared site contracts

The canonical primary-navigation hierarchy and renderer now live in
`public/assets/mint-site-nav.v1.js`. This is deliberately primary navigation,
not a literal copy of `sitemap.xml`: report pages and newsletter issues remain
discoverable through their index pages without occupying primary navigation.
The homepage section is consistently named `Papers`.

All main-site static pages load this renderer into a marked navigation
mount. Their existing HTML remains as a no-JavaScript fallback, but the shared
contract replaces it at runtime, so labels, ordering, active state, and new
top-level destinations come from one source:

```text
public/index.html
public/agent-reports/index.html
public/corpus-map/index.html
public/cv/index.html
public/data-dash/index.html
public/guide/index.html
public/newsletter/index.html
public/governing-with-agents/index.html
public/ai-culture/index.html
```

Generated newsletter and report pages retain `src/data/navigation.ts` and
`src/components/Sidebar.astro` only for their build-time fallback; the layout
loads the same runtime contract. New external paper sites should use the
versioned public renderer instead of copying either source. See
`docs/shared-site-contracts.md` for the API, fallback markup, injected-paper
workflow, and versioning policy.

The shared main-site theme is light-first. Each consumer declares
`data-theme="light"` on its `<html>` element, then uses a blocking head script
to remove that attribute only when `mint-theme=dark` was explicitly stored.
`public/assets/theme.js` owns the toggle and persistence. Keep the root default
and head bootstrap together; `npm run check:theme` tests both first-load states.

Public microsites share the main site's navigation hierarchy and typography
roles, but not every microsite shares the full runtime theme. The presentation
routes below use the shared main-site shell. The externally hosted Blind Refusal
site keeps its paper theme self-contained in `mint-philosophy/b-r-minisite`, but
loads the banner-only contract and banner images from this repository.
Across both implementations, use JetBrains Mono for structural UI, headings,
labels, legends, and metadata, and Newsreader for sustained prose.

The canonical masthead implementation is `public/assets/mint-banner.css` plus
`public/assets/mint-banner.js`. It accepts an empty `.top-banner` mount, creates
the logo and all eight Minties, owns complete responsive wrapping, and publishes
the measured `--banner-h`. Main-site pages and presentation shells load those
assets directly; external microsites may do the same but must not import the
full main-site theme. Host pages own only placement, surface styling, and
sidebar offsets. See `docs/shared-site-contracts.md` for the visible
no-JavaScript fallback and ownership boundary.

Run `npm run check:contracts` for the banner, navigation, and infrastructure
contracts. The command
`npm run check:banner -- --check-blind-refusal` additionally inspects the
deployed Blind Refusal source.

`Microsites` is a collapsible sidebar branch. It stays collapsed away from a
microsite, opens automatically for the active microsite, and can be toggled as
an accessible button. Its public leaves are currently:

- `Governing with Agents` — `/governing-with-agents/`
- `AI (etc) in Culture` — `/ai-culture/`
- `Blind Refusal` — `https://blindrefusal.mintresearch.org/`
- `Can Machines Reason Morally?` — `/lab-overview/`
- `Evaluating LLM Normative Competence` — `/nc/`
- `The AGI-Ready Policy Student` — `/FDC`
- `Navigating the AGI Reckoning` — `/navigating/`
- `Incoherent Values?` — `https://coherence.mintresearch.org/`

Only add maintained, public, indexable project microsites. Do not expose
private or deliberately unlisted surfaces such as `/proofeditor/`, `/camps/`,
`/coquelin/`, the legacy direct FDC deck files, or the access-gated review
service.

The former `/agent-reports/` index is retained as an unlinked archival route;
it is not part of primary navigation or the sitemap.

## Curated collections

`/governing-with-agents/` is a source-linked gallery of AI projects supporting
public information, participation, law, administration, evaluation, and
institutional experimentation. `/ai-culture/` is a source-linked bibliography
of books, television, and film. Both use the shared collection layer under
`public/assets/collections/` and submit moderated additions through the existing
website form endpoint. See `docs/curating-ai-culture.md` for the separate
editorial-note workflow.

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
public/navigating/index.html   -> public/navigating/deck.html
```

`/navigating/` uses the same shell and responsive fitting contract and is listed
under `Microsites` in the primary navigation and sitemap.

`/should-we-build-agi/` is a deliberately unlisted, `noindex` presentation.
Its deck loads an inline text editor from `public/should-we-build-agi/inline-editor.js`.
The editing controls appear only when the separate Cloudflare Worker confirms
the request's edge-observed IP against the secret allowlist; every save is
checked again server-side. Authorized browsers default to a small pencil control
above the deck footer. It expands to Edit/Save/Cancel/Hide controls and remembers
the user's compact or expanded preference locally. Saved plain-text
overrides live in Workers KV and are applied with `textContent` before Pretext
measures the slide. The tracked HTML remains the failure-safe source: if the
Worker is unavailable, the base deck renders normally and the controls stay
hidden. Worker code, tests, deployment configuration, and the exact-IP caveat
live in `agi-editor-worker/`. The client uses the custom domain first, with the
Worker's `workers.dev` address and a second custom domain as DNS fallbacks.

The two AGI Governance Fellowship teaching decks also have deliberately
unlisted canonical subdomains. `agif1.mintresearch.org` serves the existing
interactive `/should-we-build-agi/` deck, while `agif2.mintresearch.org` serves
Fable's native 35-slide HTML/Pretext Day 2 deck under
`public/agi-institutions/`. Day 2 excludes its private source notes from the
public payload and uses the same responsive reflow approach as Day 1.
`agif-router-worker/` maps both exact hosts to their static paths and adds an
HTTP `X-Robots-Tag`; both HTML sources also carry full `noindex` directives.
Neither hostname nor backing route belongs in navigation or the sitemap. Run
`npm run check:agif-presentations` and `npm --prefix agif-router-worker test`
before publishing either deck or changing the routing Worker.

For the four shell-backed presentations listed above, keep deck code isolated
inside its iframe so deck-specific keyboard controls, scaling, styles, and
animations cannot conflict with the site shell. Their deck sources remain
`noindex`; only their branded wrapper routes are canonical and indexable. The
shell now exposes empty banner and navigation mounts; the shared
assets populate both. Do not reintroduce a navigation array, Minty image list,
or banner measurement in `presentation-shell.js`. `npm run check:contracts`
verifies the canonical contract and every served integration mount.

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
prevents a stale subframe from surviving a deployment. The shared banner
contract measures the banner while the shell reserves the measured status-bar
height, rather than estimating either part of the available frame. Run
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
  index.html           # homepage (hand-edited; People and Papers runtime mounts)
  <page>/index.html    # other top-level pages (cv, newsletter, corpus-map, ...)
  camps/               # Summer Camps for Kids Who Aren't Sporty (passphrase-gated
                       #   SPA + camps.json dataset; a weekly Claude Routine pushes
                       #   data-only updates here — see camps/camps-hub.js header)
  coquelin/            # private house tracker (GitHub-token unlock; its state JSON
                       #   lives in the mint-website repo so saves don't redeploy)
  assets/people/       # People CSV, runtime loader, and team headshots
  assets/cv/           # Minty costume sprites — referenced from multiple pages
  _astro/              # frozen Astro asset bundles from the last build
src/
  pages/               # generated reports, old newsletter issues, and RTS routes
  pages-archive/       # archived original .astro sources (not built)
  data/people.ts       # archived people data (not used at runtime)
scripts/
  inject_minty.py      # post-processes public/*.html to add the Minty overlay
chatbot-worker/        # Cloudflare Worker for the Minty chatbot
```

## Updating homepage People

The homepage Team, Affiliates, and Alumni grids are generated in the browser from:

```text
public/assets/people/latest-people.csv
```

Like the Papers section, People uses a Notion database as its source of truth.
The CSV in this repository is the deployment copy consumed by the website:
make people and ordering changes in Notion first, then export the People database
view and replace the site CSV. Do not maintain a separate people list in
`public/index.html`.

The website includes rows where `Site: Public?` is `Yes` and `Site: Section` is
`Team`, `Affiliate`, or `Alumni`. Each section is sorted numerically by
`Site: Sort Order`.

The visible cards and Team detail panel use the `Site:` columns for role,
discipline, affiliation, bio, and up to three labelled links. A value of `??`
is treated as missing rather than shown publicly.

For a Team headshot:

1. Prefer a valid URL or root-relative path in `Site: headshot link`.
2. Otherwise, the loader tries `/assets/people/<Site: id>.jpg`.
3. If that image is unavailable, the existing initials fallback is shown.

To update People:

1. Update the Notion People database, then export its site-facing view as CSV.
2. Replace `public/assets/people/latest-people.csv`.
3. Run `npm run check:people`.
4. Verify locally by serving `public/` (`python3 -m http.server -d public 8090`) and clicking several Team cards.

No People markup or embedded JSON in `public/index.html` needs to be edited.

## Updating homepage Papers

The homepage Papers section is generated in the browser from:

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
6. Refresh the local preview and check the homepage Papers section.

The Notion updater fetches page details sequentially and retries if Notion returns a rate-limit response, using Notion's `Retry-After` header before continuing.

CSV fallback update flow:

1. Export the papers-only Notion view as CSV.
2. Import the export with `npm run import:papers -- <path-to-notion-export.csv>`.
   - In Windows PowerShell, use `npm.cmd run import:papers -- <path-to-notion-export.csv>` if script execution policy blocks `npm`.
3. Confirm public visible rows have the intended link fields. Codenames are maintained in Notion for paper artefacts and stability checks, and should use short kebab-case when present, e.g. `blind-refusal`. If future duplicates occur, use `paper-name`, then `paper-name-2`.
4. Verify locally by serving `public/` (`python3 -m http.server -d public 8090`) and checking the homepage Papers section.

The import script blocks duplicate non-empty codenames, or changed codenames for papers already known to the current site CSV. The loader ignores placeholder links such as `no github` and `no post yet`. If `Site: Alt Source` is populated, the Papers section shows it as an `Alt source` link immediately after `View paper`. Create `public/assets/papers/<codename>/` folders only when a paper has artefacts that need to be served from the site.
