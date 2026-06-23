# MINT Lab Paper Map

Interactive visualization of the MINT Lab research corpus using datamapplot.

**Live**: https://mintresearch.org/paper-map/

## Features

- 4,668 embedded papers visualized with UMAP projection
- 4,818 total papers in the local corpus as of the 2026-06-23 regeneration
- Colored by macro_category (16 research areas)
- Hierarchical labels (macro → cluster → title on zoom)
- Click to open Google Drive PDF
- Search by title + author

## Known Issues (for next agent)

### 1. New Paper to Ingest
`Shen and Tamkin (2026) How AI Impacts Skill Formation.pdf` in Resources/pdfs/ needs ingestion.

## Scripts

- `export_corpus_data.py` — Export from LanceDB to parquet
- `compute_umap.py` — UMAP projection (3072D → 2D)
- `create_paper_map.py` — Generate interactive HTML

## Regenerating

```bash
cd /Volumes/Agents/Active-Research/Minty
daemons/pipeline/.venv/bin/python3 SCRIPTS/recluster_corpus.py --repair-labels
daemons/pipeline/.venv/bin/python3 daemons/paper-map-updater/update_paper_map.py --local-only --skip-recluster
```

Use the local-only update for inspection. Do not push or publish regenerated
website assets without explicit authorization.
