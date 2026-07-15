import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const mathSource = fs.readFileSync('public/assets/fdc-fit-math.js', 'utf8');
const deck = fs.readFileSync('public/FDC-deck.html', 'utf8');
const wrapper = fs.readFileSync('public/FDC.html', 'utf8');
const shellScript = fs.readFileSync('public/assets/presentation-shell.js', 'utf8');
const shellCss = fs.readFileSync('public/assets/presentation-shell.css', 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(mathSource, context);

const fit = context.MintFdcFitMath;
assert.ok(fit, 'frame-fit math must initialize');
assert.equal(fit.referenceViewport.width, 2560);
assert.equal(fit.referenceViewport.height, 1080);
assert.equal(fit.referenceViewport.slideHeight, 976);

function framedSlidePlane({
  width,
  height,
  banner,
  sidebar,
  status,
  paddingX,
  paddingY,
  toolbar,
  border,
  ticker = fit.referenceViewport.tickerHeight,
  navigation = fit.referenceViewport.navigationHeight
}) {
  return {
    width: width - sidebar - paddingX - border,
    height: height - banner - status - paddingY - toolbar - border
      - ticker - navigation
  };
}

const full = { width: 2560, height: 976 };
const presentation1440 = { width: 1440, height: 796 };
const framed2560 = framedSlidePlane({
  width: 2560,
  height: 1080,
  banner: 100,
  sidebar: 240,
  status: 28,
  paddingX: 24,
  paddingY: 20,
  toolbar: 32,
  border: 2
});
const framed1440 = framedSlidePlane({
  width: 1440,
  height: 900,
  banner: 100,
  sidebar: 240,
  status: 28,
  paddingX: 24,
  paddingY: 20,
  toolbar: 32,
  border: 2
});
const framed390 = framedSlidePlane({
  width: 390,
  height: 844,
  banner: 107,
  sidebar: 0,
  status: 49,
  paddingX: 16,
  paddingY: 14,
  toolbar: 32,
  border: 2,
  ticker: 32,
  navigation: 54
});

assert.deepEqual(full, { width: 2560, height: 976 });
assert.deepEqual(framed2560, { width: 2294, height: 794 });
assert.deepEqual(framed1440, { width: 1174, height: 614 });
assert.deepEqual(framed390, { width: 372, height: 554 });
assert.equal(fit.scaleForViewport(full.width, full.height, 0.71), 1);
assert.equal(fit.scaleForViewport(presentation1440.width, presentation1440.height, 0), 0.56);
assert.equal(fit.scaleForViewport(framed2560.width, framed2560.height, 0), 0.81);
assert.equal(fit.scaleForViewport(framed2560.width, framed2560.height, 0.71), 0.81);
assert.equal(fit.scaleForViewport(framed2560.width, framed2560.height, 0.86), 0.86);
assert.equal(fit.scaleForViewport(framed1440.width, framed1440.height, 0), 0.45);
assert.equal(fit.scaleForViewport(framed1440.width, framed1440.height, 0.05), 0.45);
assert.equal(fit.scaleForViewport(framed390.width, framed390.height, 0.05), 0.14);

assert.ok(!deck.includes('@chenglou/pretext'), 'runtime fitting must not load the Safari-blocking Pretext layout path');
assert.ok(deck.includes('return slide.clientWidth && slide.clientHeight ? 1 : MIN_FIT_SCALE;'), 'each visible slide must start at authored type size and shrink only for measured containment');
assert.ok(deck.includes('function fitSlideWithinFrame'), 'every slide must use bounded frame fitting');
assert.ok(deck.includes('FIT_SEARCH_ITERATIONS = 10'), 'frame fitting must use a bounded search');
assert.ok(deck.includes('const index = cur;\n  const slide = slides[index];'), 'each pass must retain the identity of its visible slide');
assert.ok(deck.includes('.slide.fit-measuring { transform: none; transition: none; overflow: hidden; }'), 'candidate geometry must not create scrollbars that retrigger iframe resize');
assert.ok(deck.includes('if (fitRunning) {\n    fitPending = true;'), 'resize and navigation events must not interrupt an active fit pass');
assert.ok(deck.includes('const needsStableRefit = fitPending && ('), 'coalesced events must refit only after a real viewport or slide change');
assert.ok(deck.includes("secName.textContent=slides[n].dataset.name||'';scheduleFit();"), 'navigation must fit the newly visible slide');
assert.ok(deck.includes('.fi { opacity: 1; transform: none; transition: none; }'), 'Safari slide navigation must not leave text transparent');
assert.ok(deck.includes('.slide.active { opacity: 1; visibility: visible;'), 'Safari must not composite transformed inactive slides over the current slide');
assert.ok(deck.includes("content.style.transform = `scale(${scale})`;"), 'Safari fitting must use rendered transform geometry');
assert.ok(!deck.includes('content.style.zoom'), 'Safari fitting must not depend on inconsistent CSS zoom geometry');
assert.ok(deck.includes("content.style.transform = 'none';"), 'candidate measurement must use untransformed text geometry');
assert.ok(deck.includes("content.style.flex = '0 0 auto';"), 'inverse-size compensation must not be collapsed by flex shrink');
assert.ok(deck.includes('origin.top + (content.bottom - origin.top) * scale'), 'candidate bounds must be projected into the visible frame');
assert.ok(!deck.includes('requestAnimationFrame(resolve)'), 'Safari fitting must not stall on animation frames during oversized candidate layout');
assert.ok(deck.includes("content.style.height = `${100 / scale}%`;"), 'scaled slide backgrounds must continue filling the visible stage');
assert.ok(deck.includes("window.addEventListener('resize', scheduleFit)"), 'fitter must react to actual iframe viewport changes');
assert.ok(!deck.includes('new ResizeObserver(scheduleFit)'), 'fitter must not observe layout writes that cancel its own search');
assert.ok(!deck.includes("if (!matchMedia('(min-width: 901px)').matches)"), 'narrow framed decks must not bypass fitting');
assert.ok(deck.includes('document.createTreeWalker(slide, NodeFilter.SHOW_TEXT)'), 'containment must measure rendered text nodes');
assert.ok(deck.includes('projected.top >= frame.top'), 'containment must keep edge-aligned structural labels inside the top edge');
assert.ok(deck.includes('projected.right <= frame.right - FRAME_INSET'), 'containment must include a safe right inset');
assert.ok(deck.includes('projected.bottom <= frame.bottom - FRAME_INSET'), 'containment must include a safe bottom inset');
assert.ok(deck.includes('projected.left >= frame.left'), 'containment must keep edge-aligned structural labels inside the left edge');
assert.ok(deck.includes('belowPreferredFloor: scale < preferredFloor'), 'readability must be diagnostic rather than a hard overflow floor');
assert.ok(wrapper.includes('src="/FDC-deck.html?v=20260715.22"'), 'wrapper must bypass stale iframe caches');
assert.ok(shellScript.includes("style.setProperty('--presentation-status-h', statusline.getBoundingClientRect().height + 'px')"), 'shell must reserve the measured status-bar height');
assert.ok(shellScript.includes('chromeObserver.observe(statusline)'), 'shell must observe status-bar size changes');
assert.ok(shellCss.includes('--presentation-status-h: 49px'), 'mobile fallback must match the two-row status bar');

console.log('FDC frame-fit check passed: bounded all-viewport scaling, four-edge containment, cache version, and mobile chrome reservation.');
