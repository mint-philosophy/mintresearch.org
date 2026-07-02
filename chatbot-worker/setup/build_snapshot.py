#!/usr/bin/env python3
"""
Generate the compact "current lab snapshot" for the Minty chatbot.

The snapshot is a short markdown block (well under ~2500 words) injected into
the chatbot's system prompt at request time, so answers about "latest" or
"recent" MINT Lab work come from the live publications list rather than model
memory or file search alone.

Two copies are written:
- a vector-store record inside generated-site-content (belt and braces:
  searchable too), and
- a plain-text copy OUTSIDE the record directory, pushed to Cloudflare KV
  separately.

Row filtering, sorting, and field conventions are imported from
sync_site_papers.py (same directory).
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from sync_site_papers import display_date, read_public_rows  # noqa: E402

REPO_DIR = SCRIPT_DIR.parents[1]
DEFAULT_CSV = REPO_DIR / "public" / "assets" / "papers" / "latest-paper-deliverables.csv"
DEFAULT_OUTPUT = SCRIPT_DIR / "generated-site-content" / "00-lab-snapshot.md"
DEFAULT_PUBLISH_OUTPUT = REPO_DIR / "public" / "assets" / "minty" / "snapshot.txt"
RECENT_COUNT = 10


def snapshot_line(index: int, row: dict[str, str]) -> str:
    title = row.get("Title/Details", "").strip()
    date = display_date(row.get("Date (D/M/Y)", ""))
    authors = row.get("Site: List of Authors", "").strip()
    venue = (row.get("Site: Venue") or row.get("Venue") or "").strip()
    status = row.get("Status", "").strip()
    link = (row.get("Site: Link to Paper") or row.get("Link") or "").strip()

    venue_status = "; ".join(part for part in (venue, status) if part)
    parts = [f"{index}. {title} ({date})"]
    if authors:
        parts.append(f" — {authors}.")
    if venue_status:
        parts.append(f" {venue_status}.")
    if link:
        parts.append(f" {link}")
    return "".join(parts).rstrip()


def render_snapshot(rows: list[dict[str, str]], dated: bool = True) -> str:
    """Render the snapshot. The published copy is dated (the Worker puts it
    in the system prompt, where "as of <date>" is the payload). The vector-
    store record copy is undated: records are hashed to decide whether the
    store needs a rebuild, so a date would force a rebuild every UTC day."""
    today = datetime.now(timezone.utc).date().isoformat()
    if dated:
        header = f"# CURRENT MINT LAB SNAPSHOT (auto-generated {today})"
        intro = f"As of {today}, this is the authoritative, up-to-date summary of MINT Lab output."
        count = f"{len(rows)} public papers listed on mintresearch.org as of {today}."
    else:
        header = "# CURRENT MINT LAB SNAPSHOT"
        intro = "This is the authoritative, up-to-date summary of MINT Lab output."
        count = f"{len(rows)} public papers listed on mintresearch.org."
    lines = [
        header,
        "",
        intro,
        'When asked about "latest", "recent", or "new" work, use THIS list, not memory or file search alone.',
        "",
        "## Ten most recent papers/preprints (newest first)",
    ]
    for index, row in enumerate(rows[:RECENT_COUNT], 1):
        lines.append(snapshot_line(index, row))
    lines.extend(
        [
            "",
            "## Publication count",
            count,
        ]
    )
    return "\n".join(lines).rstrip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate the current-lab-snapshot block for the Minty chatbot system prompt.",
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=DEFAULT_CSV,
        help=f"Public papers CSV path (default: {DEFAULT_CSV}).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Vector-store snapshot record path (default: {DEFAULT_OUTPUT}).",
    )
    parser.add_argument(
        "--publish-output",
        type=Path,
        default=DEFAULT_PUBLISH_OUTPUT,
        help=f"Site-served plain-text copy fetched by the Worker (default: {DEFAULT_PUBLISH_OUTPUT}).",
    )
    parser.add_argument(
        "--print",
        action="store_true",
        dest="print_snapshot",
        help="Also print the snapshot content to stdout.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    csv_path = args.csv.resolve()
    output_path = args.output.resolve()
    publish_output_path = args.publish_output.resolve()

    if not csv_path.is_file():
        print(f"ERROR: CSV not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    rows = read_public_rows(csv_path)
    if not rows:
        print(f"ERROR: no public paper rows found in {csv_path}", file=sys.stderr)
        sys.exit(1)

    record_snapshot = render_snapshot(rows, dated=False)
    published_snapshot = render_snapshot(rows, dated=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(record_snapshot, encoding="utf-8")
    publish_output_path.parent.mkdir(parents=True, exist_ok=True)
    publish_output_path.write_text(published_snapshot, encoding="utf-8")

    if args.print_snapshot:
        print(published_snapshot, end="")

    print(f"Snapshot record: {output_path}", file=sys.stderr)
    print(f"Published copy: {publish_output_path}", file=sys.stderr)
    print(
        f"Public papers: {len(rows)}; listed {min(RECENT_COUNT, len(rows))} most recent.",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
