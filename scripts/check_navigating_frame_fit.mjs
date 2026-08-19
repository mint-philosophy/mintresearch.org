import assert from 'node:assert/strict';
import fs from 'node:fs';

const deck = fs.readFileSync('public/navigating/deck.html', 'utf8');
const wrapper = fs.readFileSync('public/navigating/index.html', 'utf8');
const shellScript = fs.readFileSync('public/assets/presentation-shell.js', 'utf8');

assert.equal((deck.match(/<div class="slide(?: active)?" data-name=/g) || []).length, 10, 'navigating deck must contain ten ordered slides');
assert.equal((deck.match(/<div class="slide active" data-name=/g) || []).length, 1, 'exactly one slide must be active initially');
assert.ok(deck.includes('Navigating the AGI Reckoning'), 'deck must use the edited title');
assert.ok(deck.includes('A different kind of applied philosophy.'), 'deck must include the edited closing claim');
assert.ok(deck.includes('Into this comes <span class="highlight"><strong>math that wakes sand up.</strong></span>'), 'slide two must keep the highlighted phrase inline with its sentence');
assert.ok(!deck.includes('<p class="fi d3"><span class="highlight"><strong>math that wakes sand up.</strong></span></p>'), 'slide two must not force the highlighted phrase into a standalone paragraph');
assert.ok(deck.includes('<h3>Mechanistic/Cognitive</h3>'), 'slide three must use the edited mechanistic/cognitive heading');
assert.ok(deck.includes('<h3>Capabilities</h3>'), 'slide three must use the edited capabilities heading');
assert.ok(deck.includes('<h3>Outcomes</h3>'), 'slide three must use the edited outcomes heading');
assert.ok(deck.includes('overall impact on society, e.g. Transformative AI'), 'slide three must include the edited outcomes example');
assert.ok(!deck.includes('<h3>Internalist AGI</h3>'), 'slide three must not retain the superseded internalist heading');
assert.ok(!deck.includes('<h3>Behavioural AGI</h3>'), 'slide three must not retain the superseded behavioural heading');
assert.ok(!deck.includes('<h3>Transformative AI</h3>'), 'slide three must not retain the superseded transformative heading');
assert.equal((deck.match(/<div class="cap-card fi d\d">/g) || []).length, 4, 'slide seven must contain four editable-source capacity panels');
assert.ok(deck.includes('<div class="cap-label">What should we align to?!</div>'), 'slide seven must include the new alignment-question panel heading');
assert.ok(deck.includes('A whole new field of normative ethics beckons.'), 'slide seven must include the saved PowerPoint panel text');
assert.ok(!deck.includes('LOREM IPSUM'), 'slide seven must not retain the placeholder panel heading');
assert.ok(!deck.includes('Lorem ipsum dolor sit amet'), 'slide seven must not retain placeholder panel text');
assert.ok(deck.includes('--teal: #2DD4BF'), 'deck must use the approved teal accent');
assert.ok(!deck.includes('--yellow'), 'navigating deck must not retain the old yellow token');
assert.ok(!deck.includes('The AGI-Ready Policy Student'), 'navigating deck must not retain the old title');
assert.ok(!deck.includes('The Billion Golems'), 'navigating deck must not retain the old ticker sequence');

assert.ok(deck.includes('height: var(--ticker-h);'), 'ticker height must use the shared variable');
assert.ok(deck.includes('.progress { position: fixed; top: var(--ticker-h);'), 'progress must follow the measured ticker variable');
assert.ok(deck.includes('const tickerH = parseFloat(rootStyles.getPropertyValue(\'--ticker-h\')) || 40;'), 'tooltip bounds must read ticker height from CSS');
assert.ok(deck.includes('const navH = parseFloat(rootStyles.getPropertyValue(\'--nav-h\')) || 64;'), 'tooltip bounds must read footer height from CSS');
assert.ok(deck.includes('writing-mode: vertical-rl; transform: rotate(180deg);'), 'side labels must use stable vertical writing mode');
assert.ok(deck.includes('.vlabel { display: none; }'), 'side labels must disappear in the stacked layout');
assert.ok(deck.includes("document.createElement('button')"), 'slide dots must be semantic buttons');
assert.ok(deck.includes("d.setAttribute('aria-label','Go to slide '+(i+1))"), 'slide dots must have accessible labels');
assert.ok(deck.includes("d.setAttribute('aria-current',active?'true':'false')"), 'slide dots must expose current state');
assert.ok(deck.includes('animation: scroll-ticker 55s linear infinite;'), 'the authored chyron must retain its continuous scrolling animation');
assert.ok(!deck.includes('.ticker-track { animation: none; }'), 'the navigating conversion must not suppress the authored chyron');
assert.ok(!deck.includes('.slide, .progress-fill, .nav-dot { transition: none; }'), 'the navigating conversion must not suppress the authored navigation effects');
assert.equal((deck.match(/class="tiptext"/g) || []).length, 3, 'only the three source-grounded waypoint tooltips should be live');

assert.ok(!deck.includes('@chenglou/pretext'), 'runtime fitting must not load the retired Pretext path');
assert.ok(deck.includes('function fitSlideWithinFrame'), 'every slide must use bounded frame fitting');
assert.ok(deck.includes('FIT_SEARCH_ITERATIONS = 10'), 'frame fitting must use a bounded search');
assert.ok(deck.includes('document.createTreeWalker(slide, NodeFilter.SHOW_TEXT)'), 'containment must measure rendered text nodes');
assert.ok(deck.includes('projected.right <= frame.right - FRAME_INSET'), 'containment must preserve the right safety inset');
assert.ok(deck.includes('projected.bottom <= frame.bottom - FRAME_INSET'), 'containment must preserve the bottom safety inset');
assert.ok(deck.includes("slide.classList.add('fit-scroll-fallback');"), 'failed containment must restore readable scrolling');
assert.ok(deck.includes("const responsiveStack = matchMedia('(max-width: 900px)').matches;"), 'stacked tablet and phone layouts must preserve readable text');
assert.ok(deck.includes('const contained = fits && (!responsiveStack || scale >= preferredFloor);'), 'stacked layouts must scroll instead of shrinking below the readable floor');
assert.ok(deck.includes('document.fonts.ready.then(fitSlides)'), 'font readiness must trigger refitting');
assert.ok(deck.includes("event.data === 'mint-presentation-resize'"), 'shell resize messages must trigger refitting');
assert.ok(deck.includes('window.refitPresentationSlides = fitSlides'), 'deck must expose a generic refit hook');
assert.ok(deck.includes('window.refitFdcSlides = fitSlides'), 'deck must retain the shared-shell compatibility hook');

assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(wrapper), 'listed wrapper must remain indexable');
assert.ok(wrapper.includes('data-presentation-path="/navigating/"'), 'wrapper must publish its canonical path to the shell');
assert.ok(wrapper.includes('src="deck.html?v=20260819.3"'), 'wrapper must bypass stale deck caches');
assert.ok(shellScript.includes('frame.contentWindow.refitFdcSlides?.()'), 'shared shell must call the compatibility refit hook');

console.log('Navigating frame-fit contract passed: corrected chrome, responsive layout, semantic navigation, and bounded text fitting.');
