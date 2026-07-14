const CSV_URL = "/assets/papers/latest-paper-deliverables.csv";
const PAGE_SIZE = 10;
const SCROLL_MODE = "row"; // "row" = scroll one entry at a time; "page" = original paged behaviour
const RULER_SEGMENTS = 24;
const TOUCH_SWIPE_PX = 48;
const RULER_SWIPE_PX = 28;

let pickerSerial = 0;

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])),
    );
}

function parseDate(value) {
  const [day, month, year] = value.split("/").map((part) => Number(part));
  if (!day || !month || !year) return new Date(0);
  return new Date(year, month - 1, day);
}

function displayDate(value) {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "";
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function isValidLink(value) {
  const normalized = value.trim().toLowerCase();
  return (
    /^https?:\/\//i.test(value.trim()) &&
    normalized !== "no github" &&
    normalized !== "no post yet"
  );
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function visiblePapers(rows) {
  return rows
    .filter((row) => row["Site: in Papers Section?"].trim().toLowerCase() === "yes")
    .filter((row) => row["Site: Public?"].trim().toLowerCase() === "yes")
    .sort((a, b) => parseDate(b["Date (D/M/Y)"]) - parseDate(a["Date (D/M/Y)"]));
}

const MINISITE_STYLE = `
.tp-minisite-avail { color: var(--yellow); }
a.tp-source--minisite { color: var(--yellow, #e5c07b); border: 1px solid rgba(229,192,123,0.5); background: rgba(229,192,123,0.1); padding: 1px 8px; display: inline-flex; gap: 7px; align-items: center; transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
a.tp-source--minisite:hover { background: var(--yellow, #e5c07b); color: var(--bg-0, #0a0a0a); border-color: var(--yellow, #e5c07b); text-decoration: none; }
a.tp-source--minisite:hover .tp-minisite-cursor { color: var(--bg-0, #0a0a0a); }
.tp-minisite-cursor { animation: tpMinisiteBlink 1s step-end infinite; font-size: 10px; }
@keyframes tpMinisiteBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tp-minisite-cursor { animation: none; } }
.tp-sr-only,
.tp-entry--paper .tp-title-full,
.tp-entry--paper:not(.tp-entry--open) .tp-authors-full { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0; }
.tp-head--paper { --tp-title-line: 22px; display: flex; align-items: baseline; height: var(--tp-title-line); min-height: var(--tp-title-line); overflow: hidden; line-height: var(--tp-title-line); white-space: nowrap; }
.tp-head--paper .tp-title-short { order: 1; display: block; flex: 1 1 auto; min-width: 0; overflow: hidden; line-height: inherit; text-overflow: ellipsis; white-space: nowrap; }
.tp-head--paper .tp-date { order: 2; flex: 0 0 auto; height: var(--tp-title-line); line-height: var(--tp-title-line); text-align: right; white-space: nowrap; }
.tp-entry--paper.tp-entry--open .tp-head--paper { display: flow-root; height: auto; overflow: visible; white-space: normal; }
.tp-entry--paper.tp-entry--open .tp-head--paper .tp-date { float: right; margin-left: 1ch; }
.tp-entry--paper.tp-entry--open .tp-head--paper .tp-title-short { display: inline; overflow: visible; text-overflow: clip; white-space: normal; }
.tp-meta--paper { display: flex; align-items: baseline; min-width: 0; overflow: hidden; white-space: nowrap; }
.tp-authors { flex: 0 1 auto; max-width: 100%; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.tp-authors-short { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tp-meta--paper .tp-venue { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tp-meta--paper .tp-minisite-separator,
.tp-meta--paper .tp-minisite-avail--meta { flex: 0 0 auto; white-space: nowrap; }
.tp-entry--paper.tp-entry--open .tp-meta--paper { display: block; overflow: visible; white-space: normal; }
.tp-entry--paper.tp-entry--open .tp-authors { display: inline; max-width: none; overflow: visible; }
.tp-entry--paper.tp-entry--open .tp-authors-short { display: none; }
.tp-entry--paper.tp-entry--open .tp-authors-full { display: inline; position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; clip-path: none; white-space: normal; }
.tp-entry--paper.tp-entry--open .tp-meta--paper .tp-venue { display: inline; max-width: none; overflow: visible; white-space: normal; }
`;

function ensureMinisiteStyle() {
  if (document.getElementById("tp-minisite-style")) return;
  const el = document.createElement("style");
  el.id = "tp-minisite-style";
  el.textContent = MINISITE_STYLE;
  document.head.appendChild(el);
}

const AUTHOR_SUMMARY_MAX_NAMES = 3;

function authorsHtml(authors) {
  // CSV contract: commas separate complete author names. Preserve the parsed
  // array so fitting never has to reinterpret the rendered display string.
  const names = authors.split(",").map((n) => n.trim()).filter(Boolean);
  if (!names.length) return "";
  const initial = names.length === 1
    ? names[0]
    : `${names[0]}, et al. (+${names.length - 1})`;
  return `<span class="tp-authors" data-tp-authors data-tp-author-names="${escapeHtml(JSON.stringify(names))}" role="presentation"><span class="tp-authors-short" data-tp-authors-short data-tp-authors-shown="1" data-tp-authors-hidden="${Math.max(0, names.length - 1)}" aria-hidden="true">${escapeHtml(initial)}</span><span class="tp-authors-full" data-tp-authors-full>${escapeHtml(authors)}</span></span>`;
}

function authorSummaryCandidates(names) {
  const full = names.join(", ");
  const candidates = [{ text: full, shown: names.length, hidden: 0 }];
  const maxNamed = Math.min(AUTHOR_SUMMARY_MAX_NAMES, names.length - 1);
  for (let shown = maxNamed; shown >= 1; shown -= 1) {
    candidates.push({
      text: `${names.slice(0, shown).join(", ")}, et al. (+${names.length - shown})`,
      shown,
      hidden: names.length - shown,
    });
  }
  return candidates;
}

let authorMeasureEl = null;

// Short forms are derived from the CSV-rendered text at runtime. Nothing is
// written back to the CSV, and newly added rows are measured by the same rule.
function measureAuthorText(text, reference) {
  if (!authorMeasureEl) {
    authorMeasureEl = document.createElement("span");
    authorMeasureEl.setAttribute("aria-hidden", "true");
    Object.assign(authorMeasureEl.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      width: "max-content",
    });
    document.body.appendChild(authorMeasureEl);
  }
  const style = getComputedStyle(reference);
  authorMeasureEl.style.font = style.font;
  authorMeasureEl.style.letterSpacing = style.letterSpacing;
  authorMeasureEl.style.fontFeatureSettings = style.fontFeatureSettings;
  authorMeasureEl.style.fontVariationSettings = style.fontVariationSettings;
  authorMeasureEl.textContent = text;
  return authorMeasureEl.getBoundingClientRect().width;
}

function fitAuthorSummary(meta, generation) {
  if (!meta || meta.closest(".tp-entry--open") || meta.clientWidth === 0) return;
  const fitKey = `${Math.round(meta.clientWidth)}:${generation}`;
  if (meta.dataset.tpAuthorFitKey === fitKey) return;
  const authors = meta.querySelector("[data-tp-authors]");
  const short = meta.querySelector("[data-tp-authors-short]");
  const venue = meta.querySelector(".tp-venue");
  const minisiteSeparator = meta.querySelector(".tp-minisite-separator");
  const minisite = meta.querySelector(".tp-minisite-avail--meta");
  if (!authors || !short) {
    meta.dataset.tpAuthorFitKey = fitKey;
    return;
  }

  let names = [];
  try {
    names = JSON.parse(authors.dataset.tpAuthorNames || "[]");
  } catch {
    names = [];
  }
  if (!names.length) return;
  const candidates = authorSummaryCandidates(names);
  const trailingWidth =
    measureAuthorText(venue?.textContent || "", meta) +
    measureAuthorText(minisiteSeparator?.textContent || "", meta) +
    measureAuthorText(minisite?.textContent || "", meta);
  let chosen = candidates[candidates.length - 1];

  for (const candidate of candidates) {
    const candidateWidth = measureAuthorText(candidate.text, meta);
    if (candidateWidth + trailingWidth <= meta.clientWidth + 1) {
      chosen = candidate;
      break;
    }
  }

  short.textContent = chosen.text;
  short.dataset.tpAuthorsShown = String(chosen.shown);
  short.dataset.tpAuthorsHidden = String(chosen.hidden);
  meta.dataset.tpAuthorFitKey = fitKey;
}

function fitPaperTitle(head, generation) {
  if (!head || head.closest(".tp-entry--open") || head.clientWidth === 0) return;
  const fitKey = `${Math.round(head.clientWidth)}:${generation}`;
  if (head.dataset.tpTitleFitKey === fitKey) return;
  const short = head.querySelector("[data-tp-title-short]");
  const full = head.querySelector("[data-tp-title-full]");
  if (!short || !full) return;

  const fullText = full.textContent.trim();
  short.textContent = fullText;
  short.dataset.tpTitleTruncated = String(short.scrollWidth > short.clientWidth + 1);
  head.dataset.tpTitleFitKey = fitKey;
}

function minisiteLink(row) {
  const href = (row["Site: Link to Minisite"] || "").trim();
  return isValidLink(href) ? href : "";
}

function linkHtml(row) {
  const minisite = minisiteLink(row);
  const minisiteHtml = minisite
    ? `<a class="tp-source tp-source--minisite" href="${escapeHtml(minisite)}" target="_blank" rel="noopener noreferrer">Read online <span class="tp-minisite-cursor">&#9608;</span></a> `
    : "";
  const links = [
    ["View paper", row["Site: Link to Paper"] || row.Link],
    ["Alt source", row["Site: Alt Source"]],
    ["GitHub", row["Site: Link to Github"]],
    ["Blog", row["Site: Link to Blog Post"]],
  ].filter(([, href]) => isValidLink(href || ""));

  return minisiteHtml + links
    .map(
      ([label, href]) =>
        `<a class="tp-source" href="${escapeHtml(href.trim())}" target="_blank" rel="noopener noreferrer">${label} &rarr;</a>`,
    )
    .join(" ");
}

function entryHtml(row, index) {
  const title = (row["Title/Details"] || "").trim();
  const authors = (row["Site: List of Authors"] || "").trim();
  const venue = (row["Site: Venue"] || row.Venue || "").trim();
  const date = displayDate(row["Date (D/M/Y)"] || "");
  const hasMinisite = Boolean(minisiteLink(row));
  const blurb = (row["Site: Blurb"] || "").trim();
  const sourceLinks = linkHtml(row);
  const expandedBits = [
    blurb ? `<p class="tp-blurb">${escapeHtml(blurb)}</p>` : "",
    sourceLinks,
  ].join("");
  const headAssistive = date;

  return `<div class="tp-entry tp-entry--paper" data-tp-entry="${index}"><div class="tp-row" data-tp-row data-index="${index}"><span class="tp-chevron">&#10095;</span><span class="tp-num">${index + 1}.</span><div class="tp-body"><div class="tp-head tp-head--paper">${date ? `<span class="tp-date" aria-hidden="true">${escapeHtml(date)}</span>` : ""}<span class="tp-title tp-title-short" data-tp-title-short aria-hidden="true">${escapeHtml(title)}</span><span class="tp-title tp-title-full" data-tp-title-full>${escapeHtml(title)}</span>${headAssistive ? `<span class="tp-sr-only">, ${escapeHtml(headAssistive)}</span>` : ""}</div><div class="tp-meta tp-meta--paper">${authorsHtml(authors)}${venue ? `<span class="tp-venue" title="${escapeHtml(venue)}">${authors ? " &middot; " : ""}${escapeHtml(venue)}</span>` : ""}${hasMinisite && (authors || venue) ? '<span class="tp-minisite-separator">&nbsp;&middot;&nbsp;</span>' : ""}${hasMinisite ? '<span class="tp-minisite-avail tp-minisite-avail--meta">Mini-site available</span>' : ""}</div></div></div><div class="tp-expand" data-tp-expand>${expandedBits}</div></div>`;
}

// Injected styles for row-scroll mode (the shared stylesheet is a frozen Astro
// bundle). The ruler uses a 44px interaction column while keeping its visible
// terminal track narrow; this gives touch users a reliable target without
// turning the whole list into a vertical page-scroll trap.
const ROW_STYLE = `
.tp-bar-dim { color: var(--text-3); }
.tp-bar-thumb { color: var(--accent); }
.tp-counter--emphasis { color: var(--accent); font-weight: 700; font-size: 13px; letter-spacing: 0.3px; }
.tp-num.tp-num--marker { color: var(--text-bright, #d4d4d4); }
.tp--right-ruler .tp-bar { display: none; }
.tp-rowlist-layout { display: grid; grid-template-columns: minmax(0, 1fr) 44px; gap: 4px; align-items: stretch; }
.tp-rowlist { min-width: 0; touch-action: pan-y pinch-zoom; overscroll-behavior-y: auto; }
.tp-ruler { display: grid; grid-template-rows: repeat(${RULER_SEGMENTS}, minmax(2px, 1fr)); gap: 2px; min-height: 44px; padding: 6px 0; cursor: ns-resize; touch-action: none; user-select: none; -webkit-tap-highlight-color: transparent; }
.tp-ruler:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
.tp-ruler[aria-disabled="true"] { cursor: default; opacity: 0.6; }
.tp-ruler-seg { width: 4px; justify-self: center; background: var(--border); }
.tp-ruler-seg--visible { background: var(--accent); }
`;

function ensureRowStyle() {
  if (document.getElementById("tp-row-style")) return;
  const el = document.createElement("style");
  el.id = "tp-row-style";
  el.textContent = ROW_STYLE;
  document.head.appendChild(el);
}

function renderPapers(rows) {
  return SCROLL_MODE === "row" ? renderPapersRow(rows) : renderPapersPaged(rows);
}

function renderPapersRow(rows) {
  // Page-swap model, stride 1: all entries are pre-rendered once; a scroll
  // step just toggles which 10-entry window is visible (display none/""),
  // exactly like the original tp-page toggling but overlapping by 9 instead
  // of jumping by a whole page. No transform, no transition, no motion.
  const entries = rows.map((row, index) => entryHtml(row, index)).join("");
  const win = Math.min(PAGE_SIZE, rows.length);

  return `<div class="tp-rowlist" data-tp-rowlist>${entries}</div><div class="tp-status"><span class="tp-nav tp-nav--prev tp-nav--hidden" data-tp-prev>&lsaquo;</span><span class="tp-bar" data-tp-bar></span><span class="tp-nav tp-nav--next${rows.length <= PAGE_SIZE ? " tp-nav--hidden" : ""}" data-tp-next>&rsaquo;</span><span class="tp-counter" data-tp-counter>1&ndash;${win} of ${rows.length}</span><span class="tp-hint">&uarr;&darr; navigate &middot; &larr;&rarr; jump &middot; enter expand</span></div>`;
}

// ---------------------------------------------------------------------------
// Progress-bar prototypes for row-scroll mode. Exactly one is ACTIVE (wired
// up in initRowPicker's render() below); the other two are fully working and
// kept here — switch by commenting/uncommenting the calls at the bottom of
// render(). See the accompanying write-up for why (C) was chosen.
// ---------------------------------------------------------------------------

// (A) Fine-grained scrollbar thumb: one long track of dim glyphs with a
// contiguous teal block sized/positioned linearly to the visible window's
// position and size within the full list. Classic text scrollbar.
function renderBarThumb(barEl, top, maxTop, n, win) {
  const TRACK_LEN = 24;
  const thumbLen = Math.max(2, Math.round((TRACK_LEN * win) / n));
  const range = Math.max(1, TRACK_LEN - thumbLen);
  const thumbStart = maxTop > 0 ? Math.round((top / maxTop) * range) : 0;
  const before = "░".repeat(thumbStart);
  const thumb = "▓".repeat(thumbLen);
  const after = "░".repeat(Math.max(0, TRACK_LEN - thumbStart - thumbLen));
  barEl.innerHTML = `<span class="tp-bar-dim">${before}</span><span class="tp-bar-thumb">${thumb}</span><span class="tp-bar-dim">${after}</span>`;
}

// (B) Position-readout only: clears the old glyph track so another progress
// treatment (the active right-side ruler, in this trial) can carry the load.
function renderBarReadout(barEl) {
  barEl.innerHTML = "";
}

// (C) Nearest-decile single active segment: reuses the site's
// ORIGINAL five-segment bar styling verbatim — same ▓▓▓/░░░ glyphs, same
// .tp-seg/.tp-seg--active classes the events/news pickers below use — so it
// reads as a sibling of those widgets rather than a foreign scrollbar. Only
// one segment is ever lit (never a partial/overlap fill), recomputed as the
// window's nearest decile as it moves.
function renderBarDecile(barEl, top, maxTop, numSeg) {
  const activeSeg = maxTop > 0 ? Math.round((top / maxTop) * (numSeg - 1)) : 0;
  let html = "";
  for (let i = 0; i < numSeg; i += 1) {
    const isActive = i === activeSeg;
    html += `<span class="tp-seg${isActive ? " tp-seg--active" : ""}" data-tp-seg="${i}">${isActive ? "▓▓▓" : "░░░"}</span>`;
  }
  barEl.innerHTML = html;
}

function renderPapersPaged(rows) {
  const pages = [];

  for (let start = 0; start < rows.length; start += PAGE_SIZE) {
    const pageRows = rows.slice(start, start + PAGE_SIZE);
    const pageIndex = pages.length;
    const entries = pageRows
      .map((row, offset) => entryHtml(row, start + offset))
      .join("");

    pages.push(
      `<div class="tp-page${pageIndex === 0 ? " tp-page--active" : ""}" data-tp-page="${pageIndex}">${entries}</div>`,
    );
  }

  const segments = pages
    .map(
      (_, index) =>
        `<span class="tp-seg${index === 0 ? " tp-seg--active" : ""}" data-tp-seg="${index}">${index === 0 ? "\u2593\u2593\u2593" : "\u2591\u2591\u2591"}</span>`,
    )
    .join("");

  return `${pages.join("")}<div class="tp-status"><span class="tp-nav tp-nav--prev tp-nav--hidden" data-tp-prev>&lsaquo;</span><span class="tp-bar">${segments}</span><span class="tp-nav tp-nav--next${pages.length < 2 ? " tp-nav--hidden" : ""}" data-tp-next>&rsaquo;</span><span class="tp-counter" data-tp-counter>1&ndash;${Math.min(PAGE_SIZE, rows.length)} of ${rows.length}</span><span class="tp-hint">&uarr;&darr; navigate &middot; &larr;&rarr; page &middot; enter expand</span></div>`;
}

function initRowPicker(tp, winSize = PAGE_SIZE) {
  const rowlist = tp.querySelector("[data-tp-rowlist]");
  const entries = Array.from(tp.querySelectorAll("[data-tp-entry]"));
  const rowEls = Array.from(tp.querySelectorAll("[data-tp-row]"));
  const barEl = tp.querySelector("[data-tp-bar]");
  const counter = tp.querySelector("[data-tp-counter]");
  const prev = tp.querySelector("[data-tp-prev]");
  const next = tp.querySelector("[data-tp-next]");
  const n = entries.length;
  if (!rowlist || !n) return;

  ensureRowStyle();

  tp.classList.add("tp--right-ruler");
  const layout = document.createElement("div");
  layout.className = "tp-rowlist-layout";
  rowlist.before(layout);
  layout.appendChild(rowlist);

  const pickerId = ++pickerSerial;
  rowlist.id ||= `tp-rowlist-${pickerId}`;
  entries.forEach((entry, index) => {
    const row = rowEls[index];
    const expand = entry.querySelector("[data-tp-expand]");
    if (!row || !expand) return;
    expand.id ||= `tp-expand-${pickerId}-${index}`;
    row.setAttribute("aria-controls", expand.id);
    row.setAttribute("aria-expanded", "false");
  });
  const ruler = document.createElement("div");
  ruler.className = "tp-ruler";
  ruler.setAttribute("data-tp-ruler", "");
  ruler.setAttribute("role", "scrollbar");
  ruler.setAttribute("aria-controls", rowlist.id);
  ruler.setAttribute("aria-orientation", "vertical");
  ruler.setAttribute("aria-valuemin", "0");
  ruler.tabIndex = 0;
  ruler.innerHTML = Array.from(
    { length: RULER_SEGMENTS },
    () => '<span class="tp-ruler-seg" aria-hidden="true"></span>',
  ).join("");
  layout.appendChild(ruler);
  const rulerSegments = Array.from(ruler.querySelectorAll(".tp-ruler-seg"));

  const heading = tp.closest("section")?.querySelector("h2")?.textContent
    ?.replace(/\s+/g, " ")
    .trim();
  ruler.setAttribute("aria-label", `${heading || "List"} position`);

  // Every-5th-entry odometer marker: brighten the .tp-num of entries whose
  // 1-based number is divisible by 5 (5., 10., 15. …). Applied uniformly to
  // papers, events and news since all carry data-tp-entry + a .tp-num span.
  entries.forEach((entry) => {
    const idx = Number(entry.getAttribute("data-tp-entry"));
    const numEl = entry.querySelector(".tp-num");
    if (numEl && Number.isFinite(idx) && (idx + 1) % 5 === 0) {
      numEl.classList.add("tp-num--marker");
    }
  });

  const WIN = Math.min(winSize, n);
  const maxTop = Math.max(0, n - WIN);
  let top = 0;
  let active = 0;
  let openEntry = null;
  const hasPaperLayout = Boolean(rowlist.querySelector(".tp-entry--paper"));
  let paperFitFrame = 0;
  let paperFitGeneration = 0;

  function fitVisiblePaperLayout() {
    if (!hasPaperLayout) return;
    for (let index = top; index < Math.min(top + WIN, n); index += 1) {
      const entry = entries[index];
      fitPaperTitle(entry.querySelector(".tp-head--paper"), paperFitGeneration);
      fitAuthorSummary(entry.querySelector(".tp-meta--paper"), paperFitGeneration);
    }
  }

  function queuePaperFit() {
    if (!hasPaperLayout) return;
    cancelAnimationFrame(paperFitFrame);
    paperFitFrame = requestAnimationFrame(() => {
      fitVisiblePaperLayout();
    });
  }

  function invalidatePaperFit() {
    paperFitGeneration += 1;
    queuePaperFit();
  }

  let observedPaperWidth = 0;
  const paperResizeObserver = hasPaperLayout && "ResizeObserver" in window
    ? new ResizeObserver(([observation]) => {
        const width = Math.round(observation.contentRect.width);
        if (width === observedPaperWidth) return;
        observedPaperWidth = width;
        invalidatePaperFit();
      })
    : null;
  paperResizeObserver?.observe(rowlist);
  if (hasPaperLayout && !paperResizeObserver) {
    window.addEventListener("resize", invalidatePaperFit, { passive: true });
  }
  if (hasPaperLayout && document.fonts) {
    document.fonts.ready.then(invalidatePaperFit);
    document.fonts.addEventListener?.("loadingdone", invalidatePaperFit);
  }

  function renderRuler(start, end) {
    rulerSegments.forEach((segment, index) => {
      const segmentStart = (index / RULER_SEGMENTS) * n;
      const segmentEnd = ((index + 1) / RULER_SEGMENTS) * n;
      segment.classList.toggle(
        "tp-ruler-seg--visible",
        segmentEnd > top && segmentStart < end,
      );
    });
    ruler.setAttribute("aria-valuemax", String(maxTop));
    ruler.setAttribute("aria-valuenow", String(top));
    ruler.setAttribute("aria-valuetext", `Showing ${start} through ${end} of ${n}`);
    ruler.setAttribute("aria-disabled", maxTop === 0 ? "true" : "false");
  }

  function render() {
    // Page-swap, stride 1: just toggle which entries are visible. No
    // transform/height bookkeeping — each window renders at its own natural
    // height, exactly like the original per-page swap did.
    entries.forEach((entry, index) => {
      entry.style.display = index >= top && index < top + WIN ? "" : "none";
    });

    rowEls.forEach((row, index) => row.classList.toggle("tp-row--active", index === active));

    const start = top + 1;
    const end = Math.min(top + WIN, n);
    if (counter) counter.innerHTML = `${start}&ndash;${end} of ${n}`;
    renderRuler(start, end);

    if (barEl) {
      renderBarReadout(barEl); // replaced by the proportional right-side ruler
      // renderBarThumb(barEl, top, maxTop, n, WIN); // option A — fine-grained scrollbar thumb
      // renderBarDecile(barEl, top, maxTop, Math.max(1, Math.ceil(n / winSize))); // option C
      counter?.classList.remove("tp-counter--emphasis"); // only option B enables this
      // counter?.classList.add("tp-counter--emphasis"); // uncomment together with renderBarReadout above
    }

    if (prev) prev.classList.toggle("tp-nav--hidden", top === 0);
    if (next) next.classList.toggle("tp-nav--hidden", top >= maxTop);
    fitVisiblePaperLayout();
  }

  function setTop(nextTop) {
    const clamped = Math.max(0, Math.min(maxTop, nextTop));
    if (clamped === top) return false;
    top = clamped;
    if (active < top) active = top;
    else if (active > top + WIN - 1) active = top + WIN - 1;
    render();
    return true;
  }

  function setActive(index) {
    active = Math.max(0, Math.min(n - 1, index));
    // Scroll the window so the active row stays visible.
    if (active < top) top = active;
    else if (active > top + WIN - 1) top = active - WIN + 1;
    top = Math.max(0, Math.min(maxTop, top));
    render();
  }

  function toggleEntry(index) {
    const nextOpen = openEntry === index ? null : index;
    if (openEntry !== null) {
      entries[openEntry].classList.remove("tp-entry--open");
      rowEls[openEntry]?.setAttribute("aria-expanded", "false");
    }
    openEntry = nextOpen;
    if (openEntry !== null) {
      entries[openEntry].classList.add("tp-entry--open");
      rowEls[openEntry]?.setAttribute("aria-expanded", "true");
    }
    render();
  }

  let suppressClickUntil = 0;
  rowEls.forEach((row, index) => {
    row.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        return;
      }
      if (event.target.closest(".tp-source")) return;
      active = index;
      toggleEntry(index);
    });
    row.addEventListener("mouseenter", () => {
      active = index;
      rowEls.forEach((r, i) => r.classList.toggle("tp-row--active", i === active));
    });
  });

  prev?.addEventListener("click", () => setTop(top - WIN));
  next?.addEventListener("click", () => setTop(top + WIN));

  // Delta accumulation only — no rate cap. High-res/trackpad wheels split a
  // single physical detent into a burst of small-deltaY events, so we sum
  // |deltaY| and step once the accumulator crosses ~one detent's worth of
  // scroll (resetting on direction change), rather than gating on elapsed
  // time. Because a step is now just an instant visibility swap (no
  // animation to wait out), each crossing steps immediately.
  //
  // IMPORTANT: on a firing, the accumulator is reset fully to 0 (remainder
  // discarded), NOT decremented by exactly WHEEL_STEP_PX. A classic mouse
  // reports ~120px per detent — comfortably over a 100px threshold — so
  // decrementing by only 100 leaves a 20px carry on every single detent;
  // after 5 consecutive detents that carry compounds to a full extra 100px
  // and silently double-steps once. Resetting to 0 makes each real detent
  // map to exactly one step, forever, with no drift. A single oversized
  // event (e.g. a coalesced multi-notch flick) still awards multiple
  // immediate steps via the floor division below.
  let wheelAccum = 0;
  let wheelDir = 0;
  const WHEEL_STEP_PX = 100;
  tp.addEventListener(
    "wheel",
    (event) => {
      const dir = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (!dir) return;
      const canMove = dir > 0 ? top < maxTop : top > 0;
      if (!canMove) {
        wheelAccum = 0;
        wheelDir = dir;
        return;
      }
      event.preventDefault();
      if (dir !== wheelDir) {
        wheelDir = dir;
        wheelAccum = 0;
      }
      wheelAccum += Math.abs(event.deltaY);
      const steps = Math.floor(wheelAccum / WHEEL_STEP_PX);
      if (steps > 0) {
        for (let s = 0; s < steps; s += 1) setTop(top + dir);
        wheelAccum = 0;
      }
    },
    { passive: false },
  );

  // Touching the list itself preserves normal vertical page scrolling. A
  // deliberate sideways swipe commits exactly one row step on release, with no
  // transform, drag preview or momentum animation.
  let rowPointer = null;
  rowlist.addEventListener("pointerdown", (event) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      !["touch", "pen"].includes(event.pointerType)
    ) return;
    if (event.target.closest("a, button, input, select, textarea")) return;
    rowPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  rowlist.addEventListener("pointerup", (event) => {
    if (!rowPointer || rowPointer.id !== event.pointerId) return;
    const dx = event.clientX - rowPointer.x;
    const dy = event.clientY - rowPointer.y;
    rowPointer = null;
    if (Math.abs(dx) < TOUCH_SWIPE_PX || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    suppressClickUntil = Date.now() + 350;
    setTop(top + (dx < 0 ? 1 : -1));
    event.preventDefault();
  });
  rowlist.addEventListener("pointercancel", () => {
    rowPointer = null;
  });

  // The ruler is the dedicated vertical touch surface. A short tap jumps
  // directly to that proportional position; a vertical swipe moves one row.
  // State changes only on release, so the list always snaps rather than slides.
  let rulerPointer = null;
  function topFromRulerY(clientY) {
    const rect = ruler.getBoundingClientRect();
    if (!rect.height || !maxTop) return 0;
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return Math.round(ratio * maxTop);
  }
  ruler.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    rulerPointer = { id: event.pointerId, y: event.clientY };
    ruler.focus({ preventScroll: true });
    ruler.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  ruler.addEventListener("pointerup", (event) => {
    if (!rulerPointer || rulerPointer.id !== event.pointerId) return;
    const dy = event.clientY - rulerPointer.y;
    rulerPointer = null;
    if (Math.abs(dy) >= RULER_SWIPE_PX) {
      setTop(top + (dy < 0 ? 1 : -1));
    } else {
      setTop(topFromRulerY(event.clientY));
    }
    event.preventDefault();
  });
  ruler.addEventListener("pointercancel", () => {
    rulerPointer = null;
  });
  ruler.addEventListener("keydown", (event) => {
    let handled = true;
    if (event.key === "ArrowDown") setTop(top + 1);
    else if (event.key === "ArrowUp") setTop(top - 1);
    else if (event.key === "PageDown") setTop(top + WIN);
    else if (event.key === "PageUp") setTop(top - WIN);
    else if (event.key === "Home") setTop(0);
    else if (event.key === "End") setTop(maxTop);
    else handled = false;
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  tp.addEventListener("keydown", (event) => {
    if (event.target.closest("[data-tp-ruler]")) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(active + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setTop(top + WIN);
      setActive(top);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setTop(top - WIN);
      setActive(top);
    } else if (event.key === "Enter") {
      event.preventDefault();
      toggleEntry(active);
    } else if (event.key === "Escape" && openEntry !== null) {
      event.preventDefault();
      toggleEntry(openEntry);
    }
  });

  render();
}

// Convert a statically pre-paginated picker (events/news: entries split across
// [data-tp-page] divs of N) into the same flat single-list structure the papers
// runtime produces, so it can be driven by the shared stride-1 row machinery.
// Preserves entry order and all inner markup; reuses the existing tp-status
// controls (prev/bar/next/counter) verbatim — the bar just gets a data-tp-bar
// hook so renderBarDecile can repaint its segments. Returns the window size.
function flattenStaticPicker(tp) {
  const winSize = Number(tp.dataset.tpPageSize) || PAGE_SIZE;
  const status = tp.querySelector(".tp-status");
  const entries = Array.from(tp.querySelectorAll("[data-tp-entry]"));

  const rowlist = document.createElement("div");
  rowlist.className = "tp-rowlist";
  rowlist.setAttribute("data-tp-rowlist", "");
  entries.forEach((entry) => rowlist.appendChild(entry)); // moves in-order

  tp.querySelectorAll("[data-tp-page]").forEach((page) => page.remove());
  if (status) tp.insertBefore(rowlist, status);
  else tp.appendChild(rowlist);

  const bar = tp.querySelector(".tp-bar");
  if (bar && !bar.hasAttribute("data-tp-bar")) bar.setAttribute("data-tp-bar", "");

  return winSize;
}

function initTerminalPicker(tp) {
  if (!tp || tp.dataset.tpBound === "true") return;
  tp.dataset.tpBound = "true";

  // Papers runtime widget: already rendered as a flat rowlist in row mode.
  if (tp.querySelector("[data-tp-rowlist]")) {
    initRowPicker(tp, PAGE_SIZE);
    return;
  }

  // Static pickers (events/news) in row mode: flatten their pages into one
  // rowlist and drive with the same stride-1 machinery, window = page size.
  if (SCROLL_MODE === "row" && tp.dataset.tpPageSize) {
    const winSize = flattenStaticPicker(tp);
    initRowPicker(tp, winSize);
    return;
  }

  // Original paged behaviour (page mode, or any widget without a page size).

  const rows = Array.from(tp.querySelectorAll("[data-tp-row]"));
  const pages = Array.from(tp.querySelectorAll("[data-tp-page]"));
  const segments = Array.from(tp.querySelectorAll("[data-tp-seg]"));
  const counter = tp.querySelector("[data-tp-counter]");
  const prev = tp.querySelector("[data-tp-prev]");
  const next = tp.querySelector("[data-tp-next]");
  let active = 0;
  let openEntry = null;

  if (!rows.length) return;

  function setActive(index, shouldScroll = false) {
    active = Math.max(0, Math.min(rows.length - 1, index));
    const page = Math.floor(active / PAGE_SIZE);
    const total = rows.length;
    const pageStart = page * PAGE_SIZE + 1;
    const pageEnd = Math.min(pageStart + PAGE_SIZE - 1, total);

    pages.forEach((el, pageIndex) => el.classList.toggle("tp-page--active", pageIndex === page));
    rows.forEach((row, rowIndex) => {
      const selected = rowIndex === active;
      row.classList.toggle("tp-row--active", selected);
      if (selected && shouldScroll) row.scrollIntoView({ block: "nearest" });
    });
    segments.forEach((segment, segmentIndex) => {
      const selected = segmentIndex === page;
      segment.classList.toggle("tp-seg--active", selected);
      segment.textContent = selected ? "\u2593\u2593\u2593" : "\u2591\u2591\u2591";
    });
    if (counter) counter.innerHTML = `${pageStart}&ndash;${pageEnd} of ${total}`;
    if (prev) prev.classList.toggle("tp-nav--hidden", page === 0);
    if (next) next.classList.toggle("tp-nav--hidden", page === pages.length - 1);
  }

  function toggleEntry(index) {
    const nextOpen = openEntry === index ? null : index;
    if (openEntry !== null) {
      rows[openEntry]?.closest("[data-tp-entry]")?.classList.remove("tp-entry--open");
    }
    openEntry = nextOpen;
    if (openEntry !== null) {
      rows[openEntry]?.closest("[data-tp-entry]")?.classList.add("tp-entry--open");
    }
  }

  rows.forEach((row, index) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".tp-source")) return;
      setActive(index);
      toggleEntry(index);
    });
    row.addEventListener("mouseenter", () => setActive(index));
  });
  prev?.addEventListener("click", () => setActive(active - PAGE_SIZE, true));
  next?.addEventListener("click", () => setActive(active + PAGE_SIZE, true));
  let wheelDelta = 0;
  tp.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      wheelDelta += event.deltaY;
      if (wheelDelta > 60) {
        setActive(active + PAGE_SIZE, true);
        wheelDelta = 0;
      } else if (wheelDelta < -60) {
        setActive(active - PAGE_SIZE, true);
        wheelDelta = 0;
      }
    },
    { passive: false },
  );
  tp.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(active + 1, true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(active - 1, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(active + PAGE_SIZE, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(active - PAGE_SIZE, true);
    } else if (event.key === "Enter") {
      event.preventDefault();
      toggleEntry(active);
    } else if (event.key === "Escape" && openEntry !== null) {
      event.preventDefault();
      toggleEntry(openEntry);
    }
  });

  setActive(0);
}

