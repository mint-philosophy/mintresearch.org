#!/usr/bin/env python3
"""
Generate chatbot content records from the public website sources.

The floating Minty helper uses OpenAI file_search over uploaded local files.
This script turns everything a visitor can read on mintresearch.org into
markdown records: newsletters, research reports, Seth Lazar's CV, the lab
people roster, and the visible text of the static HTML pages (home, guide,
lab overview, agent reports, newsletter landing page).

Filenames are deterministic across runs — they key incremental sync. Stale
.md files in the output directory (records no longer generated, e.g. an
unpublished newsletter) are deleted, except for the snapshot record written
by build_snapshot.py (00-lab-snapshot.md) and manifest.json.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[1]
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "generated-site-content"
SITE_BASE_URL = "https://mintresearch.org"

# Files in the output dir that this script does not own and must not delete.
PRESERVED_FILES = {"00-lab-snapshot.md"}

# Static HTML pages: (output stem, relative path, canonical URL, purpose).
HTML_PAGES: list[tuple[str, str, str, str]] = [
    (
        "page-home",
        "public/index.html",
        f"{SITE_BASE_URL}/",
        "MINT Lab homepage — About, Research Projects, People, Papers, Events, News, Contact",
    ),
    (
        "page-guide",
        "public/guide/index.html",
        f"{SITE_BASE_URL}/guide/",
        "Lab Infrastructure Guide (Agentic Research Infrastructure for AI Alignment, Governance and Adaptation)",
    ),
    (
        "page-lab-overview",
        "public/lab-overview/index.html",
        f"{SITE_BASE_URL}/lab-overview/",
        "Lab Overview — Can Machines Reason Morally?",
    ),
    (
        "page-agent-reports",
        "public/agent-reports/index.html",
        f"{SITE_BASE_URL}/agent-reports/",
        "Agent Reports index — AI-agent-written research reports",
    ),
    (
        "page-newsletter-landing",
        "public/newsletter/index.html",
        f"{SITE_BASE_URL}/newsletter/",
        "Newsletter landing page — Minty's Week in AI archive",
    ),
]


def generated_timestamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def record_header(source_path: Path, canonical_url: str) -> str:
    # No timestamp here: records are hashed to decide whether the vector
    # store needs a rebuild, so headers must be stable when content is.
    # Generation time lives in manifest.json, which is not hashed.
    return (
        "<!--\n"
        "Generated for the Minty website helper (mintresearch.org chatbot).\n"
        f"Source: {source_path.relative_to(REPO_DIR)}\n"
        f"Canonical URL: {canonical_url}\n"
        "-->\n"
    )


# --------------------------------------------------------------------------
# Astro markdown pages (newsletters, reports)
# --------------------------------------------------------------------------


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Parse simple `key: value` frontmatter between --- fences."""
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n?", text, re.S)
    if not match:
        return {}, text
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        pair = re.match(r"^(\w+):\s*(.*)$", line)
        if not pair:
            continue
        key, value = pair.group(1), pair.group(2).strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]
        fields[key] = value
    return fields, text[match.end():]


def render_astro_page(
    source_path: Path,
    canonical_url: str,
    kind_label: str,
) -> str:
    fields, body = parse_frontmatter(source_path.read_text(encoding="utf-8"))
    title = fields.get("title", source_path.stem)
    date_label = fields.get("dateLabel") or fields.get("date") or ""
    heading = f"# {kind_label}: {title}"
    if date_label:
        heading += f" ({date_label})"

    lines = [record_header(source_path, canonical_url), heading, ""]
    if fields:
        lines.append("## Frontmatter")
        lines.append("")
        for key, value in fields.items():
            if key == "layout":
                continue
            lines.append(f"- {key}: {value}")
        lines.append("")
    lines.append(body.strip())
    return "\n".join(lines).rstrip() + "\n"


def generate_astro_records(
    subdir: str,
    prefix: str,
    kind_label: str,
    output_dir: Path,
) -> dict[str, str]:
    """Return {filename: content} for every markdown page in src/pages/<subdir>."""
    pages_dir = REPO_DIR / "src" / "pages" / subdir
    records: dict[str, str] = {}
    if not pages_dir.is_dir():
        print(f"WARNING: missing directory {pages_dir}", file=sys.stderr)
        return records
    for source_path in sorted(pages_dir.glob("*.md")):
        canonical_url = f"{SITE_BASE_URL}/{subdir}/{source_path.stem}/"
        filename = f"{prefix}-{source_path.stem}.md"
        records[filename] = render_astro_page(source_path, canonical_url, kind_label)
    return records


