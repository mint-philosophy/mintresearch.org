// Web player for "Navigating the AGI Reckoning", exported from the PowerPoint by build/web_export.py.
// Every beat is a slide, exactly as in PowerPoint. Geometry is in points on a 960 x 540 page and
// scaled to the window; all text is laid out by Cheng Lou's Pretext at the rendered pixel size and
// re-laid on every resize. Mixed-font paragraphs (a mono number beside a condensed label) use the
// same canvas measurement, word by word.

import { assignKeys, layoutSection, coverCrop } from './phone.js?v=6b9c2f2fe2';

const PRETEXT = ['https://esm.sh/@chenglou/pretext@0.0.8', 'https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm'];
const FAMILY = {
  'Big Caslon': { css: '"Big Caslon", "Libre Caslon Text", Georgia, serif', w: 400, bw: 700 },
  'Avenir Next Condensed Heavy': { css: '"Avenir Next Condensed", "Barlow Condensed", "Arial Narrow", sans-serif', w: 800, bw: 800 },
  'Menlo': { css: 'Menlo, "JetBrains Mono", monospace', w: 400, bw: 700 },
  'Georgia': { css: 'Georgia, "Libre Caslon Text", serif', w: 400, bw: 700 },
};
// ?fonts=web previews the open substitutes a visitor without the Apple faces will see
if (new URLSearchParams(location.search).get('fonts') === 'web') {
  FAMILY['Big Caslon'].css = '"Libre Caslon Text", Georgia, serif';
  FAMILY['Avenir Next Condensed Heavy'].css = '"Barlow Condensed", "Arial Narrow", sans-serif';
  FAMILY['Menlo'].css = '"JetBrains Mono", monospace';
}
const SCAN = {  // background colour and scanline texture, as the PowerPoint's tiled 144 dpi images
  rust: ['#A8432A', '#9D3E27', 1.5, 0.5],
  ink: ['#161300', '#221E0A', 2, 1],
  paper: ['#FFFAED', '#F5EEDA', 2, 1],
};
const DASH = { dash: [4, 3], sysDash: [3, 1], sysDot: [1, 1], lgDash: [8, 3], dashDot: [4, 3, 1, 3] };

const stage = document.getElementById('stage');
const live = document.getElementById('live');
let deck, pretext = null, k = 1, index = 0, current = null, timers = [], slideStart = 0;
const prepared = new Map();
const ctx = document.createElement('canvas').getContext('2d');

const fam = (f) => FAMILY[f] || FAMILY['Big Caslon'];
const fontSpec = (r, kk = k) => `${r.i ? 'italic ' : ''}${r.b ? fam(r.f).bw : fam(r.f).w} ${(r.s * kk).toFixed(3)}px ${fam(r.f).css}`;
// Line breaks are computed at one fixed reference resolution and drawn at the window's size, so
// they never drift with the window (tiny, hinted text measures slightly differently).
const K_REF = 2;

async function loadPretext() {
  for (const url of PRETEXT) {
    try {
      const m = await import(url);
      if (typeof m.prepareWithSegments === 'function' && typeof m.layoutWithLines === 'function') return m;
    } catch (e) { console.warn('Pretext failed to load from', url, e); }
  }
  return null;
}

// ---- measurement -------------------------------------------------------------------------------
// PowerPoint measures the condensed face a touch narrower than the browser does, so it fits a
// headline up to ~1% over its box; body faces break exactly at the box. Proportional, so the
// breaks are the same at every window size. (Calibrated against PowerPoint's PDF, 29 Sep 2026.)
const SLACK = { 'Avenir Next Condensed Heavy': 1.008 };
const installed = {};   // is the Apple face itself present? (the slack is calibrated for it alone)
const FACE = { 'Big Caslon': 'Big Caslon', 'Avenir Next Condensed Heavy': 'Avenir Next Condensed', 'Menlo': 'Menlo', 'Georgia': 'Georgia' };
function hasFace(name, key = 'Avenir Next Condensed Heavy') {
  if (!(name in installed)) {
    const probe = (fam) => { ctx.font = `800 40px ${fam}`; return ctx.measureText('ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklm').width; };
    installed[name] = [['monospace'], ['serif']].some(([f]) => Math.abs(probe(`"${name}", ${f}`) - probe(f)) > 0.5)
      && FAMILY[key].css.includes(`"${name}"`) || FAMILY[key].css.startsWith(name + ',');
  }
  return installed[name];
}
const ownFace = (f) => hasFace(FACE[f] || f, FAMILY[f] ? f : 'Big Caslon');
const slack = (run) => (SLACK[run.f] && hasFace('Avenir Next Condensed') ? SLACK[run.f] : 1.0);
function measure(text, run) {
  ctx.font = fontSpec(run, K_REF);
  const ls = run.sp * K_REF;
  if ('letterSpacing' in ctx) { ctx.letterSpacing = `${ls}px`; return ctx.measureText(text).width; }
  return ctx.measureText(text).width + ls * [...text].length;
}

