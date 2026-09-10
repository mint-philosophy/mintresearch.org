const status = document.getElementById('pretextState');
const sources = [
  'https://esm.sh/@chenglou/pretext@0.0.8',
  'https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm',
];

const entries = new Map();
let pretext = null;
let resizeFrame = null;
let suspended = false;

function setStatus(state, label) {
  status.dataset.state = state;
  status.textContent = label;
  document.documentElement.dataset.pretextStatus = state;
  if (window.__shouldWeBuildAgi) window.__shouldWeBuildAgi.pretext = state;
  window.dispatchEvent(new CustomEvent('agi-pretext-state', { detail: { state } }));
}

async function loadPretext() {
  for (const source of sources) {
    try {
      const module = await import(source);
      if (typeof module.prepareWithSegments === 'function' && typeof module.layoutWithLines === 'function') {
        return module;
      }
    } catch (error) {
      console.warn(`Pretext failed to load from ${source}`, error);
    }
  }
  return null;
}

function fontSpec(style) {
  const italic = style.fontStyle && style.fontStyle !== 'normal' ? `${style.fontStyle} ` : '';
  const variant = style.fontVariant && style.fontVariant !== 'normal' ? `${style.fontVariant} ` : '';
  return `${italic}${variant}${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function lineHeight(style) {
  if (style.lineHeight === 'normal') return parseFloat(style.fontSize) * 1.32;
  return parseFloat(style.lineHeight);
}

function letterSpacing(style) {
  const value = parseFloat(style.letterSpacing);
  return Number.isFinite(value) ? value : 0;
}

function inlineInsets(style) {
  return [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth]
    .reduce((total, value) => total + (parseFloat(value) || 0), 0);
}

function readLayouts() {
  return Array.from(entries.entries()).map(([element, entry]) => {
    const style = getComputedStyle(element);
    const verticalFit = element.dataset.pretextFit === 'vertical';
    const bounds = element.getBoundingClientRect();
    const available = verticalFit
      ? bounds.height - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0)
      : bounds.width - inlineInsets(style);
    return {
      verticalFit,
      maxFontSize: 14,
      style,
      element,
      entry,
      width: Math.max(1, available),
      font: fontSpec(style),
      lineHeight: lineHeight(style),
      letterSpacing: letterSpacing(style),
    };
  });
}

function computeLayouts(reads) {
  return reads.map((read) => {
    if (read.verticalFit) {
      // Measure transformed uppercase glyphs along the physical vertical axis.
      // Fit whole words first, allowing two columns for two-word labels.
      const text = read.style.textTransform === 'uppercase' ? read.entry.source.toUpperCase() : read.entry.source;
      let result;
      let fontSize = read.maxFontSize;
      for (; fontSize > 1; fontSize -= 0.25) {
        const font = read.font.replace(/\d+(?:\.\d+)?px/, fontSize + 'px');
        const prepared = pretext.prepareWithSegments(text, font, { whiteSpace: 'normal', wordBreak: 'normal', letterSpacing: fontSize * 0.06 });
        result = pretext.layoutWithLines(prepared, Math.max(1, read.width - 1), fontSize);
        const wholeWords = result.lines.map(line => line.text.trim()).join(' ') === text;
        if (wholeWords && result.lines.length <= 2 && result.lines.every(line => line.width <= read.width - 1)) break;
      }
      return { ...read, result, fontSize };
    }
    const signature = `${read.font}|${read.letterSpacing}`;
    if (read.entry.signature !== signature) {
      read.entry.prepared = pretext.prepareWithSegments(read.entry.source, read.font, {
        whiteSpace: 'normal',
        wordBreak: 'normal',
        letterSpacing: read.letterSpacing,
      });
      read.entry.signature = signature;
    }

    const result = pretext.layoutWithLines(read.entry.prepared, Math.max(12, read.width - 0.5), read.lineHeight);
    return { ...read, result };
  });
}

function applyLayouts(layouts) {
  for (const { element, result, verticalFit, fontSize } of layouts) {
    if (verticalFit) element.style.setProperty('--spectrum-fit-font', `${fontSize}px`);
    if (!result?.lines?.length) continue;
    element.textContent = result.lines.map((line) => line.text).join('\n');
    element.style.whiteSpace = 'pre-wrap';
    element.style.textWrap = 'wrap';
    element.dataset.pretextLines = String(result.lineCount);
  }

  if (window.__shouldWeBuildAgi) {
    window.__shouldWeBuildAgi.layouts = Object.fromEntries(
      layouts.map(({ element, result }) => [element.dataset.pretextId, {
        lines: result.lineCount,
        height: result.height,
      }]),
    );
  }
}

function relayout() {
  if (!pretext || suspended) return;
  try {
    const reads = readLayouts();
    const layouts = computeLayouts(reads);
    applyLayouts(layouts);
    setStatus('ready', 'Text layout ready');
  } catch (error) {
    console.error('Pretext layout failed', error);
    setStatus('fallback', 'Browser text layout');
  }
}

function scheduleRelayout() {
  if (resizeFrame !== null) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null;
    relayout();
  });
}

async function initialise() {
  setStatus('loading', 'Text layout…');
  await window.__agiEditorReady?.catch(() => undefined);
  pretext = await loadPretext();
  if (!pretext) {
    setStatus('fallback', 'Browser text layout');
    return;
  }

  await document.fonts.ready;
  document.querySelectorAll('[data-pretext]').forEach((element, index) => {
    const source = element.textContent.trim().replace(/[ \t\r\n\f]+/g, ' ');
    const id = `pt-${index + 1}`;
    element.dataset.pretextId = id;
    entries.set(element, { source, signature: null, prepared: null });
  });

  relayout();
  window.addEventListener('resize', scheduleRelayout, { passive: true });
  window.addEventListener('agi-frame-resize', scheduleRelayout);
  window.addEventListener('agi-slide-change', scheduleRelayout);
  document.fonts.addEventListener?.('loadingdone', scheduleRelayout);

  window.__agiPretext = {
    suspend() {
      suspended = true;
      for (const [element, entry] of entries) {
        element.textContent = entry.source;
        element.style.whiteSpace = '';
        element.style.textWrap = '';
        delete element.dataset.pretextLines;
      }
    },
    resume() {
      for (const [element, entry] of entries) {
        entry.source = element.textContent.trim().replace(/[ \t\r\n\f]+/g, ' ');
        entry.signature = null;
        entry.prepared = null;
      }
      suspended = false;
      relayout();
    },
    relayout,
  };
}

initialise().catch((error) => {
  console.error('Pretext initialisation failed', error);
  setStatus('fallback', 'Browser text layout');
});
