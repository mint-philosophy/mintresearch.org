
## 2026-06-23 | Codex

**Work**: Repaired incoherent paper-map labels from the upstream LanceDB
cluster metadata rather than patching the frontend. The old deterministic
TF-IDF path had allowed one-off phrases such as "Affordable Housing",
"Charter School", and "Electronic Mail" to become visible labels. The repair
keeps existing cluster assignments but now derives cluster names from recurring
member-paper terms, maps research areas to a fixed 16-label taxonomy, and
collapses fragile subcluster labels back to parent cluster labels.

**Verification**: `SCRIPTS/recluster_corpus.py --repair-labels` updated 4,668
assigned embedded papers across 84 clusters and passed validation. The local
paper-map updater regenerated assets for 4,668 mapped papers and 4,818 total
corpus documents, refreshed `src/data/stats.json`, the served guide stats, and
legacy `public/paper-map/data/` + `output/` inspection artifacts. The update was
local-only; no commit or push was made.

**State**: The served map artifacts and lab infrastructure stats are current in
this checkout. The remaining untracked `src/pages/guide.astro` is unrelated and
was left untouched.

## 2026-03-09 | Lab-Minty-9c856c68

**Work**: Verified GitHub connectivity by tailing the full `paper-map-updater` automation through recluster, map generation, artifact verification, commit, and push into `mintresearch.org`. Confirmed the first observed automated auto-recluster run completed and deployed refreshed paper-map assets plus `src/data/stats.json`.
**Decisions**: Used the live daemon run as the verification path instead of restarting it. Treated pandas/matplotlib/SciPy warnings as non-blocking because the daemon verified all expected artifacts and pushed `5b4d5e1..ef5b253` to `main`.
**State**: Automated deployment path is working end-to-end. `recluster_state.json` now shows `last_run_iso=2026-03-09T17:22:32.819956` and `paper_count=3013`. Next step is to monitor the next scheduled `04:00 AEDT` run for repeatability.
**Session**: `019cd0fa-4223-7432-8dc8-d28b9c856c68`

## 2026-03-03 | Lab-Minty-273d6c8e

**Work**: Fixed paper map fonts by patching datamapplot source library (`datamap.js` line 183: `fontFamily = "Roboto"` -> `"JetBrains Mono"`). Regenerated map twice from Python with terminal styling baked into `create_paper_map.py` (border-radius:0, ANSI colors, teal accents, JetBrains Mono throughout). Applied terminal design to filter panel CSS in source.
**Decisions**: Patching generated HTML was futile -- every regeneration re-inlined Roboto from the library default. Fixed at source in the venv. SDF rendering disabled (`fontSettings: {sdf: false}`) to use Canvas 2D text which respects fontFamily.
**State**: Live with JetBrains Mono. datamapplot venv patch will be lost on upgrade -- needs fork or post-install script.
**Session**: `7031c6af-7a01-44fe-b9a0-e3ce273d6c8e`

## 2026-03-02 | TerMinty-97e1fac9

**Work**: Recovered hung session c0ca2e6b via SpecStory API. Re-clustered full corpus (1891 to 1996 papers, 28 clusters) using fixed `recluster_corpus.py`. Eliminated "Other" category (21 micro-topics reassigned). Added discipline classification (15 buckets). Built interactive filter panel with 3-way toggle (Research Areas / Both / Disciplines). Backfilled 113 embeddings. Queued 139 papers for 41q/RAPTOR re-ingestion via corpus-ingest.
**Decisions**: k=28 from silhouette sweep. "Other" remap via Opus classification. 3-way toggle with AND intersection for combined filters. Re-ingestion (pull from DB, re-ingest via daemon) rather than in-place backfill for 41q/RAPTOR.
**State**: Live at mint-philosophy.github.io/paper-map/ with 1,996 papers. 139 papers queued for re-ingestion. 8 papers need PDFs manually sourced. Re-export needed after re-ingestion completes.
**Session**: `715ac35b-3277-4c9c-a2d6-608197e1fac9`

## 2026-02-05 | TerMinty-5b5d

**Work**: Built interactive paper map visualization of MINT corpus (1,352 papers) using datamapplot. Deployed to GitHub Pages at mint-philosophy.github.io/paper-map. Features: UMAP projection, hierarchical labels, search by title+author, click-to-Drive links.
**Decisions**: Used OpenAlex for citations but discovered massive mismatches (3% accuracy) — removed citation sizing. Used custom JS to fix datamapplot click handler bug.
**State**: Live and working. Next agent: dedupe 95 duplicate groups, re-cluster 217 uncategorized papers, ingest Shen & Tamkin 2026.
**Session**: `20260205-195631-5b5d` | Claude: check session json

## 2026-02-05 | TerMinty-4786

**Work**: Deduplicated corpus (116 papers removed, 1249 remaining) and assigned clusters/categories to 147 uncategorized papers. Regenerated paper map with 1,240 papers.
**Scripts**: Created `dedupe_corpus.py`, `assign_clusters.py`, `assign_macro_category.py`
**Decisions**: Used completeness scoring (abstract, cluster_id, drive_url, etc.) to pick best paper from duplicate groups. Assigned uncategorized papers to nearest cluster centroid by cosine similarity, then propagated macro_category from most common in cluster.
**State**: Map live with clean data. Still need: ingest Shen & Tamkin 2026.
**Session**: `20260205-225459-4786`