# --------------------------------------------------------------------------
# CV (src/data/cv.json)
# --------------------------------------------------------------------------


def cv_entry_lines(entry: dict) -> list[str]:
    when = str(entry.get("years") or entry.get("year") or "").strip()
    text = (entry.get("text") or entry.get("citation") or "").strip()
    line = f"- {when}: {text}" if when else f"- {text}"
    lines = [line]
    details = (entry.get("details") or "").strip()
    if details:
        lines.append(f"  - Details: {details}")
    abstract = (entry.get("abstract") or "").strip()
    if abstract:
        lines.append(f"  - Abstract: {abstract}")
    return lines


def render_cv(source_path: Path) -> str:
    data = json.loads(source_path.read_text(encoding="utf-8"))
    meta = data.get("meta", {})
    name = meta.get("name", "Seth Lazar")

    lines = [
        record_header(source_path, f"{SITE_BASE_URL}/cv/"),
        f"# Curriculum Vitae: {name}",
        "",
        f"- Title: {meta.get('title', '')}",
        f"- Department: {meta.get('department', '')}",
        f"- Institution: {meta.get('institution', '')}",
        f"- Email: {meta.get('email', '')}",
        f"- Websites: {', '.join(meta.get('websites', []))}",
        f"- Lab: {meta.get('lab', '')}",
        "",
    ]

    for section in data.get("sections", []):
        heading = section.get("heading", section.get("id", "Section"))
        section_type = section.get("type", "entries")
        lines.extend([f"## {heading}", ""])

        if section_type == "entries":
            for entry in section.get("entries", []):
                lines.extend(cv_entry_lines(entry))
            lines.append("")
        elif section_type == "grouped":
            for group in section.get("groups", []):
                lines.extend([f"### {group.get('heading', '')}", ""])
                for entry in group.get("entries", []):
                    lines.extend(cv_entry_lines(entry))
                lines.append("")
        elif section_type == "text":
            content = (section.get("content") or "").replace("\t", " — ")
            lines.extend([content.strip(), ""])
        else:
            print(
                f"WARNING: unknown CV section type {section_type!r} in {section.get('id')}",
                file=sys.stderr,
            )

    return "\n".join(lines).rstrip() + "\n"


# --------------------------------------------------------------------------
# People (src/data/people.ts) — data-only TypeScript array
# --------------------------------------------------------------------------


class TSDataParser:
    """Minimal recursive parser for data-only TypeScript literals."""

    def __init__(self, text: str) -> None:
        self.text = text
        self.pos = 0

    def error(self, message: str) -> ValueError:
        return ValueError(f"{message} at offset {self.pos}")

    def skip_ws(self) -> None:
        while self.pos < len(self.text):
            char = self.text[self.pos]
            if char.isspace():
                self.pos += 1
            elif self.text.startswith("//", self.pos):
                newline = self.text.find("\n", self.pos)
                self.pos = len(self.text) if newline == -1 else newline
            elif self.text.startswith("/*", self.pos):
                end = self.text.find("*/", self.pos)
                if end == -1:
                    raise self.error("unterminated comment")
                self.pos = end + 2
            else:
                return

    def parse_value(self):
        self.skip_ws()
        char = self.text[self.pos]
        if char == "[":
            return self.parse_array()
        if char == "{":
            return self.parse_object()
        if char in {"'", '"', "`"}:
            return self.parse_string()
        word = re.match(r"true|false|null|undefined|-?[0-9.]+", self.text[self.pos:])
        if word:
            token = word.group(0)
            self.pos += len(token)
            if token == "true":
                return True
            if token == "false":
                return False
            if token in {"null", "undefined"}:
                return None
            return float(token) if "." in token else int(token)
        raise self.error(f"unexpected character {char!r}")

    def parse_string(self) -> str:
        quote = self.text[self.pos]
        self.pos += 1
        chunks: list[str] = []
        escapes = {"n": "\n", "t": "\t", "r": "\r", quote: quote, "\\": "\\"}
        while self.pos < len(self.text):
            char = self.text[self.pos]
            if char == "\\":
                escape = self.text[self.pos + 1]
                chunks.append(escapes.get(escape, escape))
                self.pos += 2
            elif char == quote:
                self.pos += 1
                return "".join(chunks)
            else:
                chunks.append(char)
                self.pos += 1
        raise self.error("unterminated string")

    def parse_array(self) -> list:
        self.pos += 1  # consume [
        items: list = []
        while True:
            self.skip_ws()
            if self.text[self.pos] == "]":
                self.pos += 1
                return items
            items.append(self.parse_value())
            self.skip_ws()
            if self.text[self.pos] == ",":
                self.pos += 1

    def parse_object(self) -> dict:
        self.pos += 1  # consume {
        obj: dict = {}
        while True:
            self.skip_ws()
            if self.text[self.pos] == "}":
                self.pos += 1
                return obj
            key_match = re.match(r"[A-Za-z_$][\w$]*", self.text[self.pos:])
            if not key_match:
                raise self.error("expected object key")
            key = key_match.group(0)
            self.pos += len(key)
            self.skip_ws()
            if self.text[self.pos] != ":":
                raise self.error("expected ':' after object key")
            self.pos += 1
            obj[key] = self.parse_value()
            self.skip_ws()
            if self.text[self.pos] == ",":
                self.pos += 1


