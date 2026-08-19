import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('public/assets/mint-site-nav.v1.js', 'utf8');
assert.ok(!source.includes('innerHTML'), 'navigation renderer must build trusted DOM without innerHTML');
assert.ok(source.includes("'mint-site-nav:ready'"), 'navigation contract must dispatch its ready event');
assert.ok(source.includes("'mint-site-nav:rendered'"), 'navigation contract must dispatch its rendered event');
assert.ok(source.includes("'data-page-anchor'"), 'navigation contract must mark consumer page anchors');
assert.ok(source.includes("'data-microsite-current'"), 'navigation contract must mark the current microsite');
assert.ok(source.includes("'data-nav-depth'"), 'navigation contract must publish style-neutral nesting depth');

const staticPages = [
  'public/index.html',
  'public/agent-reports/index.html',
  'public/corpus-map/index.html',
  'public/cv/index.html',
  'public/data-dash/index.html',
  'public/guide/index.html',
  'public/newsletter/index.html',
  'public/governing-with-agents/index.html',
  'public/ai-culture/index.html'
];
for (const page of staticPages) {
  const html = fs.readFileSync(page, 'utf8');
  assert.equal((html.match(/data-mint-site-nav/g) || []).length, 1, `${page} must expose one shared-navigation mount`);
  assert.equal((html.match(/\/assets\/mint-site-nav\.v1\.js/g) || []).length, 1, `${page} must load the versioned navigation once`);
  assert.equal((html.match(/\/assets\/mint-site-nav\.v1\.js\?v=\d{8}\.\d+/g) || []).length, 1, `${page} must cache-bust the shared navigation`);
  assert.equal((html.match(/\/assets\/mint-banner\.css/g) || []).length, 1, `${page} must load the shared banner stylesheet once`);
  assert.equal((html.match(/\/assets\/mint-banner\.js/g) || []).length, 1, `${page} must load the shared banner once`);
  assert.equal((html.match(/<div class="top-banner" aria-label="MINT Lab masthead"><\/div>/g) || []).length, 1, `${page} must use an empty shared-banner mount`);
}

const presentationPages = [
  'public/lab-overview/index.html',
  'public/nc/index.html',
  'public/FDC.html',
  'public/navigating/index.html'
];
for (const page of presentationPages) {
  const html = fs.readFileSync(page, 'utf8');
  assert.equal((html.match(/\/assets\/mint-site-nav\.v1\.js/g) || []).length, 1, `${page} must load the versioned navigation once`);
  assert.equal((html.match(/\/assets\/mint-site-nav\.v1\.js\?v=\d{8}\.\d+/g) || []).length, 1, `${page} must cache-bust the shared navigation`);
  assert.equal((html.match(/\/assets\/mint-banner\.css/g) || []).length, 1, `${page} must load the shared banner stylesheet once`);
  assert.equal((html.match(/\/assets\/mint-banner\.js/g) || []).length, 1, `${page} must load the shared banner once`);
}
const fallbackPages = [
  'public/404.html',
  'public/agent-reports/index.html',
  'public/corpus-map/index.html',
  'public/cv/index.html',
  'public/data-dash/index.html',
  'public/guide/index.html',
  'public/index.html',
  'public/newsletter/index.html'
];
for (const page of fallbackPages) {
  const html = fs.readFileSync(page, 'utf8');
  assert.equal((html.match(/\/assets\/mint-site-nav\.v1\.js\?v=\d{8}\.\d+/g) || []).length, 1, `${page} must cache-bust the shared navigation`);
  assert.equal((html.match(/href="\/navigating\/"/g) || []).length, 1, `${page} fallback must list Navigating the AGI Reckoning once`);
  assert.equal((html.match(/Navigating the AGI Reckoning/g) || []).length, 1, `${page} fallback must use the current Navigating title once`);
}
const aiCultureFallbackPages = [
  'public/agent-reports/index.html',
  'public/ai-culture/index.html',
  'public/corpus-map/index.html',
  'public/cv/index.html',
  'public/data-dash/index.html',
  'public/governing-with-agents/index.html',
  'public/guide/index.html',
  'public/index.html',
  'public/newsletter/index.html'
];
for (const page of aiCultureFallbackPages) {
  const html = fs.readFileSync(page, 'utf8');
  assert.equal((html.match(/AI \(etc\) in Culture/g) || []).length, 1, `${page} fallback must use the current AI culture menu label once`);
}
const presentationShell = fs.readFileSync('public/assets/presentation-shell.js', 'utf8');
assert.ok(presentationShell.includes('data-mint-site-nav'), 'presentation shell must expose the shared-navigation mount');
assert.ok(presentationShell.includes('<div class="top-banner" aria-label="MINT Lab masthead"></div>'), 'presentation shell must use an empty shared-banner mount');
assert.ok(!presentationShell.includes('var pages = ['), 'presentation shell must not duplicate navigation data');
assert.ok(!presentationShell.includes('mintyImages'), 'presentation shell must not duplicate banner image data');

