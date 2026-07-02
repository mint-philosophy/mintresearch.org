#!/usr/bin/env python3
"""
Incrementally sync local publication/content records into the Minty chatbot's
OpenAI vector store.

Unlike create_assistant.py --fresh-vector-store, this keeps the SAME vector
store ID forever, so the Cloudflare Worker never needs a redeploy and no
orphaned stores accumulate. Each local file is fingerprinted (sha256); the
store is diffed against the local set and only additions, changes, and
removals are applied.

The fingerprint is stored in each vector-store file's `attributes`
(sha256 + source filename), so the diff needs no local state file.

Usage:
    export OPENAI_API_KEY=...   # or pass --api-key-file .dev.vars
    python3 sync_vector_store.py \
        --vector-store-id vs_xxx \
        --dir setup/publications setup/generated-site-papers setup/generated-site-content

Exit codes: 0 = in sync (including no-op), 1 = fatal error, 2 = completed
with some per-file failures (details on stderr).
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

from openai import OpenAI

SUPPORTED_EXTENSIONS = {".md", ".pdf", ".txt"}
ATTR_HASH = "mint_sha256"
ATTR_NAME = "mint_name"


@dataclass
class LocalFile:
    path: Path
    name: str  # unique key: filename as uploaded
    sha256: str


def read_api_key(api_key_file: Path | None) -> str | None:
    """Optionally read OPENAI_API_KEY from a .dev.vars-style file."""
    if not api_key_file:
        return None
    for raw_line in api_key_file.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "OPENAI_API_KEY":
            return value.strip().strip('"').strip("'")
    return None


def collect_local_files(directories: list[Path]) -> dict[str, LocalFile]:
    """Gather supported files, keyed by upload filename. Duplicate names fail fast."""
    files: dict[str, LocalFile] = {}
    for directory in directories:
        for filepath in sorted(directory.rglob("*")):
            if filepath.suffix.lower() not in SUPPORTED_EXTENSIONS or not filepath.is_file():
                continue
            name = filepath.name
            if name in files:
                print(
                    f"ERROR: duplicate filename across record dirs: {name}\n"
                    f"  {files[name].path}\n  {filepath}\n"
                    "Filenames key the incremental sync and must be unique.",
                    file=sys.stderr,
                )
                sys.exit(1)
            digest = hashlib.sha256(filepath.read_bytes()).hexdigest()
            files[name] = LocalFile(path=filepath, name=name, sha256=digest)
    return files


def list_store_files(client: OpenAI, vector_store_id: str) -> list:
    """All files currently attached to the vector store."""
    results = []
    after = None
    while True:
        page = client.vector_stores.files.list(
            vector_store_id=vector_store_id, limit=100, after=after
        )
        results.extend(page.data)
        if not page.has_more:
            break
        after = page.data[-1].id
    return results


def remote_identity(client: OpenAI, vs_file) -> tuple[str | None, str | None]:
    """(name, sha256) for a vector-store file, from attributes or file metadata."""
    attrs = getattr(vs_file, "attributes", None) or {}
    name = attrs.get(ATTR_NAME)
    digest = attrs.get(ATTR_HASH)
    if not name:
        try:
            meta = client.files.retrieve(vs_file.id)
            name = meta.filename
        except Exception:
            name = None
    return name, digest


def upload_file(client: OpenAI, vector_store_id: str, local: LocalFile) -> None:
    """Upload a local file and attach it with identity attributes."""
    with open(local.path, "rb") as handle:
        uploaded = client.files.create(file=handle, purpose="assistants")
    client.vector_stores.files.create(
        vector_store_id=vector_store_id,
        file_id=uploaded.id,
        attributes={ATTR_NAME: local.name, ATTR_HASH: local.sha256},
    )


def remove_file(client: OpenAI, vector_store_id: str, file_id: str) -> None:
    """Detach a file from the store and delete the underlying file object."""
    client.vector_stores.files.delete(vector_store_id=vector_store_id, file_id=file_id)
    try:
        client.files.delete(file_id)
    except Exception as exc:  # already gone / shared elsewhere — detachment succeeded
        print(f"WARNING: could not delete file object {file_id}: {exc}", file=sys.stderr)


def wait_for_processing(client: OpenAI, vector_store_id: str, timeout: int = 600) -> bool:
    """Poll until no files are in progress. Returns True if none failed."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        vs = client.vector_stores.retrieve(vector_store_id)
        counts = vs.file_counts
        if counts.in_progress == 0:
            if counts.failed:
                print(f"ERROR: {counts.failed} files failed processing.", file=sys.stderr)
                return False
            return True
        time.sleep(3)
    print("ERROR: timed out waiting for vector store processing.", file=sys.stderr)
    return False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Incrementally sync local records into the chatbot vector store.",
    )
    parser.add_argument("--vector-store-id", required=True)
    parser.add_argument(
        "--dir",
        dest="dirs",
        type=Path,
        nargs="+",
        required=True,
        help="Record directories (searched recursively for .md/.pdf/.txt).",
    )
    parser.add_argument(
        "--api-key-file",
        type=Path,
        default=None,
        help="Optional .dev.vars-style file to read OPENAI_API_KEY from.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report the plan without changing the store.",
    )
    parser.add_argument(
        "--adds-only",
        action="store_true",
        help=(
            "Only add files whose names are absent from the store; skip updates, "
            "removals, and duplicate cleanup. Safe on a store serving live traffic "
            "while the OpenAI detach endpoint is unreliable."
        ),
    )
    parser.add_argument(
        "--summary-json",
        type=Path,
        default=None,
        help="Write a machine-readable summary of the sync here.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    for directory in args.dirs:
        if not directory.is_dir():
            print(f"ERROR: not a directory: {directory}", file=sys.stderr)
            sys.exit(1)

    api_key = read_api_key(args.api_key_file)
    client = OpenAI(api_key=api_key) if api_key else OpenAI()

    local = collect_local_files([d.resolve() for d in args.dirs])
    if not local:
        print("ERROR: no local record files found; refusing to empty the store.", file=sys.stderr)
        sys.exit(1)

    remote_files = list_store_files(client, args.vector_store_id)

    # Build remote identity map. Files without identity attributes (uploaded by
    # the legacy full-rebuild path) fall back to their file metadata name and a
    # null hash, which forces one re-upload cycle that stamps attributes.
    remote_by_name: dict[str, tuple[str, str | None]] = {}  # name -> (vs file id, sha)
    unidentified: list[str] = []
    for vs_file in remote_files:
        name, digest = remote_identity(client, vs_file)
        if name is None:
            unidentified.append(vs_file.id)
            continue
        if name in remote_by_name:
            # Duplicate names in store (legacy uploads): drop the extra copy.
            unidentified.append(vs_file.id)
            continue
        remote_by_name[name] = (vs_file.id, digest)

    to_add = [lf for name, lf in sorted(local.items()) if name not in remote_by_name]
    to_update = [
        lf
        for name, lf in sorted(local.items())
        if name in remote_by_name and remote_by_name[name][1] != lf.sha256
    ]
    to_remove = [
        (name, file_id)
        for name, (file_id, _sha) in sorted(remote_by_name.items())
        if name not in local
    ]

    if args.adds_only:
        if to_update or to_remove or unidentified:
            print(
                f"adds-only: skipping {len(to_update)} updates, {len(to_remove)} removals, "
                f"{len(unidentified)} unidentified files",
            )
        to_update = []
        to_remove = []
        unidentified = []

    print(f"Local records: {len(local)} | remote files: {len(remote_files)}")
    print(
        f"Plan: add {len(to_add)}, update {len(to_update)}, "
        f"remove {len(to_remove)}, drop-unidentified {len(unidentified)}"
    )
    for lf in to_add:
        print(f"  + {lf.name}")
    for lf in to_update:
        print(f"  ~ {lf.name}")
    for name, _fid in to_remove:
        print(f"  - {name}")

    summary = {
        "vector_store_id": args.vector_store_id,
        "local_records": len(local),
        "added": [lf.name for lf in to_add],
        "updated": [lf.name for lf in to_update],
        "removed": [name for name, _ in to_remove],
        "dropped_unidentified": len(unidentified),
        "dry_run": args.dry_run,
        "ok": True,
    }

    if args.dry_run:
        if args.summary_json:
            args.summary_json.write_text(json.dumps(summary, indent=2) + "\n")
        print("Dry run: no changes made.")
        return

    failures = 0

    # Updates: remove old copy first, then re-add.
    for lf in to_update:
        file_id, _sha = remote_by_name[lf.name]
        try:
            remove_file(client, args.vector_store_id, file_id)
            upload_file(client, args.vector_store_id, lf)
            print(f"  updated {lf.name}")
        except Exception as exc:
            failures += 1
            print(f"  FAILED update {lf.name}: {exc}", file=sys.stderr)

    for lf in to_add:
        try:
            upload_file(client, args.vector_store_id, lf)
            print(f"  added {lf.name}")
        except Exception as exc:
            failures += 1
            print(f"  FAILED add {lf.name}: {exc}", file=sys.stderr)

    for name, file_id in to_remove:
        try:
            remove_file(client, args.vector_store_id, file_id)
            print(f"  removed {name}")
        except Exception as exc:
            failures += 1
            print(f"  FAILED remove {name}: {exc}", file=sys.stderr)

    for file_id in unidentified:
        try:
            remove_file(client, args.vector_store_id, file_id)
            print(f"  dropped unidentified {file_id}")
        except Exception as exc:
            failures += 1
            print(f"  FAILED drop {file_id}: {exc}", file=sys.stderr)

    changed = to_add or to_update or to_remove or unidentified
    processed_ok = True
    if changed:
        processed_ok = wait_for_processing(client, args.vector_store_id)

    vs = client.vector_stores.retrieve(args.vector_store_id)
    print(
        f"Store now: {vs.file_counts.completed} completed, "
        f"{vs.file_counts.failed} failed, {vs.usage_bytes / 1e6:.1f}MB"
    )

    summary["ok"] = failures == 0 and processed_ok
    summary["store_completed"] = vs.file_counts.completed
    summary["store_failed"] = vs.file_counts.failed
    if args.summary_json:
        args.summary_json.write_text(json.dumps(summary, indent=2) + "\n")

    if failures or not processed_ok:
        sys.exit(2)


if __name__ == "__main__":
    main()
