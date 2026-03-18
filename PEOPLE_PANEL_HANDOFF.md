# People Detail Panel — Implementation Handoff

## Design Decision
**Terminal Card** (Option A from playground at `/Volumes/Agents/Active-Research/minty-private/Scratchpads/people-panel-playground.html`)

### Design Spec
- Panel appears **above** the people grid, same width
- `● ● ●` window dots header (matching site Card component)
- Headshot (square, dashed teal border) on left, facts on right (desktop); stacked on mobile
- Facts as key-value rows: `role:`, `field:`, `affil:`
- Bio in a bordered code block with `# bio` prefix
- Links as inline teal text
- **Accordion**: clicking another person swaps; clicking same closes
- Close `×` button top-right

### Data Sources
- **Headshots**: Google Drive folder `1B0fIKLphrbRRcPcjxcJ7X4f9r4KAmjTZ` (shared)
- **Team bios/info**: Google Drive folder `1Zw9q4GFysw6iDCCC92lp5lGRd5TFS7wS` (shared)
- Needs vault Gmail auth to access Drive API

### Implementation Plan
1. Create `src/data/people.ts` with structured data for each person (name, role, disc, affiliation, bio, links, headshot filename)
2. Download headshots from Drive → resize → save to `public/assets/people/`
3. Read team info docs from Drive for bios
4. Add `PersonPanel.astro` component (or inline in index.astro)
5. Add CSS to global.css (use playground CSS as base — `.opt-a` styles)
6. Add click-to-expand JS in index.astro or BaseLayout.astro
7. Apply to Team section (not Affiliates/Alumni — too many, and less info available)

### Current People Section
- `src/pages/index.astro` lines 60-162
- Team: 24 members, Affiliates: 32, Alumni: 30
- Currently simple `.person-card` with name/role/disc
