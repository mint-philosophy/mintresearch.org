const CSV_URL = "/assets/people/latest-people.csv";
const VISIBLE_SECTIONS = ["Team", "Affiliate", "Alumni"];

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

function cleanValue(value) {
  const cleaned = String(value || "").trim();
  return cleaned === "??" ? "" : cleaned;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeHref(value) {
  const href = cleanValue(value);
  return /^https?:\/\//i.test(href) || /^\/(?!\/)/.test(href);
}

function sortOrder(row) {
  const value = Number(row["Site: Sort Order"]);
  return Number.isFinite(value) && value > 0 ? value : Number.POSITIVE_INFINITY;
}

function linksFromRow(row) {
  const links = [];
  for (let index = 1; index <= 3; index += 1) {
    const label = cleanValue(row[`Site: Link ${index} Label`]);
    const url = cleanValue(row[`Site: Link ${index} URL`]);
    if (label && isSafeHref(url)) links.push({ label, url });
  }
  return links;
}

function headshotFromRow(row) {
  const direct = cleanValue(row["Site: headshot link"]);
  if (isSafeHref(direct)) return direct;

  const id = cleanValue(row["Site: id"]);
  return id ? `/assets/people/${encodeURIComponent(id)}.jpg` : "";
}

function personFromRow(row) {
  return {
    name: cleanValue(row.Name),
    section: cleanValue(row["Site: Section"]),
    order: sortOrder(row),
    role: cleanValue(row["Site: Role"]),
    disc: cleanValue(row["Site: Discipline"]),
    affiliation: cleanValue(row["Site: Affiliation"]),
    bio: cleanValue(row["Site: Bio"]),
    headshot: headshotFromRow(row),
    links: linksFromRow(row),
  };
}

function visiblePeople(rows) {
  return rows
    .filter((row) => cleanValue(row["Site: Public?"]).toLowerCase() === "yes")
    .map(personFromRow)
    .filter((person) => person.name && VISIBLE_SECTIONS.includes(person.section))
    .sort(
      (a, b) =>
        VISIBLE_SECTIONS.indexOf(a.section) - VISIBLE_SECTIONS.indexOf(b.section) ||
        a.order - b.order ||
        a.name.localeCompare(b.name),
    );
}

function displayField(value) {
  return value ? escapeHtml(value) : "&nbsp;";
}

function teamCardHtml(person, index) {
  return `<div class="person-card" data-person-idx="${index}" role="button" tabindex="0" aria-controls="personDetail" aria-expanded="false"><div class="person-name">${escapeHtml(person.name)}</div><div class="person-role">${displayField(person.role)}</div><div class="person-disc">${displayField(person.disc)}</div></div>`;
}

function compactCardHtml(person) {
  return `<div class="person-card person-card--compact"><div class="person-name">${escapeHtml(person.name)}</div><div class="person-disc">${displayField(person.disc)}</div></div>`;
}

function renderPeople(people) {
  const team = people.filter((person) => person.section === "Team");
  const affiliates = people.filter((person) => person.section === "Affiliate");
  const alumni = people.filter((person) => person.section === "Alumni");

  return {
    team,
    html: `
      <h3>Team</h3>
      <div class="person-detail" id="personDetail">
        <div class="person-detail-inner">
          <button class="person-detail-close" id="personDetailClose" aria-label="Close person details">&times;</button>
          <div class="person-detail-body">
            <div class="person-detail-photo" id="personDetailPhoto"></div>
            <div class="person-detail-facts" id="personDetailFacts"></div>
          </div>
        </div>
      </div>
      <div class="people-grid">
        ${team.length ? team.map(teamCardHtml).join("") : '<div class="person-card"><div class="person-name">No team members found.</div></div>'}
      </div>
      <h3>Affiliates</h3>
      <div class="people-grid people-grid--compact">
        ${affiliates.map(compactCardHtml).join("")}
      </div>
      <details class="lab-accordion" style="margin-top: 16px;">
        <summary>Alumni (${alumni.length})</summary>
        <div class="accordion-inner">
          <div class="people-grid people-grid--compact">
            ${alumni.map(compactCardHtml).join("")}
          </div>
        </div>
      </details>
    `,
  };
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
}

function renderDetailPhoto(target, person) {
  target.replaceChildren();

  const fallback = () => {
    target.replaceChildren();
    const text = document.createElement("span");
    text.className = "person-initials";
    text.textContent = initials(person.name);
    target.appendChild(text);
  };

  if (!person.headshot) {
    fallback();
    return;
  }

  const image = document.createElement("img");
  image.src = person.headshot;
  image.alt = person.name;
  image.addEventListener("error", fallback, { once: true });
  target.appendChild(image);
}

function detailFactsHtml(person) {
  const links = person.links
    .map(
      ({ label, url }) =>
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
    )
    .join("");

  return `
    <div class="pf-name">${escapeHtml(person.name)}</div>
    <div class="pf-row"><span class="pf-label">role</span><span class="pf-value">${escapeHtml(person.role)}</span></div>
    <div class="pf-row"><span class="pf-label">field</span><span class="pf-value">${escapeHtml(person.disc)}</span></div>
    <div class="pf-row"><span class="pf-label">affil</span><span class="pf-value">${escapeHtml(person.affiliation)}</span></div>
    <div class="pf-bio">${escapeHtml(person.bio)}</div>
    ${links ? `<div class="pf-links">${links}</div>` : ""}
  `;
}

function bindTeamDetails(team) {
  const detail = document.getElementById("personDetail");
  const photo = document.getElementById("personDetailPhoto");
  const facts = document.getElementById("personDetailFacts");
  const close = document.getElementById("personDetailClose");
  const cards = Array.from(document.querySelectorAll(".person-card[data-person-idx]"));
  if (!detail || !photo || !facts) return;

  let selectedIndex = -1;

  const hideDetail = () => {
    detail.classList.remove("open");
    selectedIndex = -1;
    cards.forEach((card) => {
      card.classList.remove("selected");
      card.setAttribute("aria-expanded", "false");
    });
  };

  const toggleDetail = (card) => {
    const index = Number(card.dataset.personIdx);
    const person = team[index];
    if (!person) return;
    if (index === selectedIndex) {
      hideDetail();
      return;
    }

    renderDetailPhoto(photo, person);
    facts.innerHTML = detailFactsHtml(person);
    detail.classList.add("open");
    selectedIndex = index;
    cards.forEach((candidate) => {
      const selected = candidate === card;
      candidate.classList.toggle("selected", selected);
      candidate.setAttribute("aria-expanded", selected ? "true" : "false");
    });
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => toggleDetail(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDetail(card);
      }
    });
  });
  close?.addEventListener("click", hideDetail);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectedIndex !== -1) hideDetail();
  });
}

async function loadPeople() {
  const target = document.querySelector("[data-people-runtime]");
  if (!target) return;

  try {
    const response = await fetch(CSV_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`CSV request failed: ${response.status}`);
    const people = visiblePeople(parseCsv(await response.text()));
    const rendered = renderPeople(people);
    target.innerHTML = rendered.html;
    bindTeamDetails(rendered.team);
  } catch (error) {
    target.innerHTML = `<h3>Team</h3><div class="people-grid people-grid--compact"><div class="person-card person-card--compact"><div class="person-name">Could not load people CSV.</div><div class="person-disc">${escapeHtml(error.message)}</div></div></div>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPeople);
} else {
  loadPeople();
}
