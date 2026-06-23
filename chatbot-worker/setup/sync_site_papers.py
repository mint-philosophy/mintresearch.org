#!/usr/bin/env python3
"""
Generate chatbot publication records from the public website Papers CSV.

The floating Minty helper uses OpenAI file_search over uploaded local files. The
front page, by contrast, reads public/assets/papers/latest-paper-deliverables.csv
at runtime. This script bridges those surfaces by turning every public homepage
paper row into a markdown record, and optionally downloading public arXiv PDFs
for richer retrieval.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[1]
DEFAULT_CSV = REPO_DIR / "public" / "assets" / "papers" / "latest-paper-deliverables.csv"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "generated-site-papers"
MAX_DEFAULT_PDF_MB = 40


def truthy(value: str) -> bool:
    return value.strip().lower() in {"yes", "y", "true", "1"}


def parse_date(value: str) -> tuple[int, int, int]:
    parts = value.strip().split("/")
    if len(parts) != 3:
        return (0, 0, 0)
    try:
        day, month, year = (int(part) for part in parts)
    except ValueError:
        return (0, 0, 0)
    return (year, month, day)


def display_date(value: str) -> str:
    year, month, day = parse_date(value)
    if not year:
        return value.strip()
    return f"{year:04d}-{month:02d}-{day:02d}"


def slugify(value: str, fallback: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or fallback


def arxiv_pdf_url(url: str) -> str | None:
    match = re.search(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)", url)
    if not match:
        return None
    arxiv_id = match.group(1)
    return f"https://arxiv.org/pdf/{arxiv_id}.pdf"


def read_public_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))

    visible = [
        row
        for row in rows
        if truthy(row.get("Site: in Papers Section?", ""))
        and truthy(row.get("Site: Public?", ""))
    ]
    visible.sort(
        key=lambda row: parse_date(row.get("Date (D/M/Y)", "")),
        reverse=True,
    )
    return visible


def links_for(row: dict[str, str]) -> list[tuple[str, str]]:
    fields = [
        ("Paper URL", row.get("Site: Link to Paper") or row.get("Link")),
        ("Alternative source URL", row.get("Site: Alt Source")),
        ("GitHub URL", row.get("Site: Link to Github")),
        ("Blog URL", row.get("Site: Link to Blog Post")),
    ]
    return [(label, value.strip()) for label, value in fields if (value or "").strip()]


def render_markdown(rows: list[dict[str, str]], csv_path: Path) -> str:
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    lines = [
        "# MINT Lab Public Papers Index",
        "",
        "Generated for the Minty website helper from the homepage Papers CSV.",
        "This file mirrors the public papers shown on mintresearch.org and is",
        "rebuilt before refreshing the chatbot vector store.",
        "",
        f"- Source CSV: {csv_path}",
        f"- Generated at: {generated_at}",
        f"- Public paper count: {len(rows)}",
        "",
        "Use these records as the canonical public metadata and link index for",
        "MINT Lab papers. When a full paper file is also present in the vector",
        "store, prefer the full paper for substantive details and use this index",
        "for titles, authors, venues, dates, and URLs.",
        "",
    ]

    for index, row in enumerate(rows, 1):
        title = row.get("Title/Details", "").strip()
        lines.extend(
            [
                f"## {index}. {title}",
                "",
                f"- Codename: {row.get('Site: codename', '').strip()}",
                f"- Date: {display_date(row.get('Date (D/M/Y)', ''))}",
                f"- Authors: {row.get('Site: List of Authors', '').strip()}",
                f"- Venue: {(row.get('Site: Venue') or row.get('Venue') or '').strip()}",
                f"- Status: {row.get('Status', '').strip()}",
            ]
        )

        for label, value in links_for(row):
            lines.append(f"- {label}: {value}")

        abstract = row.get("Abstract", "").strip()
        blurb = row.get("Site: Blurb", "").strip()
        if abstract:
            lines.extend(["", "### Abstract", "", abstract])
        if blurb:
            lines.extend(["", "### Website blurb", "", blurb])
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def download_pdf(url: str, destination: Path, *, timeout: int, max_bytes: int) -> bool:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "mintresearch.org chatbot publication sync"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = response.read(max_bytes + 1)
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"WARNING: could not download {url}: {exc}", file=sys.stderr)
        return False

    if len(data) > max_bytes:
        print(f"WARNING: skipped oversized PDF {url}", file=sys.stderr)
        return False
    if not data.startswith(b"%PDF"):
        print(f"WARNING: skipped non-PDF response from {url}", file=sys.stderr)
        return False

    destination.write_bytes(data)
    return True


def download_arxiv_pdfs(
    rows: list[dict[str, str]],
    output_dir: Path,
    *,
    timeout: int,
    max_pdf_mb: int,
) -> tuple[int, int]:
    pdf_dir = output_dir / "arxiv-pdfs"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    max_bytes = max_pdf_mb * 1024 * 1024
    downloaded = 0
    skipped = 0

    for row in rows:
        source_url = row.get("Site: Link to Paper") or row.get("Link") or ""
        pdf_url = arxiv_pdf_url(source_url)
        if not pdf_url:
            skipped += 1
            continue
        codename = row.get("Site: codename", "").strip()
        title = row.get("Title/Details", "").strip()
        filename = f"{slugify(codename or title, 'paper')}.pdf"
        destination = pdf_dir / filename
        if download_pdf(pdf_url, destination, timeout=timeout, max_bytes=max_bytes):
            downloaded += 1
        else:
            skipped += 1

    return downloaded, skipped


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Minty chatbot publication records from the website Papers CSV.",
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=DEFAULT_CSV,
        help=f"Public papers CSV path (default: {DEFAULT_CSV}).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory for generated chatbot files (default: {DEFAULT_OUTPUT_DIR}).",
    )
    parser.add_argument(
        "--download-arxiv-pdfs",
        action="store_true",
        help="Download public arXiv PDFs referenced by visible paper rows.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=45,
        help="Per-PDF download timeout in seconds.",
    )
    parser.add_argument(
        "--max-pdf-mb",
        type=int,
        default=MAX_DEFAULT_PDF_MB,
        help=f"Maximum PDF size to download in MB (default: {MAX_DEFAULT_PDF_MB}).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    csv_path = args.csv.resolve()
    output_dir = args.output_dir.resolve()

    if not csv_path.is_file():
        print(f"ERROR: CSV not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)
    rows = read_public_rows(csv_path)
    markdown_path = output_dir / "site-papers-from-csv.md"
    markdown_path.write_text(render_markdown(rows, csv_path), encoding="utf-8")

    manifest = {
        "source_csv": str(csv_path),
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "public_paper_count": len(rows),
        "markdown": str(markdown_path),
        "arxiv_pdfs_downloaded": 0,
        "arxiv_pdfs_skipped": 0,
    }

    if args.download_arxiv_pdfs:
        downloaded, skipped = download_arxiv_pdfs(
            rows,
            output_dir,
            timeout=args.timeout,
            max_pdf_mb=args.max_pdf_mb,
        )
        manifest["arxiv_pdfs_downloaded"] = downloaded
        manifest["arxiv_pdfs_skipped"] = skipped

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Generated {markdown_path}")
    print(f"Public paper records: {len(rows)}")
    if args.download_arxiv_pdfs:
        print(f"arXiv PDFs downloaded: {manifest['arxiv_pdfs_downloaded']}")
        print(f"arXiv PDF rows skipped/failed: {manifest['arxiv_pdfs_skipped']}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
