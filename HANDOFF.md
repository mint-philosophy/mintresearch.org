# HANDOFF.md -- mintresearch.org

## What This Repo Is

The MINT Research Lab website (mintresearch.org). This repo consolidates three previously separate GitHub repos -- mint-lab-guide, paper-map pipeline outputs, and mint-website -- into a single Astro-powered static site. The goal is one repo, one build system, one deployment.

The lab guide (an interactive reference for the lab's agentic systems, daemons, and research pipelines) is the most developed page. The landing page and full website (people, publications, events) are still early.

---

## Current State (as of 2026-03-04)

### What exists and works

- **Astro project scaffolding**: Fully configured with `astro.config.mjs`, TypeScript strict mode, build/dev/preview scripts. Astro 5.17.1.
- **Design system**: Fully extracted into `DESIGN_SYSTEM.md` (canonical spec) and implemented in `src/styles/global.css`. All CSS custom properties, component styles, and responsive breakpoints are in place.
- **Eight reusable Astro components**: `Sidebar`, `Section`, `Card`, `StatCard`, `RefTable`, `BleedLine`, `TerminalPicker` -- covering all the major UI patterns.
- **`BaseLayout.astro`**: Shared layout with Google Fonts loading, mobile menu, noise overlay, and all client-side JS (scroll tracking, card accordions, typing animation, etc.).
- **Landing page** (`src/pages/index.astro`): Fully built with hero, about, people (team/affiliates/alumni), publications, events, and news sections. Uses the design system and TerminalPicker component.
- **`guide.astro`**: Partial migration of the lab guide (sections 01-06 of ~12 total). See below.
- **Paper map**: Full pipeline output in `public/paper-map/` -- interactive DataMapPlot visualization, updated daily by the paper-map-updater daemon.
- **Build output**: `dist/` is generated and gitignored. Builds successfully with `npx astro build`.

### TerminalPicker component and deliverables data

The landing page uses `TerminalPicker` (see "Editing Content" below) to display:
- **Publications** (Section 03): 30 items -- peer-reviewed papers, books, preprints, affiliate work
- **Events** (Section 04): 15 items -- MINT-organised workshops, retreats, symposia only
- **News** (Section 05): 37 items -- keynotes, conference presentations, media, appointments, updates

All data lives in `src/data/deliverables.ts`. Source of truth for dates and entries: the Notion "MINT Lab Deliverables" database.

### What is in progress

- **Guide migration** (`src/pages/guide.astro`): 1,251 lines, covering sections 01-06:
  - Hero + full-width pipeline SVG diagram (sections "pipeline" and mobile fallback)
  - 01: What Is This?
  - 02: Content Pipeline (with expandable cards for each pipeline stage)
  - 03: Corpus Ingestion (10-stage pipeline vertical diagram with tooltips)
  - 04: The Corpus (stats, cluster visualization placeholder, 41-question grid)
  - 05: @Minty / Corpus Search (agent hierarchy, query flow)
  - 06: Minty Persona (persona documents, agent engineering details)
  - Ends with `<!-- PLACEHOLDER_SECTION_07_ONWARDS -->` -- remaining sections still need migrating

### Legacy files (to be removed)

- `website/` -- old mint-website content, now superseded by deliverables.ts + TerminalPicker
- `guide/` -- old lab guide prototypes (reference only)
- `_shared/`, `build.py`, `static/`, top-level `index.html` -- old build system

---

## Repo Structure

```
mintresearch.org/
|
|-- src/                          # Astro source (the new system)
|   |-- components/               # Reusable Astro components
|   |   |-- BleedLine.astro       # Full-width horizontal dashed line separator
|   |   |-- Card.astro            # Expandable accordion card (icon, title, sub, body)
|   |   |-- RefTable.astro        # Reference data table wrapper
|   |   |-- Section.astro         # Numbered section with L-bracket corner marks
|   |   |-- Sidebar.astro         # Fixed left nav with search trigger
|   |   |-- StatCard.astro        # Stat display (number + label)
|   |   |-- TerminalPicker.astro  # Paginated list (publications, events, news)
|   |-- layouts/
|   |   |-- BaseLayout.astro      # HTML shell, font loading, mobile menu
|   |-- data/
|   |   |-- stats.json            # Centralised stats (auto-updated by daemon + manual)
|   |   |-- navigation.ts         # Sidebar navigation config
|   |   |-- deliverables.ts       # Publications, events, news (source: Notion)
|   |-- pages/
|   |   |-- index.astro           # Landing page (placeholder)
|   |   |-- guide.astro           # Lab infrastructure guide
|   |   |-- corpus-map.astro      # Interactive corpus map (paper-map iframe)
|   |   |-- newsletter.astro      # Newsletter subscribe page
|   |   |-- test.astro            # Component test/demo page
|   |-- styles/
|       |-- global.css            # Full design system CSS
|
|-- public/                       # Served as-is by Astro (no processing)
|   |-- .nojekyll                 # Tells GitHub Pages not to use Jekyll
|   |-- CNAME                     # Custom domain: mintresearch.org
|   |-- favicon.ico               # Favicon (teal scanline Minty, multi-size ICO)
|   |-- favicon-32x32.png         # Favicon 32px PNG
|   |-- favicon-180x180.png       # Favicon 180px PNG
|   |-- favicon-192x192.png       # Favicon 192px PNG (Android/PWA)
|   |-- favicon-512x512.png       # Favicon 512px PNG (PWA/high-res)
|   |-- apple-touch-icon.png      # iOS home screen icon
|   |-- paper-map/                # Interactive paper map (DataMapPlot output)
|       |-- index.html            # Main visualization page
|       |-- data/                 # Corpus data for the map
|       |-- output/               # Generated map files
|       |-- *.py                  # Pipeline scripts (run externally by daemon)
|       |-- LOG.md                # Paper map pipeline log
|
|-- guide/                        # LEGACY: Original lab guide prototypes (reference only)
|   |-- index.html                # Old deployed guide (pre-Astro)
|   |-- prototype.html            # V1 prototype
|   |-- prototype-v2.html         # V2 prototype
|   |-- prototype-v3.html         # V3 prototype -- the SOURCE for Astro migration
|
|-- website/                      # LEGACY: Full website WIP (imported from mint-website repo)
|   |-- index.html                # Website landing page
|   |-- style.css                 # Website styles
|   |-- site-data.js              # People, publications, events data
|   |-- playground.html           # Experimental page
|   |-- assets/                   # Website images/assets
|   |-- README.md                 # Website readme
|   |-- TODO.md                   # Website todo list
|
|-- _shared/                      # LEGACY: Shared HTML partials for old build system
|   |-- nav.html                  # Navigation partial
|   |-- footer.html               # Footer partial
|
|-- static/                       # LEGACY: Static assets for old landing page
|   |-- css/                      # Old CSS files
|
|-- index.html                    # LEGACY: Old landing page (uses _shared/ partials + static/css/)
|-- build.py                      # LEGACY: Old build script (injects nav/footer into index.html)
|-- CNAME                         # Top-level CNAME (also in public/ for Astro builds)
|-- .nojekyll                     # Top-level .nojekyll
|
|-- dist/                         # BUILD OUTPUT (gitignored)
|-- node_modules/                 # Dependencies (gitignored)
|-- .astro/                       # Astro cache (gitignored)
|
|-- paper-map/                    # SYMLINK/COPY: Also at top level (legacy path)
|
|-- DESIGN_SYSTEM.md              # Canonical design system specification
|-- HANDOFF.md                    # This file
|-- astro.config.mjs              # Astro configuration
|-- package.json                  # Node dependencies (astro ^5.17.1 only)
|-- package-lock.json             # Lockfile
|-- tsconfig.json                 # TypeScript config (strict mode)
|-- .gitignore                    # Ignores dist/, .astro/, node_modules/, .env, __pycache__/
```

---

## Design System

Full spec in `DESIGN_SYSTEM.md`. Key rules:

### Color palette
- Dark backgrounds: `--bg-0` (#080d14) through `--bg-4` (#1e3050), darkest to lightest
- Body background: `--bg-1` (#0d1520)
- Primary accent: `--accent` (#2ec4b6) -- teal/mint
- Text: `--text-1` (#e8e4df) primary, `--text-2` (#8a9ab5) secondary, `--text-3` (#4a5a73) tertiary
- Category colors: cyan, indigo, purple, pink, teal, green, amber, yellow

### Typography
- **Headings**: Fraunces (serif, variable weight, optical sizing)
- **Body**: DM Sans (sans-serif)
- **Code/mono**: JetBrains Mono
- All loaded from Google Fonts in `BaseLayout.astro`

### Structural rules -- critical
- **ALL lines dashed** -- never solid for structural/decorative elements, never gradient/tapered. The sidebar right edge uses a repeating dashed linear-gradient for the same effect.
- **Hard right angles everywhere** -- `--radius: 0` and `--radius-sm: 0`. No border-radius on anything.
- **L-brackets**: Corner registration marks (top-left `::before`, bottom-right `::after`) appear on numbered sections only. Sections with `class="no-brackets"` suppress them. Hero sections suppress them.
- **Section number badges**: Square boxes (36x36px), centred horizontally, top-aligned with L-brackets (`margin-top: -52px`), dashed border, glow on hover. JetBrains Mono, 11px.
- **Grid backgrounds**: Repeating 24px grid lines at 0.04 opacity on technical containers (`.pipeline-wrap`, `.timeline-wrap`, `.ingest-pipeline`).
- **Noise overlay**: `body::after` applies a fractal noise SVG at 0.012 opacity, fixed-position, covering the viewport.

### Links
- Teal colored, no underline. On hover, an animated underline slides in from left (background-size transition on a 1px-tall linear-gradient).

---

## Astro Components

| Component | File | Props | Purpose |
|:---|:---|:---|:---|
| `BaseLayout` | `src/layouts/BaseLayout.astro` | `title: string`, `description?: string` | HTML document shell. Loads Google Fonts, imports `global.css`, renders mobile menu button and overlay, provides `<slot>` for page content. Includes SEO meta tags (og:title, og:description, og:image, twitter:card) and multi-format favicon links. Token counter formats as 1.0k after 999. |
| `Sidebar` | `src/components/Sidebar.astro` | `links: NavLink[]` where `NavLink = { href, label, mark, active? }` | Fixed left navigation. Renders MINT logo, search trigger (Cmd+K), and nav links with marker icons. Includes search overlay markup. |
| `Section` | `src/components/Section.astro` | `id: string`, `num?: string`, `noBrackets?: boolean` | Content section with optional numbered badge. Adds `fade-in` class for scroll animation. L-bracket corner marks via CSS `::before`/`::after`. Pass `noBrackets` to suppress brackets on unnumbered sections. |
| `Card` | `src/components/Card.astro` | `title: string`, `sub: string`, `iconBg: string`, `iconText: string`, `open?: boolean` | Expandable accordion card. Icon with colored background, title, subtitle, collapsible body via `<slot>`. `open` prop renders body visible by default. |
| `StatCard` | `src/components/StatCard.astro` | `num: string`, `label: string` | Metric display card. Large number in Fraunces + small uppercase label in JetBrains Mono. Hover lifts card with glow. |
| `RefTable` | `src/components/RefTable.astro` | None (slot only) | Wrapper `<table class="ref-table">` for reference data tables. Pass `<thead>` and `<tbody>` via the default slot. |
| `BleedLine` | `src/components/BleedLine.astro` | `heavy?: boolean` | Full-width horizontal dashed line that bleeds beyond the content column. `heavy` doubles the line width. |
| `TerminalPicker` | `src/components/TerminalPicker.astro` | `items: PickerItem[]`, `label?: string`, `pageSize?: number` | Paginated list inspired by Claude Code's question picker UI. Shows `pageSize` items per page (default 5), auto-sorted by date descending. Navigation: mousewheel, ←→ arrows, Tab/Shift+Tab, clickable progress bar. Click row to expand (blurb + "View source →" link). Enter expands keyboard-active row, Escape collapses. |

---

## Development

### Prerequisites
- Node.js >= 18 (currently v25.6.1 on this machine)
- npm (currently v11.9.0)

### Commands
```bash
# Install dependencies
cd /Users/seth/Active-Research/Local-Repos/mintresearch.org
npm install

# Run dev server (hot reload)
npx astro dev
# Dev URL: http://localhost:4321/mintresearch.org/

# Build for production
npx astro build
# Output: dist/

# Preview production build locally
npx astro preview
```

### Dev server URLs
- Landing page: http://localhost:4321/mintresearch.org/
- Lab guide: http://localhost:4321/mintresearch.org/guide/
- Component test: http://localhost:4321/mintresearch.org/test/
- Paper map: http://localhost:4321/mintresearch.org/paper-map/

---

## Deployment

- **Hosting**: GitHub Pages via the `mint-philosophy/mintresearch.org` repository
- **Custom domain**: mintresearch.org (configured via `CNAME` file in `public/`; DNS verification may still be pending)
- **Base path**: `/mintresearch.org` (set in `astro.config.mjs` -- required for GitHub Pages subdomain deployment at `mint-philosophy.github.io/mintresearch.org`)
- **Site URL**: `https://mint-philosophy.github.io` (set in `astro.config.mjs`)
- **Output mode**: Static (`output: 'static'`)
- **GitHub Pages files**: `public/.nojekyll` and `public/CNAME` are copied into `dist/` on build
- **No CI/CD yet**: Currently no GitHub Actions workflow. Builds are manual (`npx astro build`, then push `dist/` or configure Actions).

---

## External Dependencies

### Centralised Stats (`src/data/stats.json`)

**All quantitative claims on the site come from this one file.** Paper count, subscriber count, cluster breakdowns, discipline counts, year distribution — everything. Astro pages import it and use template expressions; nothing is hardcoded.

```astro
---
import stats from '../data/stats.json';
const fmt = (n) => n.toLocaleString();
const approx = (n) => '~' + (Math.round(n / 100) * 100).toLocaleString();
const c = stats.corpus;
---
<p>{approx(c.paperCount)} papers across {c.clusterCount} research areas</p>
```

**Auto-updated fields** (by paper-map-updater daemon from LanceDB): `corpus.*`, `clusters`, `disciplines`, `yearDistribution`. These update daily.

**Manually maintained fields**: `subscribers` (count + institutions), `persona` (word counts for agent documents). Update these by hand when they change.

**If you add a new stat to the site**, put it in `stats.json` and reference it — don't hardcode. If the stat comes from LanceDB, add it to `update_site_stats()` in the daemon.

### Paper Map Updater Daemon

The `paper-map-updater` daemon (in the Minty workspace at `daemons/paper-map-updater/`) pushes generated paper map files to `public/paper-map/` in this repo. The daemon:
- Runs the DataMapPlot pipeline to generate an interactive visualization of the research corpus
- Updates `src/data/stats.json` with current corpus stats from LanceDB
- Commits and pushes both to this repo
- Runs daily at 04:00 AEDT

**Do not restructure `public/paper-map/` or `src/data/stats.json` without updating the daemon's output paths.** The pipeline scripts inside `paper-map/` (the various `.py` files) are run externally by the daemon -- they are not part of the Astro build.

### Deliverables Data (`src/data/deliverables.ts`)

Source of truth for publications, events, and news on the landing page. 82 entries total, cross-referenced from the Notion "MINT Lab Deliverables" database.

**Type definition:**
```typescript
type PickerItem = {
  year: number;
  date?: string;     // MM/YYYY — required for all entries (auto-sort key)
  title: string;
  subtitle: string;  // authors (publications) or description (events/news)
  detail: string;    // venue (publications) or location/outlet (events/news)
  url?: string;      // verification link (DOI, arXiv, event page, article)
  tag?: NewsTag;     // news only: 'keynote' | 'conference' | 'media' | 'appointment' | 'update'
  blurb?: string;    // expanded content (abstract for papers, description for others)
};
```

**To add a new publication:**
```typescript
{
  year: 2026,
  date: '06/2026',
  title: 'Paper Title',
  subtitle: 'Author1, Author2',
  detail: 'Venue Name',
  url: 'https://doi.org/...',
  blurb: 'Abstract or brief description.',
},
```

**To add a new event** (MINT-organised only — keynotes/talks go under news):
```typescript
{
  year: 2026,
  date: '09/2026',
  title: 'Workshop Name',
  subtitle: 'Brief description',
  detail: 'Location',
  url: 'https://...',
  blurb: 'Longer description.',
},
```

**To add a news item:**
```typescript
{
  year: 2026,
  date: '03/2026',
  title: 'Item Title',
  subtitle: 'Brief description',
  detail: 'Source/Venue',
  url: 'https://...',
  tag: 'keynote',  // or 'conference', 'media', 'appointment', 'update'
  blurb: 'Longer description.',
},
```

**Tag meanings:**
- `keynote` — invited keynotes and named lectures
- `conference` — conference presentations, tutorials, posters, panels
- `media` — newspaper articles, podcasts, blog posts, op-eds
- `appointment` — fellowships, positions, lab moves (MATS, JHU, DeepMind, Knight, Carnegie, HKU)
- `update` — reports, contributions, participation (UNDP, ACOLA, summer schools)

**Sorting is automatic.** The TerminalPicker component sorts all items by date descending at build time. Add entries anywhere in the array — they'll end up in the right place. Every entry must have a `date` field in MM/YYYY format.

**Notion as source of truth.** When adding or correcting entries, cross-reference against the "MINT Lab Deliverables" Notion database for accurate dates and details.

---

## What Needs Doing Next

1. ~~Complete guide.astro migration~~ -- **DONE**. All 11 sections migrated including Daemons, Schedule, For Lab Members, Agent Engineering, Integrations, Subscribe, Footer.

2. ~~Add JavaScript interactivity~~ -- **DONE**. Search overlay, card accordions, fade-in observer, mobile menu, tooltips, tabs, timeline all working in BaseLayout.astro.

3. ~~Migrate landing page~~ -- **DONE** (2026-03-03). Landing page fully built with hero, about, people, publications, events, news.

4. ~~Migrate website content~~ -- **DONE** (2026-03-03). Publications, events, and news migrated to data-driven TerminalPicker components sourced from `deliverables.ts`. People section populated with team, affiliates, and alumni.

5. ~~Set up GitHub Actions~~ -- **DONE**. `.github/workflows/deploy.yml` builds on push to main.

6. ~~Remove legacy files~~ -- **DONE** (2026-03-03). Removed `website/`, `guide/`, `_shared/`, `build.py`, `static/`, root `index.html`.

7. ~~Custom domain DNS~~ -- **DONE**. CNAME configured for mintresearch.org.

8. ~~Minty squid mascot~~ -- **DONE**. Multiple mascot variants in `public/assets/` (8 colour variants + scan + cursor).

---

## Session Log

### 2026-03-04 (session 00cbff78)
- Planned swipe navigation + chevron indicators for TerminalPicker mobile UX (not yet implemented)
- Touch event handler design: 30px horizontal threshold, translateX visual feedback, chevron overlays visible on touch devices only
- Plan at `/Users/seth/.claude/plans/effervescent-spinning-babbage.md`

### 2026-03-04 (session d5fda4b0)
- Added Minty favicon (teal scanline variant, multi-size ICO + 5 PNGs). Removed old Astro rocket SVG.
- Built terminal-styled contact form section (#06) with Formsubmit.co backend and hash endpoint
- Added floating sunglasses Minty (minty-shades-scan.png) with transparent background and bob animation
- Added SEO meta tags to BaseLayout: og:title, og:description, og:image, twitter:card. Description prop with default.
- Changed seth@mint to lab@mint in index.astro and 404.astro terminal prompts
- Renamed sidebar "About the Lab" to "About MINT Lab" in navigation.ts
- Updated page title: "MINT Lab -- Machine Intelligence and Normative Theory"
- Formatted token counter: digits through 999, then 1.0k, 1.1k, etc.
- Updated BaseLayout.astro Props: now accepts optional `description` string
- 7 commits deployed (cb7c17b through 7458653)

### 2026-03-03 (session 16848276)
- Built TerminalPicker component (Claude Code question-picker inspired UI)
- Created `src/data/deliverables.ts` with 82 entries from Notion "MINT Lab Deliverables"
- Publications (30), Events (15), News (37) — all with verification links, blurbs, MM/YYYY dates
- Replaced hardcoded HTML in index.astro with three TerminalPicker instances
- Split Events & News into separate sections (03 Publications, 04 Events, 05 News)
- Updated navigation.ts with News section
- Features: paged navigation (mousewheel, keyboard, clickable progress bar), expand-on-click with abstracts, auto-sort by date

### 2026-03-02 (session 757cd632)
- Consolidated mint-lab-guide, paper-map, and mint-website repos into single Astro site
- Built design system, six components, partial guide migration