def parse_people(source_path: Path) -> list[dict]:
    text = source_path.read_text(encoding="utf-8")
    match = re.search(r"export const teamMembers\s*:[^=]*=\s*(\[)", text)
    if not match:
        raise ValueError(f"could not find teamMembers array in {source_path}")
    parser = TSDataParser(text)
    parser.pos = match.start(1)
    people = parser.parse_array()
    if not isinstance(people, list) or not people:
        raise ValueError(f"teamMembers parsed empty from {source_path}")
    return people


def render_people(source_path: Path) -> str:
    people = parse_people(source_path)
    lines = [
        record_header(source_path, f"{SITE_BASE_URL}/#people"),
        "# MINT Lab People",
        "",
        f"Current roster of MINT Lab team members ({len(people)} people), as",
        "shown in the People section of mintresearch.org.",
        "",
    ]
    for person in people:
        lines.extend([f"## {person.get('name', 'Unknown')}", ""])
        lines.append(f"- Role: {person.get('role', '')}")
        lines.append(f"- Discipline: {person.get('disc', '')}")
        lines.append(f"- Affiliation: {person.get('affiliation', '')}")
        for link in person.get("links") or []:
            url = link.get("url", "")
            if url.startswith("/"):
                url = f"{SITE_BASE_URL}{url}"
            lines.append(f"- {link.get('label', 'Link')}: {url}")
        bio = (person.get("bio") or "").strip()
        if bio:
            lines.extend(["", bio])
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


# --------------------------------------------------------------------------
# Static HTML pages — visible-text extraction
# --------------------------------------------------------------------------

SKIP_TAGS = {"script", "style", "svg", "nav", "noscript", "template"}
BLOCK_TAGS = {
    "p", "div", "section", "article", "header", "footer", "main", "aside",
    "ul", "ol", "li", "table", "tr", "br", "hr", "blockquote", "pre",
    "figure", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6", "title",
}
HEADING_TAGS = {"h1": "#", "h2": "##", "h3": "###", "h4": "####"}
# Class-name fragments marking boilerplate chrome to skip.
SKIP_CLASS_FRAGMENTS = ("statusline",)


