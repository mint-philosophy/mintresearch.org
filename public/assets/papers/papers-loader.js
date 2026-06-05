const CSV_URL = "/assets/papers/latest-paper-deliverables.csv";
const PAGE_SIZE = 5;

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

function linkHtml(row) {
  const links = [
    ["View paper", row["Site: Link to Paper"] || row.Link],
    ["Alt source", row["Site: Alt Source"]],
    ["GitHub", row["Site: Link to Github"]],
    ["Blog", row["Site: Link to Blog Post"]],
  ].filter(([, href]) => isValidLink(href || ""));

  return links
    .map(
      ([label, href]) =>
        `<a class="tp-source" href="${escapeHtml(href.trim())}" target="_blank" rel="noopener noreferrer">${label} &rarr;</a>`,
    )
    .join(" ");
}

function renderPapers(rows) {
  const pages = [];

  for (let start = 0; start < rows.length; start += PAGE_SIZE) {
    const pageRows = rows.slice(start, start + PAGE_SIZE);
    const pageIndex = pages.length;
    const entries = pageRows
      .map((row, offset) => {
        const index = start + offset;
        const title = row["Title/Details"].trim();
        const authors = row["Site: List of Authors"].trim();
        const venue = (row["Site: Venue"] || row.Venue).trim();
        const blurb = row["Site: Blurb"].trim();
        const sourceLinks = linkHtml(row);
        const expandedBits = [
          blurb ? `<p class="tp-blurb">${escapeHtml(blurb)}</p>` : "",
          sourceLinks,
        ].join("");

        return `<div class="tp-entry" data-tp-entry="${index}"><div class="tp-row" data-tp-row data-index="${index}"><span class="tp-chevron">&#10095;</span><span class="tp-num">${index + 1}.</span><div class="tp-body"><div class="tp-head"><span class="tp-title">${escapeHtml(title)}</span><span class="tp-date">${escapeHtml(displayDate(row["Date (D/M/Y)"]))}</span></div><div class="tp-meta">${escapeHtml(authors)}${venue ? `<span class="tp-venue"> · ${escapeHtml(venue)}</span>` : ""}</div></div></div><div class="tp-expand" data-tp-expand>${expandedBits}</div></div>`;
      })
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

function initTerminalPicker(tp) {
  if (!tp || tp.dataset.tpBound === "true") return;
  tp.dataset.tpBound = "true";

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