function pretextLines(text, run, width, lh) {
  const font = fontSpec(run, K_REF), spacing = run.sp * K_REF, key = `${font}|${spacing}|${text}`;
  let p = prepared.get(key);
  if (!p) {
    p = pretext.prepareWithSegments(text, font, { whiteSpace: 'normal', wordBreak: 'normal', letterSpacing: spacing });
    prepared.set(key, p);
  }
  return pretext.layoutWithLines(p, Math.max(1, width * slack(run)), lh).lines.map((l) => l.text);
}

function greedyLines(tokens, width) {   // tokens: [{text, run}] split at spaces, spaces kept on the word before
  const lines = [];
  let cur = [], w = 0;
  for (const tok of tokens) {
    const tw = measure(tok.text, tok.run), trimmed = measure(tok.text.replace(/\s+$/, ''), tok.run);
    if (cur.length && w + trimmed > width * slack(tok.run)) { lines.push(cur); cur = []; w = 0; }
    cur.push(tok); w += tw;
  }
  if (cur.length) lines.push(cur);
  return lines;
}

// Lay one paragraph segment out as lines of spans.
function layoutSegment(runs, width, lh, wrap) {
  const text = runs.map((r) => r.t).join('');
  if (!text.length) return [[]];
  const uniform = runs.every((r) => r.f === runs[0].f && r.s === runs[0].s && r.b === runs[0].b && r.i === runs[0].i && r.sp === runs[0].sp);
  let lineTexts;
  if (!wrap) lineTexts = [text];
  else if (uniform && pretext) lineTexts = pretextLines(text, runs[0], width, lh);
  if (lineTexts) {   // map each line back to its runs by counting non-space characters, since
    const out = [];   // Pretext collapses runs of spaces that PowerPoint keeps (e.g. "01  MEANING")
    let pos = 0;
    for (const lt of lineTexts) {
      let need = lt.replace(/\s+/g, '').length;
      while (pos < text.length && /\s/.test(text[pos])) pos++;
      const start = pos;
      while (pos < text.length && need > 0) { if (!/\s/.test(text[pos])) need--; pos++; }
      out.push(slice(runs, start, pos));
    }
    return out;
  }
  const tokens = [];
  for (const r of runs) for (const m of r.t.matchAll(/\S+\s*|\s+/g)) tokens.push({ text: m[0], run: r });
  return greedyLines(tokens, width).map((line) => {
    const spans = line.map((tok) => ({ text: tok.text, run: tok.run }));
    spans[spans.length - 1].text = spans[spans.length - 1].text.replace(/\s+$/, '');
    return spans;
  });
}

function slice(runs, a, b) {
  const spans = [];
  let pos = 0;
  for (const r of runs) {
    const s = Math.max(a, pos), e = Math.min(b, pos + r.t.length);
    if (e > s) spans.push({ text: r.t.slice(s - pos, e - pos), run: r });
    pos += r.t.length;
  }
  return spans;
}

// Where the browser actually puts the baseline inside a line box of a given font and line-height.
const probeCache = new Map();
let probe = null;
function baselineIn(font, lh) {
  const key = `${font}|${lh.toFixed(2)}`;
  if (probeCache.has(key)) return probeCache.get(key);
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden';
    probe.innerHTML = '<span>Hg</span><i style="display:inline-block;width:0;height:0;vertical-align:baseline"></i>';
    document.body.append(probe);
  }
  probe.style.font = font; probe.style.lineHeight = `${lh}px`; probe.style.height = `${lh}px`;
  const v = probe.lastElementChild.getBoundingClientRect().top - probe.getBoundingClientRect().top;
  probeCache.set(key, v);
  return v;
}

// ---- rendering ---------------------------------------------------------------------------------
const px = (v) => `${(v * k).toFixed(3)}px`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function place(el, it) {
  el.style.left = px(it.x); el.style.top = px(it.y); el.style.width = px(it.w); el.style.height = px(it.h);
  const t = [];
  if (it.rot) t.push(`rotate(${it.rot}deg)`);
  if (it.flipH) t.push('scaleX(-1)');
  if (it.flipV) t.push('scaleY(-1)');
  if (t.length) el.style.transform = t.join(' ');
}