class VisibleTextExtractor(HTMLParser):
    """Extract visible text, skipping script/style/svg/nav and statusline chrome."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.lines: list[str] = []
        self.current: list[str] = []
        self.skip_tag: str | None = None
        self.skip_depth = 0
        self.heading_prefix: str | None = None

    def _should_skip(self, tag: str, attrs: list[tuple[str, str | None]]) -> bool:
        if tag in SKIP_TAGS:
            return True
        class_attr = dict(attrs).get("class") or ""
        return any(fragment in class_attr for fragment in SKIP_CLASS_FRAGMENTS)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_depth += 1
            return
        if self._should_skip(tag, attrs):
            self.skip_tag = tag
            self.skip_depth = 1
            return
        if tag in BLOCK_TAGS:
            self._flush_line()
        if tag in HEADING_TAGS:
            self.heading_prefix = HEADING_TAGS[tag]

    def handle_endtag(self, tag: str) -> None:
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_depth -= 1
                if self.skip_depth == 0:
                    self.skip_tag = None
            return
        if tag in BLOCK_TAGS:
            self._flush_line()
        if tag in HEADING_TAGS:
            self.heading_prefix = None

    def handle_data(self, data: str) -> None:
        if self.skip_tag:
            return
        self.current.append(data)

    def _flush_line(self) -> None:
        text = re.sub(r"\s+", " ", "".join(self.current)).strip()
        self.current = []
        if not text:
            return
        if self.heading_prefix:
            text = f"{self.heading_prefix} {text}"
        self.lines.append(text)

    def result(self) -> str:
        self._flush_line()
        deduped: list[str] = []
        for line in self.lines:
            if not deduped or deduped[-1] != line:
                deduped.append(line)
        return "\n\n".join(deduped)


def render_html_page(source_path: Path, canonical_url: str, purpose: str) -> str:
    extractor = VisibleTextExtractor()
    extractor.feed(source_path.read_text(encoding="utf-8"))
    extractor.close()
    body = extractor.result()
    return (
        record_header(source_path, canonical_url)
        + f"# Website page: {canonical_url} — {purpose}\n\n"
        + body.rstrip()
        + "\n"
    )


# --------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Minty chatbot content records from the website sources.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory for generated chatbot files (default: {DEFAULT_OUTPUT_DIR}).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    records: dict[str, str] = {}
    counts: dict[str, int] = {}
    warnings = 0

    newsletter_records = generate_astro_records(
        "newsletters", "newsletter", "Newsletter", output_dir
    )
    records.update(newsletter_records)
    counts["newsletters"] = len(newsletter_records)

    report_records = generate_astro_records("reports", "report", "Research report", output_dir)
    records.update(report_records)
    counts["reports"] = len(report_records)

    cv_path = REPO_DIR / "src" / "data" / "cv.json"
    if cv_path.is_file():
        records["cv-seth-lazar.md"] = render_cv(cv_path)
        counts["cv"] = 1
    else:
        print(f"WARNING: missing CV data {cv_path}", file=sys.stderr)
        counts["cv"] = 0
        warnings += 1

    people_path = REPO_DIR / "src" / "data" / "people.ts"
    if people_path.is_file():
        try:
            records["people.md"] = render_people(people_path)
            counts["people"] = 1
        except ValueError as exc:
            print(f"WARNING: could not parse {people_path}: {exc}", file=sys.stderr)
            counts["people"] = 0
            warnings += 1
    else:
        print(f"WARNING: missing people data {people_path}", file=sys.stderr)
        counts["people"] = 0
        warnings += 1

    counts["pages"] = 0
    for stem, relative_path, canonical_url, purpose in HTML_PAGES:
        source_path = REPO_DIR / relative_path
        if not source_path.is_file():
            print(f"WARNING: missing HTML page {source_path}", file=sys.stderr)
            warnings += 1
            continue
        records[f"{stem}.md"] = render_html_page(source_path, canonical_url, purpose)
        counts["pages"] += 1

    for filename, content in sorted(records.items()):
        (output_dir / filename).write_text(content, encoding="utf-8")

    stale_deleted: list[str] = []
    for existing in sorted(output_dir.glob("*.md")):
        if existing.name in records or existing.name in PRESERVED_FILES:
            continue
        existing.unlink()
        stale_deleted.append(existing.name)
        print(f"Deleted stale record: {existing.name}", file=sys.stderr)

    manifest = {
        "generated_at": generated_timestamp(),
        "output_dir": str(output_dir),
        "record_count": len(records),
        "counts": counts,
        "stale_deleted": stale_deleted,
        "records": sorted(records),
    }
    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Generated {len(records)} records in {output_dir}")
    for category, count in counts.items():
        print(f"  {category}: {count}")
    if stale_deleted:
        print(f"  stale records deleted: {len(stale_deleted)}")
    print(f"Manifest: {manifest_path}")
    if warnings:
        print(f"Completed with {warnings} warning(s); see stderr.", file=sys.stderr)


if __name__ == "__main__":
    main()
