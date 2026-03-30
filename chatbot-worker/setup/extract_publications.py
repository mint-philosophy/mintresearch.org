#!/usr/bin/env python3
"""
Extract and stage MINT Lab publications for the Minty chatbot vector store.

This script copies markdown and PDF files from a source directory into a staging
directory, filtering by filename patterns that match MINT Lab member names. The
staged files should then be manually curated before uploading via create_assistant.py.

The source directory should contain publication files (e.g., markdown renderings
of papers, or PDFs). For the MINT Lab, these come from the corpus markdown export
at /Volumes/Agents/Active-Research/Resources/markdown/ — but any directory of
publication files will work.

Usage:
    # Stage publications from the corpus markdown directory
    python extract_publications.py \\
        --source-dir /Volumes/Agents/Active-Research/Resources/markdown \\
        --output-dir ./staged_publications

    # Use a custom author list (overrides built-in MINT Lab members)
    python extract_publications.py \\
        --source-dir /path/to/papers \\
        --output-dir ./staged \\
        --authors "Seth Lazar" "Daniel Kilov"

    # Copy all files without filtering (manual curation only)
    python extract_publications.py \\
        --source-dir /path/to/papers \\
        --output-dir ./staged \\
        --no-filter

After staging:
    1. Review the staged files — remove irrelevant papers, add any missing ones
    2. Run: python create_assistant.py --publications-dir ./staged_publications
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

# MINT Lab members whose publications should be included in the vector store.
# This list is used for filename-based filtering — it won't catch papers where
# the author name doesn't appear in the filename. Manual curation is expected.
MINT_LAB_MEMBERS: list[str] = [
    "Seth Lazar",
    "Daniel Kilov",
    "Secil Yanik Guyot",
    "Ned Howells-Whitaker",
    "Jennifer Munt",
    "Tim Dubber",
    "Iman Ferestade",
    "Cameron Pattison",
    "Andrew Smart",
    "Jake Stone",
    "Caroline Hendy",
    "Theo Murray",
    "Charis Yang",
    "Sichao Li",
    "Elena Ajayi",
    "Abbas Bagwala",
    "Noah Birnbaum",
    "Angelica Chowdhury",
    "ChunYan",
    "Shira Gur Arieh",
    "Changbai Li",
    "Lorenzo Manuali",
    "Lena Wang",
]

SUPPORTED_EXTENSIONS = {".md", ".pdf", ".txt"}


def build_author_patterns(authors: list[str]) -> list[re.Pattern[str]]:
    """
    Build regex patterns for matching author names in filenames.

    Generates patterns for each author that handle common filename conventions:
    - Full name: "Seth Lazar"
    - Hyphenated: "seth-lazar"
    - Underscored: "seth_lazar"
    - Last name only: "lazar" (as a word boundary match)
    """
    patterns: list[re.Pattern[str]] = []
    for author in authors:
        parts = author.split()
        if not parts:
            continue

        # Full name with flexible separators (space, hyphen, underscore)
        full = r"[\s_\-]?".join(re.escape(p) for p in parts)
        patterns.append(re.compile(full, re.IGNORECASE))

        # Last name as standalone word (catches "lazar2024..." or "...by-lazar...")
        last = parts[-1]
        if len(last) > 2:  # Skip very short last names to avoid false positives
            patterns.append(re.compile(rf"\b{re.escape(last)}\b", re.IGNORECASE))

    return patterns


def matches_any_author(filename: str, patterns: list[re.Pattern[str]]) -> bool:
    """Check whether a filename matches any of the author patterns."""
    return any(p.search(filename) for p in patterns)


def scan_file_content(filepath: Path, patterns: list[re.Pattern[str]]) -> bool:
    """
    For markdown/text files, check whether any author name appears in the first
    50 lines (typically title + author block). Skips binary files (PDFs).
    """
    if filepath.suffix.lower() == ".pdf":
        return False  # Can't cheaply scan PDF text
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            head = "".join(f.readline() for _ in range(50))
        return any(p.search(head) for p in patterns)
    except Exception:
        return False


def collect_source_files(source_dir: Path) -> list[Path]:
    """Gather all supported files from the source directory."""
    files: list[Path] = []
    for ext in SUPPORTED_EXTENSIONS:
        files.extend(source_dir.rglob(f"*{ext}"))
    files.sort(key=lambda p: p.name.lower())
    return files


def stage_files(
    files: list[Path],
    output_dir: Path,
    *,
    author_patterns: list[re.Pattern[str]] | None = None,
) -> tuple[int, int]:
    """
    Copy matching files to the staging directory.

    If author_patterns is None, all files are copied (no-filter mode).
    Returns (copied_count, skipped_count).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    skipped = 0

    for filepath in files:
        if author_patterns is not None:
            name_match = matches_any_author(filepath.stem, author_patterns)
            content_match = (
                scan_file_content(filepath, author_patterns) if not name_match else False
            )
            if not name_match and not content_match:
                skipped += 1
                continue

        dest = output_dir / filepath.name
        # Handle name collisions by appending a suffix
        if dest.exists():
            stem = filepath.stem
            suffix = filepath.suffix
            counter = 1
            while dest.exists():
                dest = output_dir / f"{stem}_{counter}{suffix}"
                counter += 1

        shutil.copy2(filepath, dest)
        copied += 1
        match_type = ""
        if author_patterns is not None:
            match_type = " (filename)" if matches_any_author(filepath.stem, author_patterns) else " (content)"
        print(f"  Staged: {filepath.name}{match_type}")

    return copied, skipped


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Stage MINT Lab publications for the Minty chatbot vector store.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--source-dir",
        type=Path,
        required=True,
        help="Directory containing source publication files (.md, .pdf, .txt).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("./staged_publications"),
        help="Directory to copy staged files into (default: ./staged_publications).",
    )
    parser.add_argument(
        "--authors",
        nargs="+",
        default=None,
        help="Custom author names to filter by (overrides built-in MINT Lab list).",
    )
    parser.add_argument(
        "--no-filter",
        action="store_true",
        help="Copy all files without author filtering (manual curation only).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    source_dir = args.source_dir.resolve()
    output_dir = args.output_dir.resolve()

    if not source_dir.is_dir():
        print(f"ERROR: Source directory does not exist: {source_dir}", file=sys.stderr)
        sys.exit(1)

    files = collect_source_files(source_dir)
    if not files:
        print(f"No supported files found in {source_dir}", file=sys.stderr)
        print(f"Supported extensions: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")
        sys.exit(1)

    print(f"Found {len(files)} files in {source_dir}")
    print(f"Staging to: {output_dir}\n")

    # Build author patterns (or None for no-filter mode)
    author_patterns: list[re.Pattern[str]] | None = None
    if not args.no_filter:
        authors = args.authors if args.authors else MINT_LAB_MEMBERS
        author_patterns = build_author_patterns(authors)
        print(f"Filtering by {len(authors)} author(s):\n")
        for a in authors:
            print(f"  - {a}")
        print()

    copied, skipped = stage_files(files, output_dir, author_patterns=author_patterns)

    # Summary
    print("\n" + "=" * 60)
    print("STAGING COMPLETE")
    print("=" * 60)
    print(f"  Files staged:  {copied}")
    print(f"  Files skipped: {skipped}")
    print(f"  Output dir:    {output_dir}")
    print()
    print("Next steps:")
    print("  1. Review the staged files — remove irrelevant papers, add missing ones")
    print("  2. Run: python create_assistant.py --publications-dir", output_dir)


if __name__ == "__main__":
    main()
