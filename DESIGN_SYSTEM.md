# MINT Lab Design System

Extracted from `guide/prototype-v3.html`. This is the canonical reference for building Astro components that match the MINT Lab visual language.

---

## 1. CSS Custom Properties

All design tokens are defined on `:root`:

### Backgrounds (darkest to lightest)

| Variable | Value | Usage |
|:---|:---|:---|
| `--bg-0` | `#080d14` | Sidebar, deepest bg, embedded containers |
| `--bg-1` | `#0d1520` | Page body background |
| `--bg-2` | `#121d30` | Card backgrounds, panel surfaces |
| `--bg-3` | `#182640` | Hover states, accordion triggers, elevated surfaces |
| `--bg-4` | `#1e3050` | Table headers, kbd elements, highest-elevation surfaces |

### Accent Colors

| Variable | Value | Usage |
|:---|:---|:---|
| `--accent` | `#2ec4b6` | Primary accent (teal/mint). Links, active states, borders, icons |
| `--accent-soft` | `rgba(46, 196, 182, 0.12)` | Subtle accent backgrounds |
| `--accent-bright` | `#5de8da` | Brighter variant for emphasis |
| `--amber` | `#f59e0b` | Warning, secondary accent |
| `--red` | `#ef4444` | Error states |
| `--cyan` | `#22d3ee` | Diagrams, badges, category color |
| `--indigo` | `#818cf8` | Badges, category color |
| `--purple` | `#a78bfa` | Badges, category color |
| `--pink` | `#f472b6` | Badges, category color |
| `--teal` | `#2dd4bf` | Badges, category color |
| `--green` | `#4ade80` | Health/status OK |
| `--yellow` | `#fbbf24` | Supplementary warm color |

### Accent Glows (box-shadow values)

| Variable | Value | Usage |
|:---|:---|:---|
| `--accent-glow` | `0 0 30px rgba(46, 196, 182, 0.15)` | Standard glow |
| `--accent-glow-strong` | `0 0 40px rgba(46, 196, 182, 0.25), 0 0 80px rgba(46, 196, 182, 0.08)` | Hover glow on cards, search box |
| `--accent-glow-rest` | `0 0 20px rgba(46, 196, 182, 0.04)` | Resting state glow on cards |

### Warm Accent

| Variable | Value |
|:---|:---|
| `--warm-accent` | `rgba(245, 158, 11, 0.15)` |

### Text Colors

| Variable | Value | Usage |
|:---|:---|:---|
| `--text-1` | `#e8e4df` | Primary text (warm off-white) |
| `--text-2` | `#8a9ab5` | Secondary text (muted blue-gray) |
| `--text-3` | `#4a5a73` | Tertiary text (dim, labels, captions) |

### Borders

| Variable | Value | Usage |
|:---|:---|:---|
| `--border` | `rgba(46, 196, 182, 0.08)` | Default border (very subtle teal) |
| `--border-hover` | `rgba(46, 196, 182, 0.3)` | Hover-state border |

### Layout

| Variable | Value |
|:---|:---|
| `--sidebar-w` | `220px` |
| `--radius` | `0` |
| `--radius-sm` | `0` |

### Legacy Aliases

These exist for inline styles that reference the original names:

| Variable | Value |
|:---|:---|
| `--mint` | `#2ec4b6` |
| `--mint-soft` | `rgba(46, 196, 182, 0.12)` |
| `--mint-glow` | `0 0 30px rgba(46, 196, 182, 0.15)` |

---

## 2. Typography System

### Font Families

| Font | Role | Import |
|:---|:---|:---|
| **Fraunces** (serif) | Display headings (h1, h2, h4), stat numbers, law names | Google Fonts: `Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900` |
| **DM Sans** (sans-serif) | Body text, UI labels, card titles, nav links, buttons | Google Fonts: `DM+Sans:wght@300;400;500;600;700` |
| **JetBrains Mono** (monospace) | Code, section numbers, nav marks, tags, labels, kbd | Google Fonts: `JetBrains+Mono:wght@400;500` |

### Element Styles

**body**
```
font-family: 'DM Sans', sans-serif
line-height: 1.65
color: var(--text-1)
-webkit-font-smoothing: antialiased
-moz-osx-font-smoothing: grayscale
```

**h1**
```
font-family: 'Fraunces', serif
font-size: 52px (hero: 56px, mobile: 34px, xs-mobile: 28px)
font-weight: 600
line-height: 1.15
color: var(--text-1)
font-optical-sizing: auto
```

**h1 .gradient** (gradient text effect)
```
background: linear-gradient(135deg, var(--accent), var(--cyan))
-webkit-background-clip: text
-webkit-text-fill-color: transparent
background-clip: text
```

**h2**
```
font-family: 'Fraunces', serif
font-size: 32px
font-weight: 500
display: flex; align-items: center; gap: 16px
margin-bottom: 16px
color: var(--text-1)
font-optical-sizing: auto
```
h2 has a trailing dashed line via `::after`:
```
h2::after {
  content: ''; flex: 1; height: 0;
  border-top: 1px dashed rgba(46, 196, 182, 0.3);
}
```

**h3**
```
font-family: 'DM Sans', sans-serif
font-size: 15px
font-weight: 600
margin: 20px 0 8px
color: var(--text-1)
text-transform: uppercase
letter-spacing: 0.5px
```

**h4**
```
font-family: 'Fraunces', serif
font-weight: 400
font-size: 18px
font-optical-sizing: auto
```

**p**
```
color: var(--text-2)
margin-bottom: 12px
font-size: 14px
```

**p.lead**
```
font-size: 16px
line-height: 1.7
```

