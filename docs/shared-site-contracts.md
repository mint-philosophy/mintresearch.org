# MINT shared site contracts

The banner and primary navigation are small, public, framework-neutral
contracts served by `mintresearch.org`. Paper sites can inherit the pieces that
should stay consistent without importing the main site's full theme.

## Compatibility and ownership

- `mint-banner.css` and `mint-banner.js` are the stable banner contract. The
  script exposes `window.MintBanner.version` and remains backward compatible
  within major version 1.
- `mint-site-nav.v1.js` is explicitly major-versioned in its filename and
  exposes `window.MintSiteNav.version`. Breaking data or markup changes require
  a `v2` asset; compatible additions stay in `v1`.
- The navigation is primary navigation, not the XML sitemap. It contains the
  maintained public destinations that need routine discovery, but not the
  archival Agent Reports index, generated reports, or individual newsletter
  issues.
- Shared scripts own data, generated markup, asset URLs, active states, and
  accessibility state. A consumer owns its sidebar shell, search UI, theme,
  status line, and page-local scroll-spy behaviour.

## Banner

Load the banner stylesheet and script, then provide an empty mount:

```html
<link rel="stylesheet" href="https://mintresearch.org/assets/mint-banner.css">
<div class="top-banner"></div>
<script defer src="https://mintresearch.org/assets/mint-banner.js"></script>
```

The script creates `.top-banner-inner`, the linked MINT logo, and all eight
Minties. The stylesheet owns the component's internal flex layout, responsive
wrapping, image sizing, and reduced-motion behaviour. The script observes the
rendered banner and publishes its actual height to both `--banner-h` on the
document root and `--mint-banner-height` on the mount.

The host page still owns placement and surfaces, for example:

```css
.top-banner {
  position: fixed;
  inset: 0 0 auto var(--sidebar-w);
  z-index: 90;
  background: var(--bg-0);
  border-bottom: 1px solid var(--border);
}
```

An empty mount intentionally renders nothing when JavaScript is unavailable.
If a visible no-JavaScript fallback is required, provide the logo structure;
the component will reuse it and add the Minties without replacing descendants:

```html
<div class="top-banner">
  <div class="top-banner-inner">
    <a class="top-banner-home" href="https://mintresearch.org/">
      <img class="top-banner-logo"
           src="https://mintresearch.org/assets/mint-banner.png"
           alt="MINT LAB">
    </a>
  </div>
</div>
```

For an explicitly selected mount, call
`MintBanner.mount(elementOrSelector, options)`. The automatic initializer mounts
every `.top-banner`. A successful mount dispatches the bubbling
`mint-banner:rendered` event.

## Primary navigation

The renderer uses the existing MINT classes (`nav-link`, `nav-page`,
`nav-group`, `nav-sections`, `expanded`, `nav-section`, `sub-link`,
`nav-divider`, and `nav-mark`) so a paper can retain its own colour and spacing
theme. It sets `aria-current`, expanded state, stable navigation IDs, and group
labels. Canonical root-relative links are resolved against the origin that
served the shared script, so an external paper links to `mintresearch.org`
rather than accidentally resolving paths on its own host.

Keep a small useful fallback inside the mount. It remains visible if the shared
script cannot load and is replaced only after the new DOM has been built:

```html
<div class="nav-pages" id="siteNav">
  <a class="nav-link nav-page" href="https://mintresearch.org/">About MINT Lab</a>
  <a class="nav-link nav-page" href="#paper">Paper</a>
</div>
```

### A registered paper

Declare configuration before the deferred shared script. This also works when
the paper's own non-deferred script runs at the end of `body`:

```html
<script>
window.MintSiteNavConfig = {
  target: '#siteNav',
  currentId: 'blind-refusal',
  local: {
    parentId: 'blind-refusal',
    sections: [
      { id: 'paper', href: '#paper', label: 'Paper' },
      { id: 'references', href: '#references', label: 'References' }
    ]
  }
};
</script>
<script defer src="https://mintresearch.org/assets/mint-site-nav.v1.js"></script>
```

### A new template paper

A newly instantiated paper does not need to wait for a main-site change. Inject
it into the Microsites group with a stable, URL-like ID:

```js
window.MintSiteNavConfig = {
  target: '#siteNav',
  local: {
    parentId: 'microsites',
    currentId: 'example-paper',
    label: 'Example Paper',
    href: '#top',
    sections: [
      { id: 'abstract', href: '#abstract', label: 'Abstract' },
      { id: 'paper', href: '#paper', label: 'Paper' },
      { id: 'references', href: '#references', label: 'References' }
    ]
  }
};
```

The renderer inserts this current paper as the first Microsites leaf, followed
immediately by its local outline and then the canonical sibling microsites. Once
the same stable ID is added to the canonical contract, it automatically reuses
that entry rather than rendering a duplicate. Set `position: 'last'` on `local`
only when the temporary paper should follow the registered microsites.

The Microsites group is collapsed by default and expands automatically when one
of its children is active. Its heading is a button with `aria-expanded` and
`aria-controls`; consumers should preserve the button semantics and style it
with `.nav-group`. Static no-JavaScript fallbacks may use a collapsed
`<details class="nav-fallback-group">` with the same leaves.

### Direct API and events

Once loaded, `MintSiteNav.render(config)` is synchronous and returns the mount.
It accepts `target`, optional `currentUrl`, optional `currentId`, optional
`siteOrigin`, and the `local` object shown above. `MintSiteNav.autoRender()`
renders mounts carrying `data-mint-site-nav`; simple mounts can use
`data-current-id`, `data-current-url`, and `data-site-origin` attributes.

The script dispatches `mint-site-nav:ready` on `window` after installing the
API. Each successful render dispatches the bubbling `mint-site-nav:rendered`
event on the mount. Consumer-local links carry `data-page-anchor`; the current
microsite leaf carries `data-microsite-current`. Scroll-spy code should refresh
its link references in response to `mint-site-nav:rendered`. Every rendered
section also carries style-neutral `data-nav-depth` metadata; consumers can use
selectors such as `[data-nav-depth="3"]` to indent nested appendix links without
introducing paper-specific classes into the shared renderer.

## Contract checks

```sh
npm run check:contracts
npm run check:banner -- --check-blind-refusal
```

The local banner check includes the tall, narrow 901px desktop case that
previously clipped when a sidebar reduced the available width. The navigation
check covers canonical labels, external URL resolution, accessible active
state, consumer anchors, temporary-paper injection, and canonical deduplication.
