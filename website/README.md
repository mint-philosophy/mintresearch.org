# MINT Lab Website

**Machine Intelligence and Normative Theory**

The MINT Lab website, hosted via GitHub Pages at [mint-philosophy.github.io/mint-website](https://mint-philosophy.github.io/mint-website/).

> **Status**: Work-in-progress. Text is placeholder content pending review.

## File Map

| File | Purpose |
|:---|:---|
| `index.html` | Page structure and interactive behaviour (vanilla JS) |
| `style.css` | All styling — colors, layout, typography, responsive breakpoints |
| `site-data.js` | **All content lives here** — people, publications, events, projects |
| `playground.html` | Design playground for tweaking visual settings |
| `assets/logos/` | Minty logos, wordmarks, social card |
| `assets/minties/` | Minty squid character expressions |

## How to Edit Content

Open `site-data.js`. All site content is in one file with clear sections and inline instructions.

**Add a team member:**
```js
{ name: "Full Name", role: "Role Title", discipline: "Field" }
```

**Add a publication:**
```js
{ type: "publication", title: "Paper Title", authors: "Author, Author",
  date: "2025", description: "Journal Name", url: "https://..." }
```

**Add an event, news item, or newsletter post** — same pattern, change `type` to `"event"`, `"news"`, or `"newsletter"`.

**Move someone to alumni** — cut from `people.team`, paste into `people.alumni`.

## How to Preview Locally

Open `index.html` directly in a browser, or:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## How to Deploy

Push to `main`. GitHub Pages serves automatically from the root directory.

## Tech Stack

- Single HTML file + CSS + vanilla JS
- No frameworks, no build step, no external dependencies
- Content separated from presentation via `site-data.js`
