#!/usr/bin/env python3
"""
Unit test: the chatbot's CV record is built from the served CV page.

Builds a small synthetic site in a temporary directory, runs the generator
against it, and checks that cv-seth-lazar.md carries an item that exists only
in public/cv/index.html (not in the archived src/data/cv.json).

Run (no network, nothing outside the temporary directory is written):
    python3 chatbot-worker/setup/test_sync_site_content.py
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sync_site_content as ssc  # noqa: E402

PAGE_ONLY_ITEM = "'A Synthetic Paper Only On The Page', Journal of Fixtures, 2026"
JSON_ONLY_ITEM = "'A Synthetic Paper Only In The Archive', Journal of Staleness, 2025"

CV_PAGE = f"""<!DOCTYPE html><html><head><title>Seth Lazar — CV</title>
<style>.card {{ color: red; }}</style></head><body>
<nav class="sidebar"><a href="/">NAV-CHROME</a></nav>
<h2>cat cv/papers.md</h2>
<div class="card"><div class="card-title">Papers</div>
<h4>Pre-Prints</h4>
<p>2026 {PAGE_ONLY_ITEM}, <a href="https://example.org/p">https://example.org/p</a></p>
</div>
<div class="statusline">STATUS-CHROME</div>
<script>var hidden = "SCRIPT-CHROME";</script>
</body></html>
"""

CV_JSON = {
    "meta": {"name": "Seth Lazar"},
    "sections": [
        {
            "id": "papers",
            "heading": "Papers",
            "type": "entries",
            "entries": [{"year": "2025", "text": JSON_ONLY_ITEM}],
        }
    ],
}

PEOPLE_TS = """export const teamMembers: PersonData[] = [
  { name: 'Test Person', role: 'Tester', disc: 'Testing', affiliation: 'Nowhere', bio: 'Bio.' },
];
"""


def build_site(root: Path) -> None:
    for subdir in ("newsletters", "reports"):
        (root / "src" / "pages" / subdir).mkdir(parents=True)
    data_dir = root / "src" / "data"
    data_dir.mkdir(parents=True)
    (data_dir / "people.ts").write_text(PEOPLE_TS, encoding="utf-8")
    (data_dir / "cv.json").write_text(json.dumps(CV_JSON), encoding="utf-8")
    for _, relative_path, _, _ in ssc.HTML_PAGES:
        page = root / relative_path
        page.parent.mkdir(parents=True, exist_ok=True)
        page.write_text("<html><body><p>stub page</p></body></html>", encoding="utf-8")
    (root / "public" / "cv" / "index.html").write_text(CV_PAGE, encoding="utf-8")


class CVRecordFromServedPage(unittest.TestCase):
    def run_generator(self, root: Path, output_dir: Path) -> None:
        argv = ["sync_site_content.py", "--output-dir", str(output_dir)]
        with mock.patch.object(ssc, "REPO_DIR", root), mock.patch.object(
            sys, "argv", argv
        ), mock.patch.object(ssc.subprocess, "run") as trash:
            ssc.main()
        trash.assert_not_called()

    def test_cv_record_carries_page_only_item(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve() / "site"
            output_dir = Path(tmp).resolve() / "out"
            build_site(root)

            self.run_generator(root, output_dir)

            record = (output_dir / "cv-seth-lazar.md").read_text(encoding="utf-8")
            self.assertIn(PAGE_ONLY_ITEM, record)
            self.assertNotIn(JSON_ONLY_ITEM, record)
            self.assertIn("Source: public/cv/index.html", record)
            self.assertIn("Canonical URL: https://mintresearch.org/cv/", record)
            self.assertIn("Curriculum Vitae: Seth Lazar", record)
            for chrome in ("NAV-CHROME", "STATUS-CHROME", "SCRIPT-CHROME"):
                self.assertNotIn(chrome, record)

    def test_cv_record_keeps_its_filename_across_the_switch(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve() / "site"
            output_dir = Path(tmp).resolve() / "out"
            build_site(root)
            # State left by the last run of the cv.json-based generator.
            output_dir.mkdir()
            (output_dir / "cv-seth-lazar.md").write_text(
                f"# Curriculum Vitae: Seth Lazar\n\n- 2025: {JSON_ONLY_ITEM}\n",
                encoding="utf-8",
            )
            (output_dir / "manifest.json").write_text(
                json.dumps({"records": ["cv-seth-lazar.md"]}), encoding="utf-8"
            )

            self.run_generator(root, output_dir)

            manifest = json.loads((output_dir / "manifest.json").read_text("utf-8"))
            cv_records = [name for name in manifest["records"] if "cv" in name]
            self.assertEqual(cv_records, ["cv-seth-lazar.md"])
            self.assertEqual(manifest["stale_deleted"], [])
            record = (output_dir / "cv-seth-lazar.md").read_text(encoding="utf-8")
            self.assertIn(PAGE_ONLY_ITEM, record)
            self.assertNotIn(JSON_ONLY_ITEM, record)

    def test_missing_cv_page_aborts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve() / "site"
            output_dir = Path(tmp).resolve() / "out"
            build_site(root)
            (root / "public" / "cv" / "index.html").rename(root / "public" / "cv" / "gone")

            with self.assertRaises(FileNotFoundError):
                self.run_generator(root, output_dir)
            self.assertFalse(output_dir.exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