function initAllTerminalPickers() {
  document.querySelectorAll("[data-tp]").forEach(initTerminalPicker);
}

async function loadPapers() {
  const target = document.querySelector("[data-papers-runtime]");
  if (!target) {
    initAllTerminalPickers();
    return;
  }

  try {
    ensureMinisiteStyle();
    const response = await fetch(CSV_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`CSV request failed: ${response.status}`);
    const rows = visiblePapers(parseCsv(await response.text()));
    target.innerHTML = rows.length
      ? renderPapers(rows)
      : '<div class="tp-page tp-page--active" data-tp-page="0"><div class="tp-entry tp-entry--open"><div class="tp-row tp-row--active"><span class="tp-chevron">&#10095;</span><div class="tp-body"><div class="tp-head"><span class="tp-title">No visible papers found.</span></div></div></div></div></div>';
  } catch (error) {
    target.innerHTML = `<div class="tp-page tp-page--active" data-tp-page="0"><div class="tp-entry tp-entry--open"><div class="tp-row tp-row--active"><span class="tp-chevron">&#10095;</span><div class="tp-body"><div class="tp-head"><span class="tp-title">Could not load papers CSV.</span></div><div class="tp-meta">${escapeHtml(error.message)}</div></div></div></div></div>`;
  }

  initAllTerminalPickers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPapers);
} else {
  loadPapers();
}