**a** (links)
```
color: var(--accent)
text-decoration: none
background-image: linear-gradient(var(--accent), var(--accent))
background-size: 0% 1px
background-position: left bottom
background-repeat: no-repeat
transition: background-size 0.3s ease
```
On hover: `background-size: 100% 1px` (animated underline that slides in from left)

**code** (inline, within tables)
```
background: var(--bg-4)
padding: 1px 6px
border-radius: var(--radius)    /* 0 */
font-family: 'JetBrains Mono', monospace
font-size: 12px
color: var(--accent)
```

**.code-path** (file path display)
```
font-family: 'JetBrains Mono', monospace
font-size: 12px
color: var(--accent)
background: var(--bg-4)
padding: 2px 8px
border-radius: var(--radius)
```

---

## 3. Color System Summary

### Backgrounds
- **Page**: `--bg-1` (#0d1520)
- **Sidebar**: `--bg-0` (#080d14)
- **Cards/Panels**: `--bg-2` (#121d30)
- **Hover/Elevated**: `--bg-3` (#182640)
- **Table headers/Highest elevation**: `--bg-4` (#1e3050)

### Text
- **Primary**: `--text-1` (#e8e4df) -- warm off-white
- **Secondary**: `--text-2` (#8a9ab5) -- muted blue-gray, used for body paragraphs
- **Tertiary**: `--text-3` (#4a5a73) -- dim, used for labels, captions, subtle elements

### Accent
- **Primary accent**: `--accent` (#2ec4b6) -- teal/mint, used everywhere
- **Bright variant**: `--accent-bright` (#5de8da)
- **Soft background**: `--accent-soft` at 0.12 opacity

### Semantic Colors
- **OK/Success**: `--green` (#4ade80)
- **Warning**: `--amber` (#f59e0b)
- **Error**: `--red` (#ef4444)

### Category / Diagram Colors
These are used for badges, tags, pipeline nodes, and data visualization:
- `--cyan` (#22d3ee)
- `--indigo` (#818cf8)
- `--purple` (#a78bfa)
- `--pink` (#f472b6)
- `--teal` (#2dd4bf)
- `--green` (#4ade80)
- `--yellow` (#fbbf24)

### Border
- Default: `rgba(46, 196, 182, 0.08)` -- nearly invisible teal tint
- Hover: `rgba(46, 196, 182, 0.3)` -- noticeable teal

---

## 4. Component Patterns

### 4.1 Cards (.card)

Expandable card with head/body pattern. Click to toggle open/closed.

```css
.card {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);         /* 0 */
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  cursor: pointer;
  box-shadow: var(--accent-glow-rest);
}
.card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--accent-glow-strong);
  transform: translateY(-2px);
}
```

**.card-head**
```css
.card .card-head {
  padding: 16px 18px;
  display: flex; align-items: center; gap: 12px;
  position: relative;
}
/* Chevron indicator (right side) */
.card .card-head::after {
  content: '\203A';      /* single right-pointing angle */
  position: absolute; right: 16px;
  color: var(--text-3);
  transform: rotate(90deg);     /* points down when closed */
  transition: transform 0.2s;
  font-size: 18px;
}
.card.open .card-head::after {
  transform: rotate(270deg);    /* points up when open */
}
```

**.card-icon**
```css
.card .card-icon {
  width: 36px; height: 36px;
  border-radius: var(--radius);   /* 0 */
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
```
Icon backgrounds are set per-card via inline style (e.g., `background: var(--accent-soft)`).

**.card-title / .card-sub**
```css
.card .card-title {
  font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 600;
}
.card .card-sub {
  font-size: 12px; color: var(--text-3);
}
```

**.card-body** (hidden by default, shown when `.open`)
```css
.card .card-body {
  padding: 0 18px 16px; display: none;
}
.card.open .card-body { display: block; }
.card .card-body p { font-size: 13px; }
```

**.card-body detail rows**
```css
.card .card-body .detail-row {
  display: flex; gap: 8px; margin: 6px 0; font-size: 12px;
}
.card .card-body .detail-label {
  color: var(--text-3); min-width: 80px; flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
}
.card .card-body .detail-val {
  color: var(--text-2);
}
```

**.cards** (grid container)
```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;       /* column-gap and row-gap both 14px */
  margin-top: 16px;
  position: relative;
}
```

### 4.2 Stat Card (.stat-card)

```css
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px; margin: 24px 0;
}
.stat-card {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);     /* 0 */
  padding: 16px; text-align: center;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: var(--accent-glow-rest);
}
.stat-card:hover {
  border-color: var(--accent);
  box-shadow: var(--accent-glow-strong);
  transform: translateY(-3px);
}
.stat-card .num {
  font-size: 28px; font-family: 'Fraunces', serif;
  font-weight: 400; color: var(--accent);
}
.stat-card .label {
  font-size: 11px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-3); margin-top: 4px;
  letter-spacing: 1px; text-transform: uppercase;
}
```

### 4.3 Section Number (.section-num)

Diamond-shaped teal marker centered above each numbered section. Positioned with negative top margin to overlap the section divider.

```css
.section-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: var(--accent);
  letter-spacing: 2px; text-transform: uppercase;
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  margin-left: auto; margin-right: auto;
  border: 1.5px solid rgba(46, 196, 182, 0.3);
  border-radius: 0;
  margin-top: -52px; margin-bottom: 16px;
  position: relative;
  box-shadow: 0 0 16px rgba(46, 196, 182, 0.08);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.section-num:hover {
  border-color: var(--accent);
  box-shadow: var(--accent-glow-strong);
}
```

### 4.4 Reference Table (.ref-table)

```css
.ref-table {
  width: 100%; border-collapse: collapse;
  margin: 12px 0; font-size: 13px;
  font-family: 'DM Sans', sans-serif;
}
.ref-table th {
  text-align: left; padding: 8px 12px;
  background: var(--bg-4);
  color: var(--text-2);
  font-family: 'DM Sans', sans-serif;
  font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px dashed rgba(46, 196, 182, 0.3);
}
.ref-table td {
  padding: 8px 12px;
  border-bottom: 1px dashed rgba(46, 196, 182, 0.1);
  color: var(--text-2);
}
.ref-table tr:last-child td {
  border-bottom: 1px dashed rgba(46, 196, 182, 0.15);
}
.ref-table tr:hover td {
  background: rgba(46, 196, 182, 0.04);
}
.ref-table code {
  background: var(--bg-4); padding: 1px 6px;
  border-radius: var(--radius);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; color: var(--accent);
}
```

### 4.5 Tabs (.tabs / .tab-btn)

```css
.tabs {
  display: flex;
  border-bottom: 1px dashed rgba(46, 196, 182, 0.3);
  margin-bottom: 16px;
}
.tab-btn {
  padding: 8px 16px; font-size: 13px;
  font-family: 'DM Sans', sans-serif; font-weight: 500;
  color: var(--text-3); background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-2); }
.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.tab-pane { display: none; }
.tab-pane.active { display: block; }
```

### 4.6 Sidebar (nav.sidebar)

```css
nav.sidebar {
  position: fixed; left: 0; top: 0;
  width: var(--sidebar-w);     /* 220px */
  height: 100vh;
  background: var(--bg-0);
  border-right: 1px solid var(--border);
  padding: 24px 0;
  overflow-y: auto; z-index: 100;
  display: flex; flex-direction: column;
}
```

**Dashed right-edge accent line** (simulated dashed line via repeating gradient):
```css
nav.sidebar::after {
  content: ''; position: absolute; top: 0; right: 0;
  width: 1px; height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    var(--accent) 0px,
    var(--accent) 8px,
    transparent 8px,
    transparent 16px
  );
  opacity: 0.15; pointer-events: none;
}
```

**Logo block**
```css
nav.sidebar .logo {
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border);
}
nav.sidebar .logo h2 {
  font-size: 13px; display: block; margin-bottom: 0;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500;
}
nav.sidebar .logo h2::after { display: none; }
nav.sidebar .logo .logo-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; color: var(--text-3);
}
```

**Nav links**
```css
nav.sidebar a {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 20px; font-size: 13px;
  font-family: 'DM Sans', sans-serif; color: var(--text-3);
  border-left: 2px solid transparent;
  transition: all 0.2s;
  background-image: none;      /* override default link underline */
  position: relative;
}
nav.sidebar a:hover {
  color: var(--text-2); background: var(--bg-2);
  text-decoration: none; background-image: none;
}
nav.sidebar a.active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: rgba(46, 196, 182, 0.08);
  background-image: none;
  box-shadow: inset 0 0 20px rgba(46, 196, 182, 0.06);
}
```

**Nav mark** (section indicator character)
```css
nav.sidebar a .nav-mark {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; width: 18px; text-align: center; opacity: 0.4;
}
```

**Section label dividers** (inline styled in HTML)
```
font-size: 10px; color: var(--text-3);
text-transform: uppercase; letter-spacing: 2px;
font-family: 'JetBrains Mono', monospace;
border-top: 1px solid var(--border);
margin-top: 4px; padding-top: 12px; padding: 8px 20px;
```

### 4.7 Search Overlay (.search-overlay / .search-box)

```css
.search-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 200;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  justify-content: center; padding-top: 15vh;
  display: none;
}
.search-overlay.open { display: flex; }

.search-box {
  width: 560px; max-width: 90vw;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);     /* 0 */
  overflow: hidden; max-height: 60vh;
  display: flex; flex-direction: column;
  box-shadow: var(--accent-glow-strong);
}
.search-box input {
  width: 100%; padding: 16px 20px;
  background: transparent; border: none;
  color: var(--text-1);
  font-family: 'DM Sans', sans-serif; font-size: 16px;
  outline: none;
  border-bottom: 1px solid var(--border);
}
.search-results { overflow-y: auto; padding: 8px; }
.sr-item {
  padding: 10px 14px;
  border-radius: var(--radius); cursor: pointer;
}
.sr-item:hover { background: var(--bg-3); }
.sr-title {
  font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 600;
}
.sr-desc {
  font-size: 12px; color: var(--text-3); margin-top: 2px;
}
.sr-tag {
  display: inline-block; font-size: 10px; padding: 1px 7px;
  border-radius: var(--radius); margin-right: 6px;
  font-family: 'JetBrains Mono', monospace; font-weight: 500;
}
```

**Search trigger** (in sidebar)
```css
.search-trigger {
  margin: 12px 16px; padding: 8px 12px;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-3);
  font-size: 12px; font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
}
.search-trigger:hover { border-color: var(--accent); }
.search-trigger kbd {
  background: var(--bg-3); padding: 1px 6px;
  border-radius: var(--radius);
  font-size: 10px; font-family: 'JetBrains Mono', monospace;
}
```

### 4.8 Hero (.hero)

```css
.hero {
  padding: 120px 48px 80px;
  text-align: center;
  position: relative; overflow: hidden;
  max-width: none;
  border-top: none;
}
```

**Glow effect** (radial gradient with breathing animation):
```css
.hero::before {
  content: ''; position: absolute;
  top: -40%; left: 50%;
  transform: translateX(-50%);
  width: 800px; height: 800px;
  background: radial-gradient(
    circle,
    rgba(46, 196, 182, 0.08) 0%,
    rgba(46, 196, 182, 0.03) 40%,
    transparent 70%
  );
  pointer-events: none; border: none; opacity: 1;
  animation: heroGlow 6s ease-in-out infinite alternate;
}
@keyframes heroGlow {
  0%   { opacity: 0.7; transform: translateX(-50%) scale(1); }
  100% { opacity: 1;   transform: translateX(-50%) scale(1.08); }
}
.hero::after { border: none; opacity: 0; }
```

**Hero typography**
```css
.hero h1 {
  font-family: 'Fraunces', serif;
  font-size: 56px; font-weight: 600;
  margin-bottom: 16px; position: relative;
  font-optical-sizing: auto;
}
.hero .subtitle {
  font-size: 18px; font-family: 'DM Sans', sans-serif;
  font-weight: 300; color: var(--text-2);
  max-width: 640px; margin: 0 auto 40px;
  letter-spacing: 0.3px;
}
```

### 4.9 Iron Laws (.law / .iron-laws)

```css
.iron-laws {
  max-width: 700px; margin: 0 auto; padding: 40px 0;
}
.law {
  text-align: center; padding: 28px 0;
  border-top: 1px dashed rgba(46, 196, 182, 0.3);
}
.law:first-child { border-top: none; }
.law-name {
  font-family: 'Fraunces', serif; font-style: italic;
  font-size: 22px; font-weight: 500;
  color: var(--accent); margin-bottom: 8px;
  font-optical-sizing: auto;
}
.law-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: var(--text-2);
  max-width: 500px; margin: 0 auto;
}
```

### 4.10 Ingest Pipeline (.ingest-pipeline / .ingest-stage)

Container with grid background (same pattern as pipeline-wrap):
```css
.ingest-pipeline {
  background-color: var(--bg-2);
  background-image:
    repeating-linear-gradient(to right,
      rgba(46, 196, 182, 0.04) 0px, rgba(46, 196, 182, 0.04) 1px,
      transparent 1px, transparent 24px),
    repeating-linear-gradient(to bottom,
      rgba(46, 196, 182, 0.04) 0px, rgba(46, 196, 182, 0.04) 1px,
      transparent 1px, transparent 24px);
  border: 1px dashed var(--border);
  border-radius: var(--radius);    /* 0 */
  padding: 24px; margin: 20px 0;
}
```

**Vertical stage layout**
```css
.ingest-stages {
  display: flex; flex-direction: column; padding-left: 8px;
}
.ingest-stage {
  display: flex; align-items: flex-start;
  position: relative; padding-left: 24px; min-height: 48px;
}
.ingest-dot {
  position: absolute; left: 0; top: 12px;
  width: 10px; height: 10px;
  border-radius: 50%; z-index: 2;
  /* Color set per-stage via inline style */
}
.ingest-line {
  position: absolute; left: 4px; top: 22px;
  width: 2px; height: calc(100% - 10px); opacity: 0.3;
  /* Color set per-stage via inline style */
}
.ingest-stage--last .ingest-line { display: none; }
.ingest-box {
  display: flex; align-items: center; gap: 10px;
  border: 1px solid;        /* color set inline */
  border-radius: var(--radius-sm);   /* 0 */
  padding: 8px 14px; background: var(--bg-1);
  flex: 1; max-width: 320px; margin-bottom: 6px;
}
.ingest-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 600;
  min-width: 18px; opacity: 0.7;
}
.ingest-info { display: flex; flex-direction: column; }
.ingest-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
}
.ingest-desc { font-size: 11px; color: var(--text-3); }
.ingest-stage--highlight .ingest-box { border-width: 1.5px; }
```

**Ingest tooltip** (fixed-position on hover)
```css
.ingest-tip {
  position: fixed; max-width: 340px; padding: 10px 14px;
  background: var(--bg-0);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-1);
  font-size: 12px; line-height: 1.55;
  pointer-events: none;
  opacity: 0; transition: opacity 0.15s ease;
  z-index: 200;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.ingest-tip.visible { opacity: 1; }
```

**Ingest detail blocks** (below the pipeline)
```css
.ingest-details {
  display: flex; gap: 14px; margin-top: 20px; flex-wrap: wrap;
}
.ingest-detail-block {
  flex: 1; min-width: 240px;
  border: 1px solid;          /* color set inline */
  border-radius: var(--radius-sm);
  padding: 12px 16px; background: var(--bg-1);
}
.ingest-detail-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 600; margin-bottom: 4px;
}
.ingest-detail-text {
  font-size: 12px; color: var(--text-2); margin-bottom: 2px;
}
.ingest-detail-note {
  font-size: 11px; color: var(--text-3); margin-top: 4px;
}
```

### 4.11 Pipeline Wrap / Pipeline Mobile (.pipeline-wrap / .pipeline-mobile)

**Desktop pipeline** (contains SVG diagram):
```css
.pipeline-wrap {
  background-color: var(--bg-2);
  background-image:
    repeating-linear-gradient(to right,
      rgba(46, 196, 182, 0.04) 0px, rgba(46, 196, 182, 0.04) 1px,
      transparent 1px, transparent 24px),
    repeating-linear-gradient(to bottom,
      rgba(46, 196, 182, 0.04) 0px, rgba(46, 196, 182, 0.04) 1px,
      transparent 1px, transparent 24px);
  border: 1px dashed var(--border);
  border-radius: var(--radius);    /* 0 */
  padding: 24px; margin: 20px 0;
  overflow-x: auto;
}
.pipeline-wrap svg text { font-family: inherit; }
```

**Pipeline tooltip**
```css
.pipeline-tip {
  position: fixed; max-width: 320px; padding: 10px 14px;
  background: var(--bg-0);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-1);
  font-size: 12px; line-height: 1.55;
  pointer-events: none;
  opacity: 0; transition: opacity 0.15s ease; z-index: 200;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.pipeline-tip.visible { opacity: 1; }
```

**Mobile pipeline** (card-based layout, replaces SVG below 900px):
```css
/* Hidden by default; shown below 900px when .pipeline-wrap is hidden */
.pipeline-mobile { display: none; }

@media (max-width: 900px) {
  .pipeline-wrap { display: none; }
  .pipeline-mobile {
    display: block;
    background-color: var(--bg-3);
    background-image: /* same grid pattern as desktop */;
    border: 1px solid var(--border);
    border-radius: 0;
    padding: 20px 16px; margin: 20px -20px;
  }
}
```

Mobile pipeline sub-components:
```css
.mp-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 1.5px;
  margin-bottom: 8px; text-align: center;
}
.mp-box {
  padding: 8px 10px; border-radius: var(--radius-sm);
  background: var(--bg-3);
  border: 1px solid var(--border); text-align: center;
}
.mp-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 700; line-height: 1.3;
}
.mp-sub { font-size: 10px; color: var(--text-3); margin-top: 1px; }
.mp-hub { border-width: 2px; padding: 14px 10px; box-shadow: 0 0 20px rgba(46,196,182,0.1); }
.mp-human { border-style: dashed; }
.mp-pill {
  padding: 5px 8px; border-radius: var(--radius-sm);
  background: var(--bg-3); border: 1px solid var(--border);
  text-align: center; font-size: 10px; font-weight: 600;
}
.mp-section { margin-bottom: 16px; }
.mp-hflow { display: flex; align-items: center; justify-content: center; gap: 0; }
.mp-hflow > .mp-box { flex: 1; min-width: 0; }
.mp-vflow { display: flex; flex-direction: column; align-items: center; }
.mp-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
```

Arrow components (vertical and horizontal, color variants):
```css
.mp-varrow {
  display: flex; justify-content: center; padding: 2px 0;
  font-size: 10px; line-height: 1;
}
.mp-varrow::before { content: ''; width: 1.5px; height: 10px; display: block; }
.mp-varrow::after { content: '\25BC'; font-size: 7px; margin-top: -1px; }

/* Color variants: --cyan, --mint, --amber, --pink, --purple, --teal */
.mp-varrow--cyan::before { background: #22d3ee; }
.mp-varrow--cyan::after { color: #22d3ee; }
/* (same pattern for all colors) */

.mp-harrow {
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: var(--text-3); padding: 0 2px; min-width: 16px;
}
.mp-harrow::after { content: '\25B6'; font-size: 7px; }
```

### 4.12 Timeline Wrap (.timeline-wrap)

```css
.timeline-wrap {
  background-color: var(--bg-2);
  background-image: /* same 24px grid pattern */;
  border: 1px dashed var(--border);
  border-radius: var(--radius);    /* 0 */
  padding: 24px; margin: 20px 0;
}
.timeline-row {
  display: flex; align-items: center; gap: 12px; margin: 6px 0;
}
.timeline-label {
  width: 130px; font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-2); text-align: right;
}
.timeline-bar-bg {
  flex: 1; height: 24px;
  background: var(--bg-0);
  border-radius: var(--radius);
  position: relative; overflow: hidden;
}
.hour-marks { position: absolute; inset: 0; display: flex; }
.hour-marks span { flex: 1; border-right: 1px solid var(--bg-2); }
.t-block {
  position: absolute; top: 2px; bottom: 2px;
  border-radius: var(--radius);
  opacity: 0.7; transition: opacity 0.2s;
}
.t-block:hover { opacity: 1; }
.timeline-hours { display: flex; margin-top: 4px; }
.timeline-hours span {
  flex: 1; font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-3);
}
```

### 4.13 Q Grid (.q-grid)

Grid of small interactive cells (used for the 41 Questions display).

```css
.q-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 6px; margin: 16px 0;
}
.q-cell {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);    /* 0 */
  padding: 8px 10px; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center; position: relative;
}
.q-cell:hover {
  border-color: var(--border-hover); background: var(--bg-3);
}
.q-cell .q-id {
  font-size: 10px; font-family: 'JetBrains Mono', monospace; opacity: 0.5;
}
.q-cell .q-key {
  font-size: 11px; font-family: 'JetBrains Mono', monospace;
  font-weight: 500; margin-top: 2px;
}
.q-cell .q-tooltip {
  display: none; position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%);
  background: var(--bg-4); padding: 12px;
  border-radius: var(--radius); border: 1px solid var(--border);
  width: 280px; z-index: 10; text-align: left;
  font-size: 12px; font-family: 'DM Sans', sans-serif;
  color: var(--text-2); line-height: 1.5; margin-top: 4px;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.q-cell:hover .q-tooltip { display: block; }
.q-cell.expanded {
  grid-column: 1 / -1; text-align: left;
  display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline;
  background: var(--bg-4); border-color: var(--border-hover);
}
.q-cell.expanded .q-tooltip {
  display: block; position: relative; top: auto; left: auto;
  transform: none; flex-basis: 100%; width: auto;
  pointer-events: auto; box-shadow: none; margin-top: 0;
}
```

### 4.14 Hierarchy Tree (.hierarchy / .h-node)

Used for agent hierarchy diagrams.

```css
.hierarchy { margin: 20px 0; }
.h-tier {
  display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
}
.h-node {
  border: 1px solid;          /* color set inline per node */
  border-radius: var(--radius);    /* 0 */
  padding: 16px; min-width: 180px; text-align: center;
  background: var(--bg-2);
  box-shadow: var(--accent-glow-rest);
}
.h-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
}
.h-sub {
  font-size: 11px; color: var(--text-3); margin-top: 4px;
}
.h-connector {
  text-align: center; padding: 8px; color: var(--text-3);
}
.h-connector::before {
  content: '\2502';      /* vertical box-drawing character */
  font-family: 'JetBrains Mono', monospace;
}
```

### 4.15 Lab Accordion (details.lab-accordion)

Native HTML `<details>` element styled as an accordion.

```css
details.lab-accordion {
  border: 1px dashed var(--border);
  border-radius: var(--radius);     /* 0 */
  margin: 8px 0; overflow: hidden;
}
details.lab-accordion summary {
  padding: 14px 18px; background: var(--bg-2);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600;
  cursor: pointer; color: var(--text-1);
  list-style: none;
  display: flex; justify-content: space-between; align-items: center;
}
details.lab-accordion summary::-webkit-details-marker { display: none; }
details.lab-accordion summary::after {
  content: '+';
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent); font-size: 14px;
}
details.lab-accordion[open] summary::after {
  content: '\2212';     /* minus sign */
}
details.lab-accordion .accordion-inner {
  padding: 16px 18px; background: var(--bg-1);
}
details.lab-accordion .accordion-inner p { font-size: 13px; }
details.lab-accordion .accordion-inner ul.clean li { font-size: 13px; }
```

### 4.16 Bleed Line (.bleed-line)

Full-viewport-width dashed line that breaks out of the content column.

```css
.bleed-line {
  position: relative;
  width: 100%; max-width: 1100px;
  height: 0; margin: 0 auto;
  pointer-events: none;
}
.bleed-line::before {
  content: '';
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 100vw; height: 0;
  border-top: 1px dashed rgba(46, 196, 182, 0.3);
}
.bleed-line--heavy::before {
  border-top-width: 2px;
}
```

### 4.17 Section Divider (.section-divider)

Horizontal divider with a center element (typically a diamond or text) flanked by dashed lines.

```css
.section-divider {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; padding: 8px 0; margin: 0 auto;
  font-size: 14px; color: var(--accent); opacity: 0.45;
  letter-spacing: 4px;
  max-width: 1100px; width: 100%;
}
.section-divider::before, .section-divider::after {
  content: ''; flex: 1; max-width: 200px; height: 0;
  border-top: 1px dashed rgba(46, 196, 182, 0.3);
}
```

### 4.18 Fade In (.fade-in)

Scroll-triggered entrance animation.

```css
.fade-in {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s, transform 0.6s;
}
.fade-in.visible {
  opacity: 1; transform: none;
}
/* L-brackets and section numbers have staggered fade */
.fade-in::before, .fade-in::after {
  transition: opacity 0.8s 0.2s;
}
.fade-in:not(.visible)::before,
.fade-in:not(.visible)::after {
  opacity: 0 !important;
}
.fade-in .section-num {
  transition: opacity 0.6s 0.15s, transform 0.6s 0.15s;
}
.fade-in:not(.visible) .section-num {
  opacity: 0; transform: scale(0.8);
}
```

---

## 5. Structural Line Philosophy

The design uses a strict, consistent approach to lines. Every structural/decorative line follows these rules:

### Rule 1: All structural lines are dashed, never solid

Every horizontal rule, separator, table border, and divider uses `border-top: 1px dashed rgba(46, 196, 182, 0.3)` or a lower-opacity variant. There are no solid horizontal rules anywhere in the design.

Specific instances:
- **h2 trailing line**: `1px dashed rgba(46, 196, 182, 0.3)`
- **h3 separator**: `1px dashed rgba(46, 196, 182, 0.15)`
- **Table header border**: `1px dashed rgba(46, 196, 182, 0.3)`
- **Table cell border**: `1px dashed rgba(46, 196, 182, 0.1)`
- **Table last-row border**: `1px dashed rgba(46, 196, 182, 0.15)`
- **Tab bar bottom**: `1px dashed rgba(46, 196, 182, 0.3)`
- **Law separator**: `1px dashed rgba(46, 196, 182, 0.3)`
- **Section divider flanks**: `1px dashed rgba(46, 196, 182, 0.3)`
- **Bleed line**: `1px dashed rgba(46, 196, 182, 0.3)`
- **Accordion borders**: `1px dashed var(--border)`
- **Pipeline/timeline/ingest containers**: `1px dashed var(--border)`
- **Callout border**: `1px dashed var(--border)` (except left edge, which is solid accent)
- **Geo divider lines**: `1px dashed rgba(46, 196, 182, 0.3)`

**Exceptions** (solid lines used only for interactive/functional purposes):
- **Sidebar active border-left**: `2px solid var(--accent)` -- this is a UI state indicator, not a decorative line
- **Sidebar right border**: `1px solid var(--border)` -- structural boundary (but overlaid with a dashed accent pseudo-element)
- **Tab active underline**: `2px solid var(--accent)` -- UI state indicator
- **Card borders**: `1px solid var(--border)` -- container boundaries (very subtle at 0.08 opacity)
- **L-bracket registration marks**: `1.5px solid var(--accent)` at 0.28 opacity -- these are geometric registration marks, not rules

### Rule 2: L-brackets on numbered sections only

Registration marks (L-shaped corner brackets) appear on sections via `section::before` and `section::after`:

```css
/* Top-left L-bracket */
section::before {
  content: ''; position: absolute;
  top: 12px; left: 36px;
  width: 32px; height: 32px;
  border-top: 1.5px solid var(--accent);
  border-left: 1.5px solid var(--accent);
  opacity: 0.28; pointer-events: none;
}
/* Bottom-right L-bracket */
section::after {
  content: ''; position: absolute;
  bottom: 12px; right: 36px;
  width: 32px; height: 32px;
  border-bottom: 1.5px solid var(--accent);
  border-right: 1.5px solid var(--accent);
  opacity: 0.28; pointer-events: none;
}
```

Suppressed on hero and non-numbered sections:
```css
section.no-brackets::before,
section.no-brackets::after { display: none; }
```

Hidden on mobile (`max-width: 768px`):
```css
section::before, section::after { display: none; }
```

### Rule 3: Dashed sidebar accent

The sidebar's right edge has a simulated dashed line overlaid via a repeating gradient pseudo-element:

```css
nav.sidebar::after {
  background: repeating-linear-gradient(
    to bottom,
    var(--accent) 0px, var(--accent) 8px,
    transparent 8px, transparent 16px
  );
  opacity: 0.15;
}
```

This creates an 8px-on/8px-off dashed pattern in the accent color at very low opacity.

### Rule 4: Grid backgrounds on technical diagram containers

Three container types share the same 24px grid background at 0.04 opacity:
- `.pipeline-wrap`
- `.timeline-wrap`
- `.ingest-pipeline`

The grid pattern:
```css
background-image:
  repeating-linear-gradient(to right,
    rgba(46, 196, 182, 0.04) 0px, rgba(46, 196, 182, 0.04) 1px,
    transparent 1px, transparent 24px),
  repeating-linear-gradient(to bottom,
    rgba(46, 196, 182, 0.04) 0px, rgba(46, 196, 182, 0.04) 1px,
    transparent 1px, transparent 24px);
```

This creates a subtle engineering-paper / blueprint grid effect. Applied only to containers that hold technical diagrams (pipelines, timelines, schematics).

### Rule 5: No gradient/tapered lines

The codebase explicitly documents the removal of a connector gradient line between registration marks and section titles (see CSS comment section A). All lines are uniform-width dashed. No gradients, tapers, or fades on line elements.

---

## 6. Layout Rules

### Sidebar
- Width: `220px` (`var(--sidebar-w)`)
- Mobile (768px and below): slides off-screen, `260px` wide, toggled via hamburger menu
- Fixed position, full viewport height
- Background: `var(--bg-0)`

### Main Content
```css
main {
  margin-left: var(--sidebar-w);
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center;
  position: relative;
}
```

### Sections
```css
section {
  padding: 64px 48px 80px;
  max-width: 1100px;
  width: 100%;
  position: relative;
  border-bottom: none;
}
```

### Hero (special section)
```css
.hero {
  padding: 120px 48px 80px;
  max-width: none;          /* breaks out of 1100px constraint */
}
```

### Mobile Breakpoints

**900px** -- Pipeline swap:
- Desktop SVG pipeline hidden, mobile card layout shown
- Pipeline mobile container: negative margins (`margin: 20px -20px`) for edge-to-edge

**768px** -- Full mobile layout:
```css
.mobile-menu-btn { display: block; }
nav.sidebar {
  width: 260px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
nav.sidebar.open { transform: translateX(0); }
main { margin-left: 0; }
section { padding: 32px 20px 40px; }
.hero { padding: 48px 20px 32px; }
.hero h1 { font-size: 34px; }
.hero .subtitle { font-size: 14px; }
.cards { grid-template-columns: 1fr; }
.stats { grid-template-columns: repeat(3, 1fr); }
.ref-table { display: block; overflow-x: auto; }
.grid-2 { grid-template-columns: 1fr; }
/* L-brackets, bleed lines, sidebar dots, h3 separators: hidden */
section::before, section::after { display: none; }
h3::before { display: none; }
.bleed-line { display: none; }
.sidebar-dot { display: none; }
.search-trigger { display: none; }
```

**400px** -- Extra-small:
```css
.stats { grid-template-columns: repeat(2, 1fr); }
.hero h1 { font-size: 28px; }
```

---

## 7. Key Design Principles

### Hard Right Angles

`--radius: 0` and `--radius-sm: 0`. Every card, button, input, badge, table cell, and container uses `border-radius: 0` (via the variables). The only exception is `.ingest-dot` and `.sidebar-dot` which use `border-radius: 50%` because they are literal circles, not rectangular UI elements. The design language is emphatically angular.

### Noise Overlay

A fixed full-viewport noise texture sits on top of everything (z-index 9999), adding subtle film grain:

```css
body::after {
  content: '';
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  pointer-events: none; z-index: 9999;
  opacity: 0.012;
  background-image: url("data:image/svg+xml,...");
  /* SVG: feTurbulence fractalNoise, baseFrequency 0.85, 4 octaves */
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

The noise SVG is inlined as a data URI. It uses `feTurbulence type="fractalNoise"` with `baseFrequency="0.85"` and `numOctaves="4"`, stitched and tiled at 200x200px. The 0.012 opacity makes it nearly imperceptible but adds organic texture.

### Hero Glow Animation

A slow-breathing radial gradient behind the hero title:
- 800x800px radial gradient centered horizontally, positioned above the viewport (`top: -40%`)
- Gradient: accent at 0.08 opacity center, fading to 0.03 at 40%, transparent at 70%
- Animation: 6-second ease-in-out, alternating between 0.7 opacity at scale(1) and 1.0 opacity at scale(1.08)
- Creates a subtle pulsing teal light effect behind the hero text

### Card Hover Pattern

All interactive cards follow the same hover pattern:
1. Border transitions from `var(--border)` to `var(--border-hover)` or `var(--accent)`
2. Box-shadow transitions from `var(--accent-glow-rest)` to `var(--accent-glow-strong)`
3. Slight lift: `transform: translateY(-2px)` (cards) or `translateY(-3px)` (stat cards)
4. All transitions: `0.3s`

### Status Pulse Animation

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.status-pulse { animation: pulse 2.5s ease-in-out infinite; }
```

---

## 8. Additional Components

### Tags

```css
.tag {
  display: inline-block; font-size: 10px; padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-family: 'JetBrains Mono', monospace; font-weight: 500;
}
```

Color variants (background at ~0.1 opacity of the color):
| Class | Background | Text Color |
|:---|:---|:---|
| `.tag-daemon` | `rgba(46,196,182,0.1)` | `var(--accent)` |
| `.tag-persistent` | `rgba(251,146,60,0.1)` | `var(--amber)` |
| `.tag-polling` | `rgba(45,212,191,0.1)` | `var(--teal)` |
| `.tag-daily` | `rgba(129,140,248,0.1)` | `var(--indigo)` |
| `.tag-weekly` | `rgba(244,114,182,0.1)` | `var(--pink)` |

### Badges

```css
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; padding: 3px 10px;
  border-radius: var(--radius);
  font-family: 'DM Sans', sans-serif; font-weight: 600;
}
```

| Class | Background | Text Color |
|:---|:---|:---|
| `.badge-blue` | `rgba(34,211,238,0.1)` | `var(--cyan)` |
| `.badge-green` | `rgba(46,196,182,0.1)` | `var(--accent)` |
| `.badge-purple` | `rgba(167,139,250,0.1)` | `var(--purple)` |
| `.badge-orange` | `rgba(251,146,60,0.1)` | `var(--amber)` |
| `.badge-amber` | `rgba(245,158,11,0.1)` | `var(--amber)` |
| `.badge-cyan` | `rgba(34,211,238,0.1)` | `var(--cyan)` |
| `.badge-indigo` | `rgba(129,140,248,0.1)` | `var(--indigo)` |
| `.badge-warm` | `var(--warm-accent)` | `var(--amber)` + `border: 1px dashed rgba(245, 158, 11, 0.2)` |

### Callout

```css
.callout {
  background: var(--bg-2);
  border: 1px dashed var(--border);
  border-left: 3px solid var(--accent);    /* left accent overrides dashed */
  padding: 14px 18px;
  border-radius: 0 var(--radius) var(--radius) 0;   /* 0 */
  margin: 16px 0; font-size: 13px;
}
```

### Clean List (ul.clean)

```css
ul.clean { list-style: none; padding: 0; }
ul.clean li {
  padding: 4px 0; font-size: 13px; color: var(--text-2);
}
ul.clean li::before {
  content: '\203A';     /* single right-pointing angle quotation mark */
  color: var(--accent); margin-right: 8px;
  font-family: 'JetBrains Mono', monospace; font-weight: bold;
}
```

### Health Status Colors

```css
.health-ok   { color: var(--green); }
.health-warn { color: var(--amber); }
.health-err  { color: var(--red); }
```

### File Tree (.tree)

```css
.tree {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; color: var(--text-2); line-height: 1.8;
}
.tree .dir { color: var(--cyan); }
.tree .file { color: var(--text-3); }
.tree .highlight { color: var(--accent); }
```

### Subscribe Card

```css
.subscribe-card {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 48px; max-width: 600px;
  margin: 0 auto; text-align: center;
  box-shadow: var(--accent-glow-rest);
}
.subscribe-preview {
  background: var(--bg-0);
  border-radius: var(--radius);
  padding: 16px 20px; margin: 20px 0;
  text-align: left; font-size: 13px;
  border: 1px dashed var(--border);
}
.subscribe-proof {
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-3); letter-spacing: 0.5px; margin: 12px 0;
}
```

### Accordion (JS-toggled variant)

```css
.accordion {
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  overflow: hidden; margin: 12px 0;
}
.accordion-item { border-bottom: 1px dashed var(--border); }
.accordion-item:last-child { border-bottom: none; }
.accordion-trigger {
  width: 100%; padding: 12px 18px;
  background: var(--bg-3); border: none;
  color: var(--text-1);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  display: flex; justify-content: space-between; align-items: center;
  transition: background 0.2s;
}
.accordion-trigger:hover { background: var(--bg-4); }
.accordion-trigger::after {
  content: '+';
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; color: var(--accent);
  transition: transform 0.2s;
}
.accordion-item.open .accordion-trigger::after { content: '\2212'; }
.accordion-content {
  padding: 0 18px; max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s, padding 0.3s;
}
.accordion-item.open .accordion-content {
  padding: 14px 18px; max-height: 600px;
}
```

### Grid Utility

```css
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
/* Mobile: collapses to single column */
```

### Sidebar Dots

```css
.sidebar-dot {
  position: fixed;
  left: calc(var(--sidebar-w) - 2px);
  width: 5px; height: 5px;
  background: var(--accent);
  border-radius: 50%;
  opacity: 0.4;
  pointer-events: none; z-index: 101;
  box-shadow: 0 0 8px rgba(46, 196, 182, 0.25);
}
```

### Section Geo Divider

```css
section .section-divider-geo {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 48px; margin-bottom: -32px;
  opacity: 0.3; color: var(--accent);
}
section .section-divider-geo::before,
section .section-divider-geo::after {
  content: ''; width: 60px; height: 0;
  border-top: 1px dashed rgba(46, 196, 182, 0.3);
}
```

---

## 9. Implementation Notes for Astro

### Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### CSS Variable Scope
All custom properties are on `:root`. No component-scoped overrides exist. The entire design works from a single flat set of tokens.

### Transition Defaults
Most interactive elements use `0.3s` transitions. Tooltips use `0.15s`. Accordion content uses `0.3s` for both max-height and padding.

### Z-Index Stack
| z-index | Element |
|:---|:---|
| 9999 | Noise overlay (`body::after`) |
| 200 | Search overlay, pipeline/ingest tooltips |
| 150 | Mobile menu button |
| 140 | Mobile sidebar |
| 130 | Mobile overlay backdrop |
| 101 | Sidebar dots |
| 100 | Sidebar |
| 10 | Q-cell tooltips |
| 2 | Ingest dots |

### Mobile Menu
The hamburger button is hidden on desktop, shown at 768px. The sidebar transforms off-screen and slides in when `.open` is added. A backdrop overlay (`.mobile-overlay`) covers the rest of the viewport.

### Content h3 Separators
`section > h3` elements get an automatic dashed line above them via `::before`, except the first h3 in each section (suppressed via `:first-of-type::before { display: none }`). Hidden on mobile.