function stroke(el, line) {
  if (!line) return;
  el.style.border = `${Math.max(0.5, line.w * k).toFixed(2)}px ${line.dash ? 'dashed' : 'solid'} ${line.c}`;
}

// A text box laid out in points: PowerPoint's line pitch, first-baseline offset and last-line descent.
function textLayout(it) {
  const [il, itp, ir, ib] = it.ins;
  const wpt = it.w - il - ir;
  const blocks = [];
  it.paras.forEach((p, pi) => {
    const sized = p.runs.filter((r) => r.s);
    const size = sized.length ? Math.max(...sized.map((r) => r.s)) : p.size;
    const font = sized.length ? sized.reduce((a, r) => (r.s >= a.s ? r : a)).f : p.font;
    const lh = size * (deck.line[font] || 1.2) * p.ls;
    const asc = size * (deck.ascent[font] || 0.9) * p.ls;
    const desc = deck.descentFixed?.[font] ? size * deck.descentFixed[font] : size * (deck.descent?.[font] || 0.25) * p.ls;
    const segs = [[]];
    for (const r of p.runs) (r.t === '\n' ? segs.push([]) : segs[segs.length - 1].push(r));
    for (const seg of segs) for (const spans of layoutSegment(seg, wpt * K_REF, lh * K_REF, it.wrap)) {
      blocks.push({ spans, lh, asc, desc, align: p.align, run: sized.find((r) => r.s === size) || sized[0] });
    }
    if (pi < it.paras.length - 1) blocks.push({ gap: p.sa });
  });
  // PowerPoint's block runs from the top of the text area to the last line's descent
  let yy = 0, lastBase = 0, lastDesc = 0;
  for (const b of blocks) { if (b.gap !== undefined) { yy += b.gap; continue; } lastBase = yy + b.asc; lastDesc = b.desc; yy += b.lh; }
  return { blocks, blockH: lastBase + lastDesc, ins: it.ins };
}

// services for the phone layout (points)
const T = {
  height: (it) => { const L = textLayout(it); return L.ins[1] + L.blockH + L.ins[3]; },
  widest(it) {   // the longest unbreakable run of text: a word, or a whole line when the box doesn't wrap
    let m = 0;
    for (const p of it.paras) {
      let line = 0;
      for (const r of p.runs) {
        if (!r.t) continue;
        if (r.t === '\n') { m = Math.max(m, line); line = 0; continue; }
        if (!it.wrap) { line += measure(r.t, r) / K_REF; continue; }
        for (const w of r.t.split(/\s+/)) if (w) m = Math.max(m, measure(w, r) / K_REF);
      }
      m = Math.max(m, line);
    }
    return m;
  },
  scaleText(it, fs) {
    if (fs === 1) return it;
    return { ...it, ins: it.ins.map((v) => v * fs),
      paras: it.paras.map((p) => ({ ...p, size: p.size * fs, sa: p.sa * fs, runs: p.runs.map((r) => (r.s ? { ...r, s: r.s * fs, sp: (r.sp || 0) * fs } : r)) })) };
  },
};

// Without the deck's own faces (Windows) the stand-ins set wider, so lines break early. Keep each box
// to the line count it has with the real faces (recorded at export as nl): shrink its type just enough.
function fitted(it) {
  if (phone || !it.nl) return it;
  if (it.paras.every((p) => p.runs.every((r) => !r.f || ownFace(r.f)))) return it;
  const room = (it.w - it.ins[0] - it.ins[2]) * 1.01;
  const ok = (x) => {   // no more lines than with the real faces, and no line wider than the box
    const bl = textLayout(x).blocks.filter((b) => b.gap === undefined);
    return bl.length <= it.nl && (!it.wrap || bl.every((b) => b.spans.reduce((a, sp) => a + measure(sp.text, sp.run), 0) / K_REF <= room));
  };
  if (ok(it)) return it;
  const at = (f) => ({ ...it, paras: it.paras.map((p) => ({ ...p, size: p.size * f, sa: p.sa * f,
    runs: p.runs.map((r) => (r.s ? { ...r, s: r.s * f, sp: (r.sp || 0) * f } : r)) })) });
  for (let f = 0.98; f >= 0.7; f -= 0.02) { const x = at(f); if (ok(x)) return x; }
  return at(0.7);
}

