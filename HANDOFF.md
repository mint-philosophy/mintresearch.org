# HANDOFF.md -- mintresearch.org

## What This Repo Is

The MINT Research Lab website (mintresearch.org). This repo consolidates three previously separate GitHub repos -- mint-lab-guide, paper-map pipeline outputs, and mint-website -- into a single Astro-powered static site. The goal is one repo, one build system, one deployment.

The lab guide (an interactive reference for the lab's agentic systems, daemons, and research pipelines) is the most developed page. The landing page and full website (people, publications, events) are still early.

---

## Current State (as of 2026-03-02)

### What exists and works

- **Astro project scaffolding**: Fully configured with `astro.config.mjs`, TypeScript strict mode, build/dev/preview scripts. Astro 5.17.1.
- **Design system**: Fully extracted into `DESIGN_SYSTEM.md` (canonical spec) and implemented in `src/styles/global.css`. All CSS custom properties, component styles, and responsive breakpoints are in place.
- **Six reusable Astro components**: `Sidebar`, `Section`, `Card`, `StatCard`, `RefTable`, `BleedLine` -- covering all the major UI patterns from the prototype.
- **`BaseLayout.astro`**: Shared layout with Google Fonts loading (Fraunces, DM Sans, JetBrains Mono), mobile menu button, and noise overlay.
- **`test.astro`**: Component test page exercising all components. Accessible at `/mintresearch.org/test/`.
- **`guide.astro`**: Partial migration of the lab guide (sections 01-06 of ~12 total). See below.
- **Paper map**: Full pipeline output in `public/paper-map/` -- interactive DataMapPlot visualization, updated daily by the paper-map-updater daemon.
- **Build output**: `dist/` is generated and gitignored. Builds successfully with `npx astro build`.

### What is in progress

- **Guide migration** (`src/pages/guide.astro`): 1,251 lines, covering sections 01-06:
  - Hero + full-width pipeline SVG diagram (sections "pipeline" and mobile fallback)
  - 01: What Is This?
  - 02: Content Pipeline (with expandable cards for each pipeline stage)
  - 03: Corpus Ingestion (10-stage pipeline vertical diagram with tooltips)
  - 04: The Corpus (stats, cluster visualization placeholder, 41-question grid)
  - 05: @Minty / Corpus Search (agent hierarchy, query flow)
  - 06: Minty Persona (persona documents, agent engineering details)
  - Ends with `<!-- PLACEHOLDER_SECTION_07_ONWARDS -->` -- the following sections from `guide/prototype-v3.html` still need migrating:
    - Daemons (section id="daemons") -- daemon registry cards with health status
    - Schedule (section id="timeline") -- 24-hour timeline chart
    - For Lab Members (section id="guide") -- bots, Slack channels, usage instructions
    - Agent Engineering (section id="agents") -- CO hierarchy, deep review pipeline
    - Integrations (section id="integrations") -- Zotero, Google Drive, Notion, Gmail
    - Subscribe (section id="subscribe") -- email signup card
    - Footer

### What is still old static HTML

- **Landing page** (`src/pages/index.astro`): Placeholder "Site under construction" page with system-ui font. Not using the design system at all. The actual landing page content is in the legacy `index.html` (top-level) which uses Inter font and links to paper-map and lab guide.
- **Website content** (`website/`): Imported from mint-website repo. Contains `index.html`, `style.css`, `site-data.js`, `playground.html`, and `assets/`. Has people, publications, and events data but uses its own separate styling. Not integrated into Astro.

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
|   |-- layouts/
|   |   |-- BaseLayout.astro      # HTML shell, font loading, mobile menu
|   |-- pages/
|   |   |-- index.astro           # Landing page (placeholder)
|   |   |-- guide.astro           # Lab infrastructure guide (partial migration)
|   |   |-- test.astro            # Component test/demo page
|   |-- styles/
|       |-- global.css            # Full design system CSS (~908 lines)
|
|-- public/                       # Served as-is by Astro (no processing)
|   |-- .nojekyll                 # Tells GitHub Pages not to use Jekyll
|   |-- CNAME                     # Custom domain: mintresearch.org
|   |-- favicon.ico               # Favicon (ICO format)
|   |-- favicon.svg               # Favicon (SVG format)
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
| `BaseLayout` | `src/layouts/BaseLayout.astro` | `title: string` | HTML document shell. Loads Google Fonts, imports `global.css`, renders mobile menu button and overlay, provides `<slot>` for page content. |
| `Sidebar` | `src/components/Sidebar.astro` | `links: NavLink[]` where `NavLink = { href, label, mark, active? }` | Fixed left navigation. Renders MINT logo, search trigger (Cmd+K), and nav links with marker icons. Includes search overlay markup. |
| `Section` | `src/components/Section.astro` | `id: string`, `num?: string`, `noBrackets?: boolean` | Content section with optional numbered badge. Adds `fade-in` class for scroll animation. L-bracket corner marks via CSS `::before`/`::after`. Pass `noBrackets` to suppress brackets on unnumbered sections. |
| `Card` | `src/components/Card.astro` | `title: string`, `sub: string`, `iconBg: string`, `iconText: string`, `open?: boolean` | Expandable accordion card. Icon with colored background, title, subtitle, collapsible body via `<slot>`. `open` prop renders body visible by default. |
| `StatCard` | `src/components/StatCard.astro` | `num: string`, `label: string` | Metric display card. Large number in Fraunces + small uppercase label in JetBrains Mono. Hover lifts card with glow. |
| `RefTable` | `src/components/RefTable.astro` | None (slot only) | Wrapper `<table class="ref-table">` for reference data tables. Pass `<thead>` and `<tbody>` via the default slot. |
| `BleedLine` | `src/components/BleedLine.astro` | `heavy?: boolean` | Full-width horizontal dashed line that bleeds beyond the content column. `heavy` doubles the line width. |

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

### Paper Map Updater Daemon

The `paper-map-updater` daemon (in the Minty workspace at `daemons/paper-map-updater/`) pushes generated paper map files to `public/paper-map/` in this repo. The daemon:
- Runs the DataMapPlot pipeline to generate an interactive visualization of the research corpus
- Commits and pushes updated files directly to this repo's `public/paper-map/` directory
- Runs on a schedule (multiple times daily)

**Do not restructure `public/paper-map/` without updating the daemon's output paths.** The pipeline scripts inside `paper-map/` (the various `.py` files) are run externally by the daemon -- they are not part of the Astro build.

---

## What Needs Doing Next

1. **Complete guide.astro migration** -- Sections 07 onwards from `guide/prototype-v3.html` still need migrating to Astro components. Remaining sections:
   - Daemons (id="daemons") -- daemon registry cards with live health status indicators
   - Schedule (id="timeline") -- 24-hour timeline chart showing daemon run windows
   - For Lab Members (id="guide") -- bots accordion, Slack channels, usage instructions
   - Agent Engineering (id="agents") -- CO hierarchy diagram, deep review pipeline
   - Integrations (id="integrations") -- Zotero, Google Drive, Notion, Gmail integration details
   - Subscribe (id="subscribe") -- email signup card
   - Footer section

2. **Add JavaScript interactivity** -- The prototype has significant JS that has not been ported:
   - Search overlay (Cmd+K search across daemons, skills, commands, concepts)
   - Card accordion toggle (click to expand/collapse card bodies)
   - Fade-in intersection observer (sections animate in on scroll)
   - Mobile menu toggle (hamburger button opens sidebar overlay)
   - Ingest pipeline tooltips (hover on pipeline stages for details)
   - Pipeline SVG tooltips (hover on nodes for descriptions)
   - Tab switching
   - Accordion expand/collapse
   - Timeline chart rendering

3. **Migrate landing page** -- Replace the placeholder `src/pages/index.astro` with a proper landing page using the design system. Content source: top-level `index.html` (hero, cards linking to paper map and guide, footer).

4. **Migrate website content** -- Bring people, publications, and events from `website/` into Astro pages. This likely means creating `src/pages/people.astro`, `src/pages/publications.astro`, `src/pages/events.astro` (or similar), pulling data from `website/site-data.js`.

5. **Set up GitHub Actions** -- Create a workflow for automated Astro build + deploy to GitHub Pages on push to main. Currently no CI/CD exists.

6. **Remove legacy files** -- Once all pages are migrated and verified, remove: `guide/`, `website/`, `_shared/`, `build.py`, `static/`, top-level `index.html`, top-level `.nojekyll`, top-level `CNAME`. The top-level `paper-map/` directory may also be removable if fully superseded by `public/paper-map/`.

7. **Custom domain DNS** -- Verify DNS setup for mintresearch.org. The CNAME file points to `mintresearch.org` but DNS may still be configured for the old GitHub Pages setup. Once Astro builds are deploying via Actions, update DNS as needed.

8. **Minty squid mascot** -- The hero section previously had an SVG squid watermark placeholder, which was removed (comment in CSS: "will be replaced with proper mascot image later"). Needs a proper image-model-generated version in the new aesthetic.

---

## Session Context

This work was done in Minty session 757cd632 on 2026-03-02. That session also:
- Fixed yesterday-in-ai SLACK_BOT_TOKEN transient failure (added retry logic to `platform_config.get_secret()`)
- Sent the missing Mar 1 digest (email + canvas)
- Updated `/start` command to run daemon-health in background
- Consolidated mint-lab-guide, paper-map, and mint-website repos into this single repo
