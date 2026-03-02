# MINT Website — TODO

## Content (needs Seth/Theo input)
- [ ] **Research project descriptions**: Replace placeholder text for all three cards (Normative Competence, Agents, Post-AGI Political Philosophy) — each needs a 2–3 sentence summary + 1–2 paragraph full description
- [ ] **Lab overview text**: Review/rewrite the About section paragraph for the JHU era
- [ ] **Seth's bio**: Review/update current text
- [ ] **Contact email**: Confirm if still `mint@anu.edu.au` or update to JHU address
- [ ] **People roster**: Review and update — some may have moved on, new members may need adding

## Future Features
- [ ] **People sub-pages**: Clicking a person card opens their own page with full bio, publications, links. Test with Theo's profile first. Could be generated from `site-data.js` as individual HTML pages or a single template that reads a URL parameter.
- [ ] **News update pipeline**: Connect to a Google Sheet or Notion database so updating news items = editing a spreadsheet, not touching code. Explore: (a) build script that pulls from Sheet/Notion and writes to `site-data.js`, (b) client-side fetch from a public Sheet/Notion API at page load.
- [ ] **Real headshot photos** for team members
- [ ] **Seth's headshot** in the About section
- [ ] **Remove WIP notice** once content is finalized

## Infrastructure
- [ ] Cloudflare DNS setup for apex domain (mintresearch.org)
- [ ] Point custom domain to mint-philosophy/mint-website when ready

## Done
- [x] Site skeleton (index.html, style.css, site-data.js)
- [x] All 60 people from old site roster
- [x] Publications, events, news feed with filtering
- [x] Progressive disclosure (expandable cards, collapsible people groups)
- [x] Responsive design (mobile hamburger, fluid layout)
- [x] Asset organization (logos, minties)
- [x] Design playground for visual tweaking
- [x] Scroll progress bar
- [x] Person card avatars (initials, photo-ready)
- [x] Newsletter category + Philosophy of Computing Substack
- [x] Theo added to team roster
- [x] Deployed to mint-philosophy GitHub org
- [x] Square favicon