function renderText(it) {
  it = fitted(it);
  const el = document.createElement('div');
  place(el, it);
  if (it.fill) el.style.background = it.fill;
  stroke(el, it.line);
  const { blocks, blockH } = textLayout(it);
  const [il, itp, ir, ib] = it.ins;
  const width = (it.w - il - ir) * k;
  const innerH = it.h - itp - ib;
  let y = (itp + (it.anchor === 'ctr' ? (innerH - blockH) / 2 : it.anchor === 'b' ? innerH - blockH : 0)) * k;
  for (const b of blocks) {
    if (b.gap !== undefined) { y += b.gap * k; continue; }
    const lh = b.lh * k;
    const line = document.createElement('div');
    line.className = 'tl';
    // put the CSS baseline exactly where PowerPoint puts it (measured, not predicted)
    const cssBase = b.run ? baselineIn(fontSpec(b.run), lh) : lh * 0.8;
    const top = y + b.asc * k - cssBase;
    line.style.left = `${(il * k).toFixed(3)}px`; line.style.top = `${top.toFixed(3)}px`;
    line.style.width = `${width.toFixed(3)}px`; line.style.height = `${lh.toFixed(3)}px`;
    if (b.run) line.style.font = fontSpec(b.run);   // the line's own strut must match its text
    line.style.lineHeight = `${lh.toFixed(3)}px`;
    line.style.textAlign = b.align === 'ctr' ? 'center' : b.align === 'r' ? 'right' : 'left';
    for (const sp of b.spans) {
      const sEl = document.createElement('span');
      sEl.textContent = sp.text;
      sEl.style.font = fontSpec(sp.run);
      sEl.style.lineHeight = 'inherit';   // the font shorthand resets line-height to "normal"
      sEl.style.color = sp.run.c || '#000000';
      if (sp.run.sp) sEl.style.letterSpacing = `${(sp.run.sp * k).toFixed(3)}px`;
      if (sp.run.st) sEl.style.textDecoration = 'line-through';
      line.append(sEl);
    }
    el.append(line);
    y += lh;
  }
  return el;
}

function renderImage(it) {
  const el = document.createElement('div');
  el.className = 'img';
  place(el, it);
  const [l, t, r, b] = it.crop;
  const img = document.createElement('img');
  img.src = it.src; img.alt = ''; img.decoding = 'async';
  const fw = it.w / (1 - l - r), fh = it.h / (1 - t - b);
  img.style.width = px(fw); img.style.height = px(fh); img.style.left = px(-l * fw); img.style.top = px(-t * fh);
  el.append(img);
  if (it.line) { const f = document.createElement('div'); f.style.cssText = 'position:absolute;inset:0'; stroke(f, it.line); el.append(f); }
  return el;
}

function renderLines(items) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'lines');
  svg.setAttribute('viewBox', `0 0 ${page.w} ${page.h}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const defs = document.createElementNS(NS, 'defs');
  svg.append(defs);
  items.forEach((it, n) => {
    const l = document.createElementNS(NS, 'line');
    for (const [a, v] of Object.entries({ x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2 })) l.setAttribute(a, v);
    l.setAttribute('stroke', it.c); l.setAttribute('stroke-width', it.w);
    if (it.dash && DASH[it.dash]) l.setAttribute('stroke-dasharray', DASH[it.dash].map((d) => d * it.w).join(' '));
    for (const [end, attr] of [['head', 'marker-start'], ['tail', 'marker-end']]) {
      if (!it[end] || it[end] === 'none') continue;
      const m = document.createElementNS(NS, 'marker'), id = `ah${n}${end}`;
      m.setAttribute('id', id); m.setAttribute('viewBox', '0 0 10 10'); m.setAttribute('refX', '5'); m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '3'); m.setAttribute('markerHeight', '3'); m.setAttribute('orient', 'auto-start-reverse');
      const path = document.createElementNS(NS, 'path'); path.setAttribute('d', 'M0,0 L10,5 L0,10 z'); path.setAttribute('fill', it.c);
      m.append(path); defs.append(m); l.setAttribute(attr, `url(#${id})`);
    }
    svg.append(l);
  });
  return svg;
}

