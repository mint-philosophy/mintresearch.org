#!/usr/bin/env python3
"""Minimal build: inject shared nav/footer into page templates."""

from pathlib import Path

SITE_DIR = Path(__file__).parent
SHARED = SITE_DIR / "_shared"

# Pages to process (paper-map/ is excluded — datamapplot generates standalone HTML)
PAGES = [
    SITE_DIR / "index.html",
]


def build():
    nav = (SHARED / "nav.html").read_text()
    footer = (SHARED / "footer.html").read_text()

    for page in PAGES:
        if not page.exists():
            continue
        content = page.read_text()
        if "<!-- NAV -->" in content:
            content = content.replace("<!-- NAV -->", nav)
        if "<!-- FOOTER -->" in content:
            content = content.replace("<!-- FOOTER -->", footer)
        page.write_text(content)
        print(f"Built: {page.relative_to(SITE_DIR)}")


if __name__ == "__main__":
    build()
