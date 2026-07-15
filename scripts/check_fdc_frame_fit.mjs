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
assert.equal(fit.scaleForViewport(framed1440.width, framed1440.height, 0.71), 0.71);
assert.equal(fit.scaleForViewport(framed1440.width, framed1440.height, 0.86), 0.86);
assert.equal(fit.compensatedFontSize(16, 0.71, 14), 14 / 0.71);
assert.equal(fit.compensatedFontSize(21, 0.71, 14), 21);

const labelRuntimeSource = deck.match(
  /function resetLabelReadability\(slide\) \{[\s\S]*?(?=\nfunction applySlideScale)/
)?.[0];
assert.ok(labelRuntimeSource, 'label readability runtime must be extractable for cycle checks');
const labelRuntimeContext = {
  window: { MintFdcFitMath: fit },
  getComputedStyle: (element) => ({ fontSize: element.style.fontSize || '16px' })
};
vm.runInNewContext(`
  const LABEL_FLOOR_SELECTOR = '.label';
  const labelFontRecords = new Map();
  const visibleText = () => 'label';
  ${labelRuntimeSource}
  this.applyLabelReadability = applyLabelReadability;
  this.resetLabelReadability = resetLabelReadability;
`, labelRuntimeContext);
const labelStyle = {
  fontSize: '',
  removeProperty(property) {
    if (property === 'font-size') this.fontSize = '';
  }
};
const labelElement = { style: labelStyle };
const labelSlide = { querySelectorAll: () => [labelElement] };
labelRuntimeContext.applyLabelReadability(labelSlide, 0.71);
assert.equal(parseFloat(labelStyle.fontSize), 14 / 0.71);
labelRuntimeContext.applyLabelReadability(labelSlide, 0.45);
assert.equal(parseFloat(labelStyle.fontSize), 14 / 0.45, 'repeated scaling must use the source size, not compound');
labelRuntimeContext.resetLabelReadability(labelSlide);
assert.equal(labelStyle.fontSize, '', 'mobile/reset path must restore the original font size');
labelRuntimeContext.applyLabelReadability(labelSlide, 0.81);
assert.equal(parseFloat(labelStyle.fontSize), 14 / 0.81, 'desktop re-entry must recompute from the source size');
labelRuntimeContext.resetLabelReadability(labelSlide);
assert.equal(labelStyle.fontSize, '');

assert.ok(deck.includes('<script src="/assets/fdc-fit-math.js?v=20260715.2"></script>'), 'deck must load versioned frame-fit math');
assert.ok(deck.includes('scaleForViewport(slide.clientWidth, slide.clientHeight, floor)'), 'fitter must use the actual iframe slide plane');
assert.ok(deck.includes('while (fits && scale < frameScale)'), 'overflow recovery must not grow beyond the frame cap');
assert.ok(deck.includes("content.style.height = `${100 / scale}%`;"), 'scaled slide backgrounds must continue filling the visible stage');
assert.ok(deck.includes("new ResizeObserver(scheduleFit).observe(document.querySelector('.slides'))"), 'fitter must observe iframe slide-plane changes');
assert.ok(deck.includes("if (!matchMedia('(min-width: 901px)').matches)"), 'mobile must retain its native scrolling path');
const floorFunction = deck.match(/function minimumReadableScale\(slide\) \{([\s\S]*?)\n\}/)?.[1] || '';
assert.ok(floorFunction.includes('BODY_FLOOR_SELECTOR'), 'slide floor must protect substantive text');
assert.ok(!floorFunction.includes('LABEL_FLOOR_SELECTOR'), 'small labels must not hold the whole slide above its frame scale');
assert.ok(deck.includes('applyLabelReadability(slide, scale)'), 'labels must retain their own rendered floor');
assert.ok(wrapper.includes('src="/FDC-deck.html?v=20260715.2"'), 'wrapper must bypass stale iframe caches');
assert.ok(shellScript.includes("style.setProperty('--presentation-status-h', statusline.getBoundingClientRect().height + 'px')"), 'shell must reserve the measured status-bar height');
assert.ok(shellScript.includes('chromeObserver.observe(statusline)'), 'shell must observe status-bar size changes');
assert.ok(shellCss.includes('--presentation-status-h: 49px'), 'mobile fallback must match the two-row status bar');

console.log('FDC frame-fit check passed: frame scaling, repeatable label reset cycles, cache version, and mobile chrome reservation.');