// ---- the phone layout: portrait windows get each section rearranged (phone.js) -----------------------
let phone = null;             // null in landscape; else the window { vw, vh }
let page = { w: 0, h: 0 };    // the page being drawn, in points
let kSlides = 1;              // landscape scale
const pages = new Map();
// A portrait page is a column about 480 points wide and as tall as the window. A section that
// doesn't fit gets a wider page (so everything is drawn a little smaller) until it does.
function sectionPage(sec) {
  if (!pages.has(sec)) {
    const { vw, vh } = phone;
    const W0 = clamp(vw / 1.1, 480, 760);
    // Ways to make a tall section fit, in order of preference: on a tablet, let pictures grow less;
    // tighten the spacing; shrink the pictures (to 60%); only then draw everything smaller.
    const tries = [];
    for (let up = W0 / 480; up > 1; up -= 0.1) tries.push([W0, { up }]);
    tries.push([W0, {}], [W0, { tight: true }]);
    for (const pic of [0.9, 0.8, 0.7, 0.6]) tries.push([W0, { tight: true, pic }]);
    for (const pic of [1, 0.8, 0.6]) tries.push([W0, { tight: true, pic, compact: true }]);   // the section's compact layout, if it has one
    // text never drops below about 0.68 px per point; a section that still doesn't fit runs a little
    // taller than the window and scrolls instead
    const Wmax = Math.max(W0, vw / 0.68);
    for (let W = W0 * 1.06; W <= Wmax; W *= 1.06) tries.push([W, { tight: true, pic: 0.6, compact: true }]);
    let W, L, fit, H;
    for ([W, fit] of tries) {
      H = (W * vh) / vw;
      L = layoutSection(deck, sec, W, H, T, fit);
      if (L.over <= 0) break;
    }
    const scroll = L.over > 0;
    if (scroll) { H += L.over + 12; L = layoutSection(deck, sec, W, H, T, fit); }
    pages.set(sec, { W, H, k: vw / W, L, fit, scroll });
  }
  return pages.get(sec);
}

function phoneItem(it, pl) {
  if (!pl || pl.hide) return null;
  let o, fs = 1;
  if (pl.aff) {
    const { s, ox, oy, dx, dy } = pl.aff;
    fs = s;
    if (it.t === 'line') o = { ...it, x1: dx + (it.x1 - ox) * s, y1: dy + (it.y1 - oy) * s, x2: dx + (it.x2 - ox) * s, y2: dy + (it.y2 - oy) * s, w: it.w * s };
    else o = { ...it, x: dx + (it.x - ox) * s, y: dy + (it.y - oy) * s, w: it.w * s, h: it.h * s };
    if (it.line && it.t !== 'line') o.line = { ...it.line, w: it.line.w * s };
  } else if (pl.abs) {
    fs = pl.fs ?? 1;
    const a = pl.abs;
    o = it.t === 'line' ? { ...it, x1: a.x, y1: a.y, x2: a.x + a.w, y2: a.y + a.h } : { ...it, ...a };
    if (pl.crop) o.crop = pl.crop;
    if (pl.paras) o.paras = pl.paras;
  } else return it;
  return o.t === 'text' ? T.scaleText(o, fs) : o;
}

// ---- landscape: the PowerPoint slide on a page the shape of the window ---------------------------
// At 16:9 this is the PowerPoint exactly. Otherwise the page is wider or taller than the slide:
// shapes that bleed off an edge (backgrounds, panels, pictures, bars) reach the window's edge,
// pictures cropping to fill; the rail, slide number and title stay under the top edge; everything
// else is centred in the extra space, keeping its size and line breaks; toads spread out.
const HEAD = /^(rail|slide number|title|byline|venue|thanks)$/;
const E = 2;   // points: how close to an edge counts as bleeding
// where a shape goes on a page of another shape (box only; containment is applied by fillItem)
function fillBox(it) {
  const FW = page.w, FH = page.h, dX = (FW - deck.w) / 2, dY = (FH - deck.h) / 2, sy = FH / deck.h;
  const name = (it.n || '').replace(/^B\d+ · /, '');
  const L = it.x <= E, R = it.x + it.w >= deck.w - E, T = it.y <= E, B = it.y + it.h >= deck.h - E;
  const stretchX = it.t === 'rect' || it.t === 'img' || (it.t === 'text' && (it.fill || it.line));
  const stretchY = it.t === 'rect' || it.t === 'img';
  let x0 = it.x, x1 = it.x + it.w, y0 = it.y, y1 = it.y + it.h, mode = 'shift';
  if (stretchX) { x0 += L ? 0 : dX; x1 += R ? 2 * dX : dX; }
  else { const sh = L ? 0 : R ? 2 * dX : dX; x0 += sh; x1 += sh; }
  if (HEAD.test(name) && it.y < 100) mode = 'head';                                  // stays under the top edge
  else if (stretchY && (T || it.y <= 110) && B) { y1 += 2 * dY; mode = 'grow'; }      // from the top (or header) to the foot
  else if (stretchY && (L || R) && it.h >= 200 && T !== B) {                          // a side quadrant: keeps its share
    y0 *= sy; y1 *= sy; mode = 'share';
  }
  else if (B) { y0 += 2 * dY; y1 += 2 * dY; mode = 'foot'; }                          // sits on the foot
  else if (stretchY && T) mode = 'hang';                                              // hangs from the top edge
  else { y0 += dY; y1 += dY; }
  const edge = stretchY && (L || R || T || B);
  return { x0, x1, y0, y1, mode, edge };
}

