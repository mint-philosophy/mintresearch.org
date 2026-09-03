import assert from 'node:assert/strict';
import fs from 'node:fs';

const deck = fs.readFileSync('public/navigating/deck.html', 'utf8');
const wrapper = fs.readFileSync('public/navigating/index.html', 'utf8');
const shellScript = fs.readFileSync('public/assets/presentation-shell.js', 'utf8');

assert.equal((deck.match(/<div class="slide(?: active)?" data-name=/g) || []).length, 11, 'navigating deck must contain eleven ordered slides');
assert.equal((deck.match(/<div class="slide active" data-name=/g) || []).length, 1, 'exactly one slide must be active initially');
assert.ok(deck.includes('<div class="slide active" data-name="Title">'), 'the title slide must remain the initial slide');
assert.ok(deck.includes('<span id="slide-counter">1 / 11</span>'), 'the static counter must reflect eleven slides');

const planSlideIndex = deck.indexOf('<div class="slide" data-name="The Plan">');
assert.ok(planSlideIndex > -1, 'deck must contain the plan slide');
assert.ok(planSlideIndex > deck.indexOf('<div class="slide active" data-name="Title">'), 'the plan slide must follow the title slide');
assert.ok(planSlideIndex < deck.indexOf('<div class="slide" data-name="Background Assumptions">'), 'the plan slide must precede the first topic slide');
assert.ok(deck.includes('<h2 class="fi">The Plan</h2>'), 'the plan slide must use the short neutral heading');
assert.equal((deck.match(/<button type="button" class="plan-item" data-slide="\d+"/g) || []).length, 9, 'the plan slide must list the nine topic slides as buttons');
const PLAN_TOPICS = ['Background Assumptions', 'Definitions of AGI', 'Concrete Waypoints', 'Core Question', 'Steering the Transition', 'Moral Competence', 'Decentralisation', 'Societal Adaptation', 'Applied Philosophy'];
PLAN_TOPICS.forEach((topic, offset) => {
  const slide = offset + 2;
  assert.ok(deck.includes(`class="plan-item" data-slide="${slide}" aria-label="Go to slide ${slide + 1}: ${topic}"`), `plan item ${offset + 1} must target slide ${slide + 1} (${topic})`);
  assert.ok(deck.includes(`<span class="plan-title">${topic}</span>`), `plan item ${offset + 1} must use the exact slide title ${topic}`);
  assert.ok(deck.includes(`<div class="slide" data-name="${topic}">`), `plan topic ${topic} must name an existing slide`);
});
assert.ok(deck.includes("document.querySelectorAll('.plan-item').forEach"), 'plan items must receive slide navigation behavior');
assert.ok(deck.includes('.plan-grid { display: grid; grid-template-columns: 1fr 1fr;'), 'the plan must use a compact two-column grid');
assert.ok(deck.includes('Navigating the AGI Reckoning'), 'deck must use the edited title');
assert.ok(deck.includes('A different kind of applied philosophy.'), 'deck must include the edited closing claim');
assert.ok(deck.includes('Into this comes <span class="highlight"><strong>math that wakes sand up.</strong></span>'), 'slide three must keep the highlighted phrase inline with its sentence');
assert.ok(!deck.includes('<p class="fi d3"><span class="highlight"><strong>math that wakes sand up.</strong></span></p>'), 'slide three must not force the highlighted phrase into a standalone paragraph');
assert.ok(deck.includes('<h3>Mechanistic/Cognitive</h3>'), 'slide four must use the edited mechanistic/cognitive heading');
assert.ok(deck.includes('<h3>Capabilities</h3>'), 'slide four must use the edited capabilities heading');
assert.ok(deck.includes('<h3>Outcomes</h3>'), 'slide four must use the edited outcomes heading');
assert.ok(deck.includes('overall impact on society, e.g. Transformative AI'), 'slide four must include the edited outcomes example');
assert.ok(!deck.includes('<h3>Internalist AGI</h3>'), 'slide four must not retain the superseded internalist heading');
assert.ok(!deck.includes('<h3>Behavioural AGI</h3>'), 'slide four must not retain the superseded behavioural heading');
assert.ok(!deck.includes('<h3>Transformative AI</h3>'), 'slide four must not retain the superseded transformative heading');
assert.equal((deck.match(/<div class="cap-card fi d\d">/g) || []).length, 4, 'slide eight must contain four editable-source capacity panels');
assert.ok(deck.includes('<div class="cap-label">What should we align to?!</div>'), 'slide eight must include the new alignment-question panel heading');
assert.ok(deck.includes('A whole new field of normative ethics beckons.'), 'slide eight must include the saved PowerPoint panel text');
assert.ok(!deck.includes('LOREM IPSUM'), 'slide eight must not retain the placeholder panel heading');
assert.ok(!deck.includes('Lorem ipsum dolor sit amet'), 'slide eight must not retain placeholder panel text');
assert.ok(deck.includes('First big question: ought we build it at all? Obvious but under-examined; less so now the backlash has begun'), 'slide nine must include the saved PowerPoint build-it question');
assert.ok(deck.includes('How can we advance safely towards AGI without excessively concentrating power?'), 'slide nine must include the saved PowerPoint decentralisation question');
assert.ok(!deck.includes('Supporting delegated agent access is crucial for this, so is supporting access to open weights models'), 'slide nine must not retain the superseded delegated-access text');
assert.ok(!deck.includes('Regulatory proposals must be weighed in part for how much they contribute to concentration of power'), 'slide nine must not retain the superseded regulatory-proposals text');
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
assert.ok(deck.includes("background-image: url('/favicon-32x32.png');"), 'slide location buttons must use the canonical Minty favicon squid');
assert.ok(deck.includes('filter: grayscale(1) saturate(0);'), 'inactive Minty slide markers must be desaturated');
assert.ok(deck.includes('.nav-dot.active { filter: none; opacity: 1; transform: scale(1.08); }'), 'the current-slide Minty marker must be fully saturated');
assert.ok(deck.includes('.nav-dot:focus-visible'), 'Minty slide markers must retain a visible keyboard focus treatment');
assert.ok(deck.includes('grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);'), 'equal footer outer columns must pin the Minty markers to the deck centre');
assert.ok(deck.includes('<div class="nav-tail">'), 'the changing section title and controls must occupy a footer region separate from the Minty markers');
assert.ok(deck.includes('text-overflow: ellipsis;'), 'long footer titles must shrink without displacing the Minty markers');
assert.ok(deck.includes('animation: scroll-ticker 55s linear infinite;'), 'the authored chyron must retain its continuous scrolling animation');
assert.ok(!deck.includes('.ticker-track { animation: none; }'), 'the navigating conversion must not suppress the authored chyron');
assert.equal((deck.match(/class="ticker-link"/g) || []).length, 18, 'both visual chyron cycles must expose all nine slide-topic buttons');
for (let slide = 2; slide <= 10; slide += 1) {
  assert.equal((deck.match(new RegExp(`class="ticker-link" data-slide="${slide}"`, 'g')) || []).length, 2, `slide ${slide + 1} must be linked from both chyron cycles`);
}
assert.equal((deck.match(/class="ticker-link" data-slide="1"/g) || []).length, 0, 'the plan slide must not be added to the nine-topic chyron');
assert.equal((deck.match(/class="ticker-link" data-slide="0"/g) || []).length, 0, 'the title slide must not be added to the nine-topic chyron');
assert.ok(deck.includes('role="navigation" aria-label="Slide topics"'), 'the interactive chyron must be exposed as slide navigation');
assert.ok(deck.includes('.ticker:hover .ticker-track, .ticker:focus-within .ticker-track { animation-play-state: paused; }'), 'the chyron must pause while a person is targeting a topic');
assert.ok(deck.includes("document.querySelectorAll('.ticker-link').forEach"), 'every chyron topic must receive slide navigation behavior');
assert.ok(deck.includes('if(event.detail>0)button.blur();'), 'pointer activation must release focus so the chyron resumes after hover');
assert.ok(deck.includes("if(e.target.closest('button, a, input, textarea, select'))return;"), 'deck-level keyboard shortcuts must not override interactive controls');
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
assert.ok(wrapper.includes('src="deck.html?v=20260903.1"'), 'wrapper must bypass stale deck caches');
assert.ok(shellScript.includes('frame.contentWindow.refitFdcSlides?.()'), 'shared shell must call the compatibility refit hook');

console.log('Navigating frame-fit contract passed: corrected chrome, responsive layout, semantic navigation, and bounded text fitting.');