class FakeClassList {
  constructor(element) { this.element = element; }
  add(...names) {
    const classes = new Set(this.element.className.split(/\s+/).filter(Boolean));
    names.forEach((name) => classes.add(name));
    this.element.className = [...classes].join(' ');
  }
}

class FakeNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.children = [];
    this.parentNode = null;
  }
  appendChild(child) {
    if (child.nodeType === 11) {
      [...child.children].forEach((nested) => this.appendChild(nested));
      child.children = [];
      return child;
    }
    if (child.parentNode) child.parentNode.removeChild(child);
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  removeChild(child) {
    this.children.splice(this.children.indexOf(child), 1);
    child.parentNode = null;
    return child;
  }
  get firstChild() { return this.children[0] || null; }
}

class FakeElement extends FakeNode {
  constructor(tagName) {
    super(1);
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.attributes = new Map();
    this.classList = new FakeClassList(this);
    this.events = [];
    this.hidden = false;
    this.href = '';
    this.id = '';
    this.listeners = new Map();
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
  }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  dispatchEvent(event) {
    this.events.push(event);
    event.target = this;
    return true;
  }
  addEventListener(name, handler) {
    const handlers = this.listeners.get(name) || [];
    handlers.push(handler);
    this.listeners.set(name, handlers);
  }
  click() {
    (this.listeners.get('click') || []).forEach((handler) => handler({ target: this }));
  }
}

class FakeText extends FakeNode {
  constructor(text) { super(3); this.textContent = text; }
}

class FakeFragment extends FakeNode {
  constructor() { super(11); }
}

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.detail = options.detail;
  }
}