function fillItem(it, isAuto, containers) {
  const FW = page.w, FH = page.h;
  if (FW - deck.w < 0.5 && FH - deck.h < 0.5) return it;
  const dX = (FW - deck.w) / 2, dY = (FH - deck.h) / 2;
  if (isAuto) {   // toads: spread over the whole window
    const ss = Math.sqrt((FW * FH) / (deck.w * deck.h)), cx = it.x + it.w / 2, cy = it.y + it.h / 2;
    return { ...it, x: (cx * FW) / deck.w - (it.w * ss) / 2, y: (cy * FH) / deck.h - (it.h * ss) / 2, w: it.w * ss, h: it.h * ss };
  }
  if (it.t === 'line') {
    const head = Math.max(it.y1, it.y2) < 100;
    return { ...it, x1: it.x1 + dX, x2: it.x2 + dX, y1: it.y1 + (head ? 0 : dY), y2: it.y2 + (head ? 0 : dY) };
  }
  const b = fillBox(it);
  let { y0, y1 } = b;
  if (b.mode === 'shift' || b.mode === 'hang') {
    // inside a panel or picture that reaches an edge: stay centred in it as it moves and grows
    const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
    const c = containers.filter((c) => c.it !== it && cx >= c.it.x && cx <= c.it.x + c.it.w && cy >= c.it.y && cy <= c.it.y + c.it.h)
      .sort((a, z) => a.it.w * a.it.h - z.it.w * z.it.h)[0];
    if (c) {
      const d = c.b.y0 - c.it.y + (c.b.y1 - c.b.y0 - c.it.h) / 2 - (y0 - it.y); y0 += d; y1 += d;
      if (c.b.mode === 'share') {   // a quadrant panel: its contents centred across its width too
        const dx = c.b.x0 - c.it.x + (c.b.x1 - c.b.x0 - c.it.w) / 2 - (b.x0 - it.x); b.x0 += dx; b.x1 += dx;
      }
    }
  }
  const o = { ...it, x: b.x0, y: y0, w: b.x1 - b.x0, h: y1 - y0 };
  if (it.t === 'img' && (Math.abs(o.w - it.w) > 0.5 || Math.abs(o.h - it.h) > 0.5)) o.crop = coverCrop(it, o.w, o.h);
  return o;
}

function fillItems(s0) {
  const containers = s0.items.filter((it) => it.t !== 'line' && s0.auto[it.id] === undefined)
    .map((it) => ({ it, b: fillBox(it) })).filter((c) => c.b.edge);
  return s0.items.map((it) => fillItem(it, s0.auto[it.id] !== undefined, containers));
}

function renderSlide(i) {
  const s0 = deck.slides[i];
  let L = null;
  let tall = false;
  if (phone) { const P = sectionPage(s0.section); k = P.k; page = { w: P.W, h: P.H }; L = P.L; tall = P.scroll; }
  else { k = kSlides; page = { w: window.innerWidth / k, h: window.innerHeight / k }; }
  const s = L ? { ...s0, items: s0.items.map((it) => phoneItem(it, L.map.get(it.key))).filter(Boolean) }
    : { ...s0, items: fillItems(s0) };
  const el = document.createElement('div');
  el.className = 'slide';
  if (tall) { el.style.height = `${page.h * k}px`; el.style.bottom = 'auto'; }
  el.dataset.tall = tall ? '1' : '';
  const [base, line, pitch, thick] = SCAN[s.bg] || SCAN.rust;
  el.style.backgroundColor = base;
  el.style.backgroundImage = `repeating-linear-gradient(to bottom, ${base} 0, ${base} ${px(pitch - thick)}, ${line} ${px(pitch - thick)}, ${line} ${px(pitch)})`;
  const lines = [];
  for (const it of s.items) {
    if (it.t === 'line') { lines.push(it); continue; }
    const node = it.t === 'img' ? renderImage(it) : it.t === 'text' ? renderText(it) : (() => {
      const d = document.createElement('div'); place(d, it); if (it.fill) d.style.background = it.fill; stroke(d, it.line); return d;
    })();
    node.dataset.id = it.id;
    if (s.auto[it.id] !== undefined) node.style.visibility = 'hidden';
    el.append(node);
  }
  if (lines.length) el.append(renderLines(lines));
  return el;
}

