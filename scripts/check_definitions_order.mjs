import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../agif-router-worker/site-assets/definitions/', import.meta.url);
const html = readFileSync(new URL('deck.html', root), 'utf8');
const script = readFileSync(new URL('deck.js', root), 'utf8');
const attributes = (text) => Object.fromEntries([...text.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
class Element {
  constructor(attrs = {}) {
    this.attrs = attrs;
    this.dataset = Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]));
    this.children = [];
    this.events = {};
    this.style = {};
    this.classes = new Set((attrs.class || '').split(' '));
    this.classList = { add: (c) => this.classes.add(c), remove: (c) => this.classes.delete(c), toggle: (c, enabled) => enabled ? this.classes.add(c) : this.classes.delete(c) };
  }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(k, handler) { this.events[k] = handler; }
  appendChild(child) { this.children.push(child); }
  querySelectorAll() { return this.children; }
  closest() { return null; }
}
const slides = [...html.matchAll(/<section class="slide\b[^>]*>/g)].map((m) => new Element(attributes(m[0])));
const buttons = [...html.matchAll(/<button[^>]+data-go="\d+"[^>]*>/g)].map((m) => new Element(attributes(m[0])));
const ids = Object.fromEntries(['navDots', 'slideCounter', 'sectionName', 'progressFill', 'previousSlide', 'nextSlide'].map((id) => [id, new Element()]));
const documentEvents = {};
const document = {
  documentElement: { dataset: {} },
  querySelectorAll: (selector) => selector === '.slide' ? slides : selector === '[data-go]' ? buttons : [],
  querySelector: () => null,
  getElementById: (id) => ids[id],
  createElement: () => new Element(),
  addEventListener: (event, handler) => { documentEvents[event] = handler; },
};
const windowEvents = {};
const window = { location: { hash: '', origin: 'https://fellowship.mintresearch.org' }, addEventListener: (event, handler) => { windowEvents[event] = handler; }, dispatchEvent() {} };
vm.runInNewContext(script, { document, window, Element, HTMLDialogElement: Element, CustomEvent: class {}, history: { replaceState: (_state, _title, hash) => { window.location.hash = hash; } } });

const expected = ['df-title', 'df-intelligence', 'df-retire', 'df-defs', 'df-waypoints', 'df-normal', 'df-bottlenecks'];
assert.equal(slides.length, 7);
assert.deepEqual(slides.map((slide) => Number(slide.dataset.presentationIndex)).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6]);
const active = () => slides.find((slide) => slide.classes.has('active')).dataset.sid;
for (let index = 0; index < expected.length; index++) {
  ids.navDots.children[index].events.click();
  assert.equal(active(), expected[index]);
  assert.equal(ids.slideCounter.textContent, `${index + 1} / 7`);
  assert.match(slides.find((slide) => slide.dataset.sid === active()).attrs['aria-label'], new RegExp(`^Slide ${index + 1} of 7:`));
  buttons[index].events.click({});
  assert.equal(active(), expected[index]);
  assert.equal(buttons[index].dataset.goSid, expected[index]);
}
window.location.hash = '#slide-2';
windowEvents.hashchange();
assert.equal(active(), 'df-intelligence');
window.location.hash = '#slide-5';
windowEvents.hashchange();
assert.equal(active(), 'df-waypoints');
ids.nextSlide.events.click();
assert.equal(active(), 'df-normal');
ids.previousSlide.events.click();
assert.equal(active(), 'df-waypoints');
// Runtime navigation must not reorder DOM nodes used for saved editor identities.
assert.deepEqual(slides.map((slide) => slide.dataset.sid), ['df-title', 'df-retire', 'df-defs', 'df-normal', 'df-waypoints', 'df-bottlenecks', 'df-intelligence']);
const quoteSlide = html.match(/<section class="slide df-intelligence-quote"[\s\S]*?<\/section>/)?.[0];
assert.ok(quoteSlide);
assert.match(quoteSlide, /<h2 data-pretext>what is intelligence\?<\/h2>/);
assert.ok(quoteSlide.includes('<p class="df-intelligence-text" data-pretext>Artificial intelligence is that activity devoted to making machines intelligent, and intelligence is that quality that enables an entity to function appropriately and with foresight in its environment.</p>'));
assert.ok(quoteSlide.includes('<p class="df-intelligence-attribution" data-pretext>(Nilsson 2010)</p>'));
assert.equal((quoteSlide.match(/data-pretext(?=[ >])/g) || []).length, 3);
assert.equal((html.match(/data-pretext(?=[ >])/g) || []).length, 39);
console.log('Definitions order passed: exact Nilsson quote at slide 2, extension slide 5, normal technology slide 6; seven navigation targets agree; original source/editor order unchanged.');