const document = {
  currentScript: { src: 'https://mintresearch.org/assets/mint-site-nav.v1.js' },
  readyState: 'loading',
  createElement: (tagName) => new FakeElement(tagName),
  createTextNode: (text) => new FakeText(text),
  createDocumentFragment: () => new FakeFragment(),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
const windowEvents = [];
const window = {
  location: { href: 'https://blindrefusal.mintresearch.org/' },
  dispatchEvent: (event) => { windowEvents.push(event); return true; }
};

vm.runInNewContext(source, { window, document, URL, CustomEvent: FakeCustomEvent });
const api = window.MintSiteNav;
assert.ok(api, 'navigation contract must expose window.MintSiteNav');
assert.match(api.version, /^1\./, 'v1 asset must expose a v1 semantic version');
assert.ok(Object.isFrozen(api.items), 'canonical navigation must be immutable');
assert.ok(windowEvents.some((event) => event.type === 'mint-site-nav:ready'), 'ready event was not dispatched');

const flatten = (items) => items.flatMap((item) => [
  item,
  ...flatten(item.children || []),
  ...flatten(item.sections || [])
]);
const canonical = flatten(api.items);
const ids = canonical.map((item) => item.id).filter(Boolean);
assert.equal(new Set(ids).size, ids.length, 'canonical navigation ids must be unique');
assert.ok(!canonical.some((item) => item.id === 'agent-reports'), 'Agent Reports must not occupy primary navigation');
assert.ok(canonical.some((item) => item.id === 'governing-with-agents' && item.href === '/governing-with-agents/'), 'Governing with Agents must be listed under microsites');
assert.ok(canonical.some((item) => item.id === 'ai-culture' && item.href === '/ai-culture/' && item.label === 'AI (etc) in Culture'), 'AI (etc) in Culture must be listed under microsites');
assert.ok(canonical.some((item) => item.id === 'navigating-agi-reckoning' && item.href === '/navigating/' && item.label === 'Navigating the AGI Reckoning'), 'Navigating the AGI Reckoning must be listed under microsites');
assert.ok(canonical.some((item) => item.id === 'about-papers' && item.label === 'Papers'), 'homepage section must use Papers');
assert.ok(!canonical.some((item) => item.href === '/reports/ai-in-war/'), 'primary navigation must not enumerate report leaves');
assert.ok(!canonical.some((item) => /2026-\d\d-\d\d-weekly/.test(item.href || '')), 'primary navigation must not enumerate newsletter issues');

const walk = (node) => [node, ...node.children.flatMap(walk)];
const byAttribute = (root, name, value) => walk(root).filter((node) =>
  node.nodeType === 1 && node.getAttribute(name) !== null &&
  (value === undefined || node.getAttribute(name) === value)
);

const blindRefusalMount = new FakeElement('div');
api.render({
  target: blindRefusalMount,
  currentUrl: 'https://blindrefusal.mintresearch.org/#paper',
  currentId: 'blind-refusal',
  local: {
    parentId: 'blind-refusal',
    sections: [
      { id: 'paper', href: '#paper', label: 'Paper' },
      {
        id: 'appendix',
        href: '#appendix',
        label: 'Appendix',
        children: [{ id: 'appendix-a', href: '#appendix-a', label: 'Appendix A' }]
      }
    ]
  }
});
assert.equal(blindRefusalMount.getAttribute('data-mint-site-nav-rendered'), '1');
assert.ok(blindRefusalMount.events.some((event) => event.type === 'mint-site-nav:rendered'), 'rendered event was not dispatched');
assert.equal(byAttribute(blindRefusalMount, 'data-microsite-current').length, 1, 'current microsite hook must be unique');
assert.equal(byAttribute(blindRefusalMount, 'data-page-anchor').length, 3, 'all local anchors need the stable hook');
assert.equal(byAttribute(blindRefusalMount, 'data-nav-depth', '3').length, 1, 'nested paper sections need a style-neutral depth hook');
assert.equal(byAttribute(blindRefusalMount, 'aria-current', 'page').length, 1, 'current page needs accessible state');
const aboutLink = byAttribute(blindRefusalMount, 'data-nav-id', 'about')[0];
assert.equal(aboutLink.href, 'https://mintresearch.org/', 'main-site links must resolve against the contract origin');
const blindRefusalOrder = walk(blindRefusalMount);
const currentMicrosite = byAttribute(blindRefusalMount, 'data-nav-id', 'blind-refusal')[0];
const firstLocalAnchor = byAttribute(blindRefusalMount, 'data-page-anchor')[0];
const siblingMicrosite = byAttribute(blindRefusalMount, 'data-nav-id', 'moral-reasoning')[0];
assert.ok(currentMicrosite, 'Blind Refusal must retain its current paper row');
assert.ok(firstLocalAnchor, 'the active paper must retain its local page outline');
assert.ok(siblingMicrosite, 'Blind Refusal must retain its sibling microsites');
assert.ok(
  blindRefusalOrder.indexOf(currentMicrosite) < blindRefusalOrder.indexOf(firstLocalAnchor) &&
    blindRefusalOrder.indexOf(firstLocalAnchor) < blindRefusalOrder.indexOf(siblingMicrosite),
  'the active paper outline must sit between its paper row and sibling microsites'
);

const regularMount = new FakeElement('div');
api.render({
  target: regularMount,
  currentUrl: 'https://mintresearch.org/'
});
const micrositesButton = byAttribute(regularMount, 'data-nav-id', 'microsites')[0];
assert.ok(micrositesButton, 'Microsites must be collapsed by default away from a microsite');
assert.equal(micrositesButton.getAttribute('aria-expanded'), 'false', 'Microsites control must report its collapsed state');
const micrositesPanelId = micrositesButton.getAttribute('aria-controls');
const micrositesPanel = walk(regularMount).find((node) => node.id === micrositesPanelId);
assert.equal(micrositesPanel.hidden, true, 'collapsed microsite children must be hidden');
micrositesButton.click();
assert.equal(micrositesButton.getAttribute('aria-expanded'), 'true', 'Microsites control must expand on click');
assert.equal(micrositesPanel.hidden, false, 'expanded microsite children must be visible');

const templateMount = new FakeElement('div');
api.render({
  target: templateMount,
  currentUrl: 'https://example-paper.test/',
  local: {
    parentId: 'microsites',
    currentId: 'example-paper',
    label: 'Example Paper',
    href: '#top',
    sections: [{ id: 'abstract', href: '#abstract', label: 'Abstract' }]
  }
});
const injected = byAttribute(templateMount, 'data-nav-id', 'example-paper');
assert.equal(injected.length, 1, 'an unregistered template paper must be injected once');
assert.equal(injected[0].href, '#top', 'an injected paper link must stay on the consumer page');
assert.equal(injected[0].getAttribute('data-microsite-current'), '', 'injected paper must be marked current');
const templateLocalAnchor = byAttribute(templateMount, 'data-page-anchor')[0];
const templateSibling = byAttribute(templateMount, 'data-nav-id', 'blind-refusal')[0];
assert.ok(templateLocalAnchor, 'an injected paper must retain its local outline');
assert.ok(templateSibling, 'an injected paper must retain canonical sibling microsites');
const templateOrder = walk(templateMount);
assert.ok(
  templateOrder.indexOf(injected[0]) < templateOrder.indexOf(templateLocalAnchor) &&
    templateOrder.indexOf(templateLocalAnchor) < templateOrder.indexOf(templateSibling),
  'an injected paper outline must sit between its paper row and canonical sibling microsites'
);

const dedupeMount = new FakeElement('div');
api.render({
  target: dedupeMount,
  currentUrl: 'https://blindrefusal.mintresearch.org/',
  local: {
    parentId: 'microsites',
    currentId: 'blind-refusal',
    label: 'Blind Refusal',
    href: '#top',
    sections: [{ id: 'paper', href: '#paper', label: 'Paper' }]
  }
});
assert.equal(byAttribute(dedupeMount, 'data-nav-id', 'blind-refusal').length, 1, 'a now-canonical paper must not be duplicated');

console.log('MINT site navigation contract passed: canonical hierarchy, safe cross-origin links, accessible current state, local anchors, injected papers, and deduplication.');
