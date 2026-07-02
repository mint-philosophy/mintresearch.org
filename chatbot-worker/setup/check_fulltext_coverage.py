#!/usr/bin/env python3
"""Verify every public front-page paper has a full-text record.

Coverage means: a downloaded arXiv PDF (generated-site-papers/arxiv-pdfs/,
keyed by codename slug) or a curated file in publications/ whose name/head
matches the paper title. Edited volumes are covered by "(contents record)"
files; rows that legitimately cannot have full text can be listed in
coverage-exceptions.json as {"title_contains": ..., "reason": ...}.

Output protocol (consumed by the minty-chatbot-sync daemon): uncovered paper
titles on stdout, one per line; human summary on stderr. Exit 0 = full
coverage, exit 1 = gaps.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from sync_site_papers import arxiv_pdf_url, read_public_rows, slugify  # noqa: E402

DEFAULT_CSV = SCRIPT_DIR.parents[1] / "public" / "assets" / "papers" / "latest-paper-deliverables.csv"
PUBLICATIONS_DIR = SCRIPT_DIR / "publications"
ARXIV_DIR = SCRIPT_DIR / "generated-site-papers" / "arxiv-pdfs"
EXCEPTIONS_FILE = SCRIPT_DIR / "coverage-exceptions.json"
# Calibrated on the 2026-07 corpus: true matches scored >=0.68, best false
# candidates <=0.57. Revisit if titles start scoring inside that band.
MATCH_THRESHOLD = 0.6
STOPWORDS = {"the", "a", "an", "of", "and", "on", "in", "for", "to", "with", "by", "at", "or", "its", "is", "as"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9 ]+", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()


def tokens(s: str) -> set[str]:
    return {t for t in norm(s).split() if t not in STOPWORDS and len(t) > 2}


def load_exceptions() -> list[dict]:
    if EXCEPTIONS_FILE.is_file():
        try:
            return json.loads(EXCEPTIONS_FILE.read_text())
        except (json.JSONDecodeError, OSError) as exc:
            print(f"WARNING: could not read {EXCEPTIONS_FILE.name}: {exc}", file=sys.stderr)
    return []


def publication_index() -> list[tuple[str, str, set[str]]]:
    index = []
    if not PUBLICATIONS_DIR.is_dir():
        return index
    for f in sorted(PUBLICATIONS_DIR.iterdir()):
        if f.suffix.lower() not in {".md", ".pdf", ".txt"} or not f.is_file():
            continue
        head = ""
        if f.suffix.lower() in {".md", ".txt"}:
            try:
                head = f.read_text(errors="replace")[:400]
            except OSError:
                pass
        index.append((f.name, norm(f.name), tokens(f.name) | tokens(head)))
    return index


def is_covered(row: dict, pubs: list[tuple[str, str, set[str]]]) -> bool:
    title = row.get("Title/Details", "").strip()
    codename = row.get("Site: codename", "").strip()
    link = (row.get("Site: Link to Paper") or row.get("Link") or "").strip()
    alt = (row.get("Site: Alt Source") or "").strip()

    if arxiv_pdf_url(link) or arxiv_pdf_url(alt):
        if (ARXIV_DIR / f"{slugify(codename or title, 'paper')}.pdf").is_file():
            return True

    # Curated filenames usually carry the main title but not the subtitle,
    # so a long subtitle dilutes token overlap below threshold. Match on the
    # pre-colon/dash main title as well (when it has >=2 significant tokens).
    main = re.split(r"[:—]", title)[0]
    candidate_tokens = [tokens(title)]
    mtoks = tokens(main)
    if len(mtoks) >= 2 and mtoks != candidate_tokens[0]:
        candidate_tokens.append(mtoks)

    ntitle = norm(title)
    for _, nname, ftoks in pubs:
        for ctoks in candidate_tokens:
            if len(ctoks & ftoks) / max(1, len(ctoks)) >= MATCH_THRESHOLD:
                return True
        if SequenceMatcher(None, ntitle, nname).ratio() >= MATCH_THRESHOLD:
            return True
    return False


def main() -> None:
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV
    rows = read_public_rows(csv_path)
    if not rows:
        print(f"ERROR: no public rows found in {csv_path}", file=sys.stderr)
        sys.exit(1)

    exceptions = load_exceptions()
    pubs = publication_index()
    missing: list[str] = []
    excepted = 0
    for row in rows:
        title = row.get("Title/Details", "").strip()
        if any(norm(e.get("title_contains", "")) in norm(title) for e in exceptions if e.get("title_contains")):
            excepted += 1
            continue
        if not is_covered(row, pubs):
            missing.append(title)

    print(
        f"coverage: {len(rows) - len(missing) - excepted}/{len(rows)} covered, "
        f"{excepted} excepted, {len(missing)} missing",
        file=sys.stderr,
    )
    for title in missing:
        print(title)
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