// ---- timing: shapes that appear on their own (the cane toads) ------------------------------------
function startAuto(el, s, elapsed) {
  timers.forEach(clearTimeout); timers = [];
  for (const [id, delay] of Object.entries(s.auto)) {
    const node = el.querySelector(`[data-id="${id}"]`);
    if (!node) continue;
    const wait = delay + s.fade * 1000 - elapsed;   // PowerPoint starts the clock once the transition ends
    if (wait <= 0) node.style.visibility = 'visible';
    else timers.push(setTimeout(() => { node.style.visibility = 'visible'; }, wait));
  }
}

// ---- navigation --------------------------------------------------------------------------------
function show(i, { animate = true } = {}) {
  i = Math.max(0, Math.min(deck.slides.length - 1, i));
  const s = deck.slides[i];
  const el = renderSlide(i);
  const old = current, forward = i > index || !old;
  index = i; current = el;
  if (animate && old && forward && s.fade) {
    el.style.opacity = '0';
    el.style.transition = `opacity ${s.fade}s ease`;
    stage.append(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1'; }));
    const done = () => { if (old.isConnected) old.remove(); };
    el.addEventListener('transitionend', done, { once: true });
    setTimeout(done, s.fade * 1000 + 100);
  } else {
    stage.querySelectorAll('.slide').forEach((n) => n.remove());
    stage.append(el);
  }
  setScroll(el);
  slideStart = performance.now() - (animate ? 0 : 1e9);
  startAuto(el, s, animate ? 0 : 1e9);
  history.replaceState(null, '', `#${i + 1}`);
  live.textContent = `Slide ${i + 1} of ${deck.slides.length}`;
  preload(i + 1); preload(i + 2);
}

// a page taller than the window scrolls, with a fade at the foot while there is more below
const more = document.getElementById('more');
function setScroll(el) {
  let tall = el.dataset.tall === '1';
  if (tall) {   // only when this beat's shapes actually reach below the window
    const top = el.getBoundingClientRect().top;
    const foot = Math.max(0, ...[...el.children].filter((n) => n.style.visibility !== 'hidden').map((n) => n.getBoundingClientRect().bottom - top));
    tall = foot > stage.clientHeight + 2;
  }
  stage.style.overflowY = tall ? 'auto' : 'hidden';
  stage.scrollTop = 0;
  updateMore();
}
function updateMore() {
  if (!more) return;
  const left = stage.scrollHeight - stage.clientHeight - stage.scrollTop;
  more.style.opacity = stage.style.overflowY === 'auto' && left > 4 ? '1' : '0';
}
stage.addEventListener('scroll', updateMore, { passive: true });

const preloaded = new Set();
function preload(i) {
  const s = deck.slides[i];
  if (!s) return;
  for (const it of s.items) if (it.t === 'img' && !preloaded.has(it.src)) { preloaded.add(it.src); new Image().src = it.src; }
}

const LAYOUT = new URLSearchParams(location.search).get('layout');   // 'phone' | 'slides' to force one
function fit() {
  probeCache.clear();
  const vw = window.innerWidth, vh = window.innerHeight;
  // the phone layout for portrait and near-square windows; everything wider fills the window
  const portrait = LAYOUT === 'phone' || (LAYOUT !== 'slides' && vw < vh * 1.15);
  pages.clear();
  if (portrait) {
    phone = { vw, vh };
    stage.style.width = `${vw}px`; stage.style.height = `${vh}px`;
  } else {
    phone = null;
    kSlides = k = Math.min(vw / deck.w, vh / deck.h);   // the slide at its largest; the page fills the rest
    stage.style.width = `${vw}px`; stage.style.height = `${vh}px`;
  }
  if (!current) return;
  // re-lay the current slide at the new size, keeping the toads that have already landed
  const elapsed = performance.now() - slideStart;
  const el = renderSlide(index);
  stage.querySelectorAll('.slide').forEach((n) => n.remove());
  stage.append(el); current = el;
  setScroll(el);
  startAuto(el, deck.slides[index], elapsed);
}

let resizeFrame = null;
function scheduleFit() { if (resizeFrame === null) resizeFrame = requestAnimationFrame(() => { resizeFrame = null; fit(); }); }

function bind() {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const next = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'n', 'N'];
    const prev = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p', 'P'];
    if (next.includes(e.key)) { e.preventDefault(); show(index + 1); }
    else if (prev.includes(e.key)) { e.preventDefault(); show(index - 1, { animate: false }); }
    else if (e.key === 'Home') { e.preventDefault(); show(0, { animate: false }); }
    else if (e.key === 'End') { e.preventDefault(); show(deck.slides.length - 1, { animate: false }); }
    else if (e.key === 'f' || e.key === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); }
  });
  stage.addEventListener('click', (e) => { if (e.button === 0) show(index + 1); });
  let x0 = null;
  stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) (dx < 0 ? show(index + 1) : show(index - 1, { animate: false }));
  }, { passive: true });
  window.addEventListener('resize', scheduleFit, { passive: true });
  window.addEventListener('message', (e) => { if (e.data === 'mint-presentation-resize') scheduleFit(); });
  window.addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (n && n - 1 !== index) show(n - 1, { animate: false }); });
}

