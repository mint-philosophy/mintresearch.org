#!/usr/bin/env python3
"""
Create (or update) the OpenAI Assistant and Vector Store for the Minty chatbot.

Usage:
    # First time setup — creates assistant + vector store, uploads publications
    export OPENAI_API_KEY="sk-..."
    python create_assistant.py --publications-dir /path/to/papers

    # Update publications only (reuse existing assistant)
    python create_assistant.py --publications-dir /path/to/papers --assistant-id asst_xxx

    # Update system prompt only
    python create_assistant.py --update-prompt --assistant-id asst_xxx

    # Specify a different model
    python create_assistant.py --publications-dir /path/to/papers --model gpt-4o

Requires: pip install openai
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from openai import OpenAI

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG_PATH = SCRIPT_DIR / "assistant_config.json"
PROMPT_PATH = SCRIPT_DIR / "system_prompt.txt"
SUPPORTED_EXTENSIONS = {".md", ".pdf", ".txt"}
DEFAULT_MODEL = "gpt-5.4-xhigh"


def load_config() -> dict:
    """Load existing assistant configuration if present."""
    if CONFIG_PATH.exists():
        return json.loads(CONFIG_PATH.read_text())
    return {}


def save_config(config: dict) -> None:
    """Persist assistant configuration to disk."""
    CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n")
    print(f"Config saved to {CONFIG_PATH}")


def load_system_prompt() -> str:
    """Read the system prompt from system_prompt.txt."""
    if not PROMPT_PATH.exists():
        print(f"ERROR: System prompt not found at {PROMPT_PATH}", file=sys.stderr)
        print("Create system_prompt.txt in the setup/ directory first.", file=sys.stderr)
        sys.exit(1)
    text = PROMPT_PATH.read_text().strip()
    if not text:
        print("ERROR: system_prompt.txt is empty.", file=sys.stderr)
        sys.exit(1)
    return text


def collect_files(directory: Path) -> list[Path]:
    """Gather all supported files from the given directory (non-recursive by default, recursive if needed)."""
    files: list[Path] = []
    for ext in SUPPORTED_EXTENSIONS:
        files.extend(directory.rglob(f"*{ext}"))
    # Sort for deterministic ordering
    files.sort(key=lambda p: p.name.lower())
    return files


def create_vector_store(client: OpenAI, name: str) -> str:
    """Create a new vector store and return its ID."""
    print(f"Creating vector store: {name}")
    vs = client.vector_stores.create(name=name)
    print(f"  Vector store created: {vs.id}")
    return vs.id


def upload_files_to_vector_store(
    client: OpenAI,
    vector_store_id: str,
    files: list[Path],
) -> tuple[int, int]:
    """Upload files to the vector store. Returns (success_count, failure_count)."""
    if not files:
        print("No files to upload.")
        return 0, 0

    success = 0
    failed = 0
    total = len(files)
    file_ids: list[str] = []

    print(f"\nUploading {total} files...")

    for i, filepath in enumerate(files, 1):
        label = f"[{i}/{total}]"
        try:
            with open(filepath, "rb") as f:
                uploaded = client.files.create(file=f, purpose="assistants")
            file_ids.append(uploaded.id)
            success += 1
            print(f"  {label} Uploaded: {filepath.name} ({uploaded.id})")
        except Exception as e:
            failed += 1
            print(f"  {label} FAILED:   {filepath.name} -- {e}", file=sys.stderr)

    # Attach files to vector store in batches
    if file_ids:
        print(f"\nAttaching {len(file_ids)} files to vector store {vector_store_id}...")
        batch = client.vector_stores.file_batches.create(
            vector_store_id=vector_store_id,
            file_ids=file_ids,
        )
        # Poll until the batch finishes processing
        while batch.status in ("in_progress", "queued"):
            time.sleep(2)
            batch = client.vector_stores.file_batches.retrieve(
                batch.id,
                vector_store_id=vector_store_id,
            )
            counts = batch.file_counts
            print(
                f"  Processing: {counts.completed} completed, "
                f"{counts.in_progress} in progress, "
                f"{counts.failed} failed"
            )
        print(f"  Batch finished with status: {batch.status}")

    return success, failed


def create_assistant(
    client: OpenAI,
    *,
    model: str,
    system_prompt: str,
    vector_store_id: str,
) -> str:
    """Create a new OpenAI Assistant with file_search and return its ID."""
    print(f"\nCreating assistant (model: {model})...")
    assistant = client.assistants.create(
        name="Minty",
        model=model,
        instructions=system_prompt,
        tools=[{"type": "file_search"}],
        tool_resources={
            "file_search": {
                "vector_store_ids": [vector_store_id],
            }
        },
    )
    print(f"  Assistant created: {assistant.id}")
    return assistant.id


def update_assistant_prompt(
    client: OpenAI,
    assistant_id: str,
    system_prompt: str,
) -> None:
    """Update the system prompt on an existing assistant."""
    print(f"Updating system prompt for assistant {assistant_id}...")
    client.assistants.update(
        assistant_id=assistant_id,
        instructions=system_prompt,
    )
    print("  System prompt updated.")


def update_assistant_vector_store(
    client: OpenAI,
    assistant_id: str,
    vector_store_id: str,
) -> None:
    """Point an existing assistant at a (possibly new) vector store."""
    print(f"Attaching vector store {vector_store_id} to assistant {assistant_id}...")
    client.assistants.update(
        assistant_id=assistant_id,
        tool_resources={
            "file_search": {
                "vector_store_ids": [vector_store_id],
            }
        },
    )
    print("  Vector store attached.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create or update the Minty OpenAI Assistant and Vector Store.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--publications-dir",
        type=Path,
        help="Directory containing .md/.pdf/.txt files to upload as publications.",
    )
    parser.add_argument(
        "--assistant-id",
        type=str,
        default=None,
        help="Existing assistant ID to update (skip creation).",
    )
    parser.add_argument(
        "--vector-store-id",
        type=str,
        default=None,
        help="Existing vector store ID to reuse (skip creation).",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"Model to use for the assistant (default: {DEFAULT_MODEL}).",
    )
    parser.add_argument(
        "--update-prompt",
        action="store_true",
        help="Update the system prompt on an existing assistant (requires --assistant-id).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Validate argument combinations
    if args.update_prompt and not args.assistant_id:
        print("ERROR: --update-prompt requires --assistant-id.", file=sys.stderr)
        sys.exit(1)
    if not args.publications_dir and not args.update_prompt:
        print(
            "ERROR: Provide --publications-dir to upload files, "
            "or --update-prompt to update the system prompt.",
            file=sys.stderr,
        )
        sys.exit(1)

    client = OpenAI()  # uses OPENAI_API_KEY from environment
    system_prompt = load_system_prompt()
    config = load_config()

    # --- Prompt-only update path ---
    if args.update_prompt:
        update_assistant_prompt(client, args.assistant_id, system_prompt)
        config["assistant_id"] = args.assistant_id
        save_config(config)
        return

    # --- Publications upload path ---
    pub_dir = args.publications_dir.resolve()
    if not pub_dir.is_dir():
        print(f"ERROR: {pub_dir} is not a directory.", file=sys.stderr)
        sys.exit(1)

    files = collect_files(pub_dir)
    if not files:
        print(f"WARNING: No supported files found in {pub_dir}.", file=sys.stderr)
        print(f"Supported extensions: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")
        sys.exit(1)

    print(f"Found {len(files)} files in {pub_dir}\n")

    # Create or reuse vector store
    vector_store_id = args.vector_store_id or config.get("vector_store_id")
    if vector_store_id:
        print(f"Reusing existing vector store: {vector_store_id}")
    else:
        vector_store_id = create_vector_store(client, "MINT Lab Publications")

    # Upload files
    uploaded, failed = upload_files_to_vector_store(client, vector_store_id, files)

    # Create or update assistant
    assistant_id = args.assistant_id or config.get("assistant_id")
    if assistant_id:
        print(f"\nUsing existing assistant: {assistant_id}")
        update_assistant_prompt(client, assistant_id, system_prompt)
        update_assistant_vector_store(client, assistant_id, vector_store_id)
    else:
        assistant_id = create_assistant(
            client,
            model=args.model,
            system_prompt=system_prompt,
            vector_store_id=vector_store_id,
        )

    # Save config
    config.update(
        {
            "assistant_id": assistant_id,
            "vector_store_id": vector_store_id,
            "model": args.model,
            "files_uploaded": uploaded,
            "last_publications_dir": str(pub_dir),
        }
    )
    save_config(config)

    # Summary
    print("\n" + "=" * 60)
    print("SETUP COMPLETE")
    print("=" * 60)
    print(f"  Assistant ID:    {assistant_id}")
    print(f"  Vector Store ID: {vector_store_id}")
    print(f"  Model:           {args.model}")
    print(f"  Files uploaded:  {uploaded}")
    if failed:
        print(f"  Files failed:    {failed}")
    print(f"  Config saved:    {CONFIG_PATH}")
    print()
    print("Next steps:")
    print(f"  1. Set ASSISTANT_ID={assistant_id} in wrangler.toml")
    print("  2. Deploy the Cloudflare Worker: wrangler deploy")


if __name__ == "__main__":
    main()