// Test hook: every rendered line's measured width against its box (used by the QA script).
window.__deck = {
  get index() { return index; }, get count() { return deck?.slides.length; }, get pretext() { return pretext ? 'ready' : 'fallback'; },
  go: (i) => show(i, { animate: false }),
  appleFaces: () => ['Big Caslon', 'Avenir Next Condensed Heavy', 'Menlo'].every(ownFace),
  get phone() { return phone ? { ...sectionPage(deck.slides[index].section), L: undefined } : null; },
  unplaced: () => (phone ? sectionPage(deck.slides[index].section).L.unplaced : []),
  over: () => (phone ? sectionPage(deck.slides[index].section).L.over : 0),
  tryLayout: (W, fit) => { const sec = deck.slides[index].section; const L = layoutSection(deck, sec, W, (W * phone.vh) / phone.vw, T, fit); return Math.round(L.over); },
  lines: () => [...(current?.querySelectorAll('[data-id]') || [])].filter((n) => n.querySelector('.tl'))
    .map((n) => ({ id: +n.dataset.id, lines: [...n.querySelectorAll('.tl')].map((l) => l.textContent),
      base: [...n.querySelectorAll('.tl')].map((l) => {   // true baseline via a zero-size marker
        if (!l.firstElementChild) return null;
        const mk = document.createElement('i');
        mk.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        l.append(mk);
        const v = (mk.getBoundingClientRect().top - stage.getBoundingClientRect().top) / k;
        mk.remove();
        return +v.toFixed(2);
      }) })),
  overflow() {
    const bad = [];
    current?.querySelectorAll('.tl').forEach((line) => {
      const box = parseFloat(line.style.width), spans = [...line.children];
      const w = spans.reduce((a, s) => a + s.getBoundingClientRect().width, 0);
      if (w > box + 1.5) bad.push({ text: line.textContent.slice(0, 60), over: +(w - box).toFixed(1) });
    });
    return bad;
  },
};

async function main() {
  const [d, p] = await Promise.all([fetch('deck.json', { cache: 'no-cache' }).then((r) => r.json()), loadPretext()]);
  deck = d; pretext = p;
  assignKeys(deck);
  document.documentElement.dataset.pretext = pretext ? 'ready' : 'fallback';
  // load every face the deck uses before measuring anything
  const faces = new Set();
  for (const s of deck.slides) for (const it of s.items) if (it.paras) for (const pa of it.paras) for (const r of pa.runs) if (r.f) faces.add(`${r.b ? fam(r.f).bw : fam(r.f).w}|${r.f}`);
  await Promise.all([...faces].map((f) => {
    const [w, name] = f.split('|');
    return Promise.all(fam(name).css.split(',').map((c) => document.fonts.load(`${w} 20px ${c.trim()}`).catch(() => null)));
  }));
  await document.fonts.ready;
  stage.querySelector('#loading')?.remove();
  fit();
  bind();
  const n = parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(n) && n > 0 ? n - 1 : 0, { animate: false });
  window.dispatchEvent(new Event('deck-ready'));
  document.documentElement.dataset.ready = '1';
}

main().catch((e) => { console.error(e); stage.textContent = 'This presentation failed to load.'; });
