// Portrait-phone layout for the web deck. Landscape windows show the PowerPoint exactly (deck.js);
// in a portrait window each section is rearranged for a tall, narrow page instead.
//
// A section's elements are matched across its beats by shape name (the generator's "B3 · " prefix
// and "(current)/(passed)/(lead)" suffixes stripped), so every element sits in the same place on
// every beat and builds read as they do in PowerPoint. Each section has a short list of blocks,
// stacked top to bottom under the pinned rail and title:
//   flow   text reflowed at the page width by Pretext (via deck.js); rows of a number beside its label
//          stay together, side-by-side columns stack, rules and panels stretch to the new width
//   scale  a group kept exactly as drawn (images, diagrams, cards), scaled to the page width
//   grid   groups (columns) scaled alike and wrapped into rows of `cols`
//   art    one image cropped to fill a full-width band (section art)
//   bands  image+caption groups as full-width bands (cover-cropped)
//   scatter  shapes spread proportionally over the whole page (the toads)
//   stack / phases  compound blocks: stacked, or alternatives that share the same space
// Shapes no rule claims fall into a final scale block and are listed by __deck.unplaced().

const norm = (n) => (n || '').replace(/^B\d+ · /, '').replace(/ \((current|passed|lead)\)$/, '').trim();

// matchers: a RegExp tests the shape name; {area:[x0,y0,x1,y1]} tests the shape's centre; {t:'img'}
// tests its type; {not: m} negates; arrays are "any of"
function matches(m, slot) {
  if (!m) return false;
  if (m instanceof RegExp) return m.test(slot.name);
  if (Array.isArray(m)) return m.some((x) => matches(x, slot));
  if (typeof m === 'function') return m(slot);
  let ok = true;
  if (m.area) { const [x0, y0, x1, y1] = m.area, c = centre(slot.box); ok = ok && c.x >= x0 && c.x < x1 && c.y >= y0 && c.y < y1; }
  if (m.t) ok = ok && slot.t === m.t;
  if (m.name) ok = ok && m.name.test(slot.name);
  if (m.not) ok = ok && !matches(m.not, slot);
  return ok;
}

const IMG = { t: 'img' };
const SPECS = [
  // [section-name test, spec]; spec.head: shapes laid out under the rail (default: the title)
  [/^Title$/, { head: /^(byline|venue)$/, blocks: [{ m: /^title$/, mode: 'flow' }] }],
  [/age of wonders/, { blocks: [{ m: { area: [0, 100, 480, 541] }, mode: 'scale' }, { m: { area: [480, 100, 961, 541] }, mode: 'scale' }] }],
  [/reckoning$/i, { head: null, blocks: [{ m: /^(numeral|kicker|lead|section title)$/, mode: 'flow' }, { m: IMG, mode: 'art', h: 'fill' }] }],
  [/Definition by extension/, { blocks: [{ m: { area: [0, 100, 385, 541] }, mode: 'flow' }, { m: { area: [385, 100, 961, 425] }, mode: 'scale' }, { m: /./, mode: 'flow' }] }],
  [/Analytical definitions/, { blocks: [{ m: { area: [0, 100, 478, 541] }, mode: 'flow' }, { m: { area: [478, 100, 961, 541] }, mode: 'flow' }] }],
  [/Location and vector/, { blocks: [
    { m: { area: [305, 100, 662, 541] }, mode: 'scale', maxS: 1.2 },
    { mode: 'grid', gap: 16, groups: [{ m: { area: [0, 100, 305, 541] }, s: 1 }, { m: { area: [662, 100, 961, 541] } }] }] }],
  [/Roadblocks/, { blocks: [{ m: { area: [0, 100, 961, 541] }, mode: 'grid', cols: 2, gap: 14, split: [240, 480, 720], drop: /^rule \d$/ }] }],
  [/foothills/, { head: null, blocks: [{ m: { not: IMG, area: [0, 40, 560, 541] }, mode: 'flow' }, { m: IMG, mode: 'art', h: 'fill' }] }],
  [/Should we build AGI\?$/, { blocks: [{ m: { area: [0, 100, 470, 541] }, mode: 'flow' }, { m: { area: [470, 100, 961, 541] }, mode: 'scale' }] }],
  [/best of times/, { blocks: [{ m: /./, mode: 'flow', oneLine: true }] }],
  [/Plan: three reckonings|^Review$/, { blocks: [{ m: /./, mode: 'flow', narrow: /^numeral/ }] }],
  [/Structuring the question/, { blocks: [{ m: /./, mode: 'flow', order: 'cols' }] }],
  [/Can we build AGI safely/, { blocks: [{ m: IMG, mode: 'scale' }, { m: /./, mode: 'flow', order: 'cols' }] }],
  [/^Lowering/, { head: null, blocks: [
    { mode: 'phases', align: 'bottom', phases: [
      [{ m: { area: [0, 45, 465, 372], not: /^not fixed$/ }, mode: 'flow' }, { m: { area: [465, 45, 961, 372], not: /^not fixed$/ }, mode: 'scale', gap: 12, minPic: 1 }],   // the matrix's labels are small already
      [{ m: /^not fixed$/, mode: 'flow' }]] },
    { m: /^title/, mode: 'flow', gap: 14 }] }],
  [/Private reasons/, { blocks: [
    { m: { area: [0, 100, 961, 480] }, mode: 'grid', cols: 1, gap: 18, split: [480], drop: /^rule 3$/ },
    { m: /./, mode: 'flow' }] }],
  [/Public opinion/, { blocks: [
    { m: /^nothing to gain$/, mode: 'flow' },
    { m: { area: [40, 180, 330, 410] }, mode: 'flow', gap: 14 },
    { m: { area: [330, 180, 630, 410] }, mode: 'flow', gap: 10 },
    { m: { area: [630, 180, 961, 410] }, mode: 'flow', gap: 10 },
    { m: /./, mode: 'flow', gap: 14 }] }],
  [/^Is the prize worth having\?$/, { blocks: [{ m: { area: [0, 100, 478, 541] }, mode: 'flow' }, { m: { area: [478, 100, 961, 541] }, mode: 'flow' }] }],
  [/Vulnerability scanning/, { blocks: [
    { m: /^toad/, mode: 'scatter' },
    { mode: 'phases', phases: [
      [{ m: /(number|engraving)$|^(Cybersecurity|Science \/ education|Digital economy|Democracy|Military|…)$|^rule \d$/, mode: 'grid', cols: 3, gap: 10, split: [160, 320, 480, 640, 800], drop: /^rule \d$/ }],
      [{ m: { area: [0, 100, 478, 541] }, mode: 'scale' }, { m: { area: [478, 100, 961, 541] }, mode: 'scale', drop: /^divider$/, gap: 16 }]] }] }],
  [/Capacity building/, { blocks: [{ m: { not: IMG, area: [0, 100, 440, 541] }, mode: 'flow' }, { m: IMG, mode: 'scale' }] }],
  [/Section II conclusion/, { head: null, blocks: [{ m: { not: IMG }, mode: 'flow' }, { m: IMG, mode: 'art', h: 'fill' }] }],
  [/Post-AGI institutions/, { blocks: [{ m: IMG, mode: 'scale', maxH: 0.3 }, { m: { area: [490, 100, 961, 541] }, mode: 'flow' }] }],
  [/^AGI institutions$/, { blocks: [{ m: /./, mode: 'bands', split: [320, 640], h: 'fill' }] }],
  [/New social and political theories/, { blocks: [{ mode: 'stack', panel: /document ground/, blocks: [
    { m: { area: [0, 100, 500, 418] }, mode: 'scale' },
    { m: { area: [0, 418, 961, 541] }, mode: 'bands', h: 150, gap: 8 },
    { m: { area: [500, 100, 961, 418] }, mode: 'scale', gap: 8 }] }] }],
  [/Pillars of the voluntary social order/, {
    blocks: [
      { m: { area: [0, 100, 326, 480] }, mode: 'flow' },
      { m: { area: [326, 100, 632, 480] }, mode: 'flow', gap: 16 },
      { m: { area: [632, 100, 961, 480] }, mode: 'flow', gap: 16 },
      { m: /./, mode: 'flow', gap: 16 }],
    // on a short screen each pillar's stones are laid two to a course
    compact: [
      { m: { area: [0, 100, 326, 480] }, mode: 'flow', pack: /: / },
      { m: { area: [326, 100, 632, 480] }, mode: 'flow', pack: /: /, gap: 16 },
      { m: { area: [632, 100, 961, 480] }, mode: 'flow', pack: /: /, gap: 16 },
      { m: /./, mode: 'flow', gap: 16 }] }],
  [/^Thanks$/, { head: /^(thanks|byline)$/, blocks: [{ m: IMG, mode: 'art', h: 'fill', fx: 0.5 }] }],
];
const DEFAULT = { blocks: [{ m: /./, mode: 'flow' }] };

// ---- geometry helpers -----------------------------------------------------------------------------
const centre = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const area = (b) => Math.max(0, b.w) * Math.max(0, b.h);
function boxOf(it) {
  if (it.t === 'line') return { x: Math.min(it.x1, it.x2), y: Math.min(it.y1, it.y2), w: Math.abs(it.x2 - it.x1), h: Math.abs(it.y2 - it.y1) };
  return { x: it.x, y: it.y, w: it.w, h: it.h };
}
function union(boxes) {
  const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w)), y1 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function inter(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}
const inside = (outer, p) => p.x >= outer.x - 1 && p.x <= outer.x + outer.w + 1 && p.y >= outer.y - 1 && p.y <= outer.y + outer.h + 1;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- slots: one per element of a section, across its beats ----------------------------------------
export function assignKeys(deck) {
  for (const s of deck.slides) {
    const seen = new Map();
    for (const it of s.items) {
      const base = `${norm(it.n) || `#${it.id}`}|${it.t}`;
      const n = seen.get(base) || 0;
      seen.set(base, n + 1);
      it.key = n ? `${base}#${n}` : base;
    }
  }
}

function sectionSlots(deck, sec) {
  const slots = new Map();
  deck.slides.forEach((s, i) => {
    if (s.section !== sec) return;
    for (const it of s.items) {
      let slot = slots.get(it.key);
      if (!slot) slots.set(it.key, slot = { key: it.key, name: norm(it.n), t: it.t, rep: it, inst: [], beats: new Set() });
      slot.inst.push(it);
      slot.beats.add(i);
    }
  });
  for (const slot of slots.values()) slot.box = union(slot.inst.map(boxOf));
  return [...slots.values()];
}

// ---- the layout ----------------------------------------------------------------------------------
// T: text services from deck.js — height(item) and widest(item) in points, scaleText(item, fs)
// fit: { up, pic, tight } — up > 1 lets pictures grow on tablets; pic < 1 shrinks pictures and
// tight halves the spacing, both tried (by deck.js) before the text itself gets smaller
export function layoutSection(deck, sec, W, H, T, fit = {}) {
  const { up = 1, pic = 1, tight = false, compact = false } = fit;
  const name = deck.sections[sec].replace(/^\d+\s*·\s*/, '');
  const spec = (SPECS.find(([re]) => re.test(name)) || [null, DEFAULT])[1];
  const all = sectionSlots(deck, sec);
  const M = 24, AW = W - 2 * M;
  // on a page wider than a phone column (tablets), pictures and diagrams grow with it
  const ctx = { W, H, M, AW, T, deck, up, pic, tight, sp: (v) => (tight ? v / 2 : v), out: new Map() };
  const put = (slot, pl) => ctx.out.set(slot.key, pl);
  let pool = all.slice();
  const take = (m) => { const got = pool.filter((s) => matches(m, s)); pool = pool.filter((s) => !got.includes(s)); return got; };

  // chrome: the rail and slide number, pinned to the top
  let y = 10;
  const rail = take(/^rail$/)[0], num = take(/^slide number$/)[0];
  if (rail || num) {
    let hh = 0;
    if (num) { const h = T.height({ ...num.rep, w: 46 }); put(num, { abs: { x: M + AW - 46, y, w: 46, h } }); hh = Math.max(hh, h); }
    if (rail) {
      const paras = rail.rep.paras.map((p) => ({ ...p, runs: p.runs.map((r) => (!r.t || r.t === '\n' ? r
        : !r.t.trim() ? { ...r, t: '   ' } : r.b ? r : { ...r, t: r.t.split(' · ')[0] })) }));
      const w = AW - 54, h = T.height({ ...rail.rep, paras, w });
      put(rail, { abs: { x: M, y, w, h }, paras });
      hh = Math.max(hh, h);
    }
    y += hh + 6;
  } else y = M;
  const headM = spec.head === undefined ? /^title$/ : spec.head;
  if (headM) {
    const head = take(headM);
    if (head.length) {
      const b = flow(head, ctx, {});
      commit(b, y, ctx);
      y += b.h;
    }
  }
  const top = y + (y > M ? ctx.sp(22) : 0), bottom = H - M;

  // content blocks
  const blocks = (compact && spec.compact || spec.blocks).map((b) => build(b, take, ctx));
  const rest = pool;
  if (rest.length) blocks.push(scale(rest, ctx, {}));   // anything no rule claimed
  const fixed = blocks.reduce((a, b, i) => a + (b.fill ? 0 : b.h) + (i ? b.gap : 0), 0);
  const fillers = blocks.filter((b) => b.fill);
  const free = bottom - top - fixed;
  let fillH = 0;
  if (fillers.length) fillH = Math.max((tight ? 0.2 : 0.28) * H, free) / fillers.length;
  const total = fixed + fillH * fillers.length;
  let yy = top + (fillers.length ? 0 : Math.max(0, (bottom - top - total) * 0.4));
  blocks.forEach((b, i) => {
    if (i) yy += b.gap;
    if (b.fill) b.setH(fillH + (i === blocks.length - 1 ? M : 0));   // the last image runs off the bottom
    commit(b, yy, ctx);
    yy += b.h;
  });
  return { map: ctx.out, over: total - (bottom - top), unplaced: rest.map((s) => s.name || s.key), spec: !!SPECS.find(([re]) => re.test(name)) };
}

// a block: { h, gap, items: [[slot, placement relative to the block top]], fill?, setH? }
function commit(b, y0, ctx) {
  for (const [slot, pl] of b.items) {
    if (pl.abs) ctx.out.set(slot.key, { ...pl, abs: { ...pl.abs, y: pl.abs.y + y0 } });
    else if (pl.aff) ctx.out.set(slot.key, { ...pl, aff: { ...pl.aff, dy: pl.aff.dy + y0 } });
    else ctx.out.set(slot.key, pl);
  }
}

function build(b, take, ctx) {
  let blk;
  if (b.mode === 'stack' || b.mode === 'phases') {
    const panel = b.panel ? take(b.panel)[0] : null;
    const lists = b.mode === 'stack' ? [b.blocks] : b.phases;
    const built = lists.map((list) => list.map((x) => build(x, take, ctx)));
    const heights = built.map((list) => list.reduce((a, x, i) => a + x.h + (i ? x.gap : 0), 0));
    const h = Math.max(0, ...heights), items = [];
    built.forEach((list, pi) => {
      let yy = b.align === 'bottom' ? h - heights[pi] : 0;
      list.forEach((x, i) => {
        if (i) yy += x.gap;
        for (const [slot, pl] of x.items) items.push([slot, shift(pl, yy)]);
        yy += x.h;
      });
    });
    if (panel) {
      const pad = 9;
      for (const it of items) it[1] = shift(it[1], pad);
      items.push([panel, { abs: { x: 0, y: 0, w: ctx.W, h: h + 2 * pad } }]);
      blk = { h: h + 2 * pad, items };
    } else blk = { h, items };
  } else {
    const slots = take(b.m || /./);
    if (b.mode === 'scatter') blk = scatter(slots, ctx);
    else if (!slots.length) blk = { h: 0, items: [] };
    else if (b.mode === 'flow') blk = flow(slots, ctx, b);
    else if (b.mode === 'scale') blk = scale(slots, ctx, b);
    else if (b.mode === 'grid') blk = grid(slots, ctx, b);
    else if (b.mode === 'art') blk = art(slots, ctx, b);
    else if (b.mode === 'bands') blk = bands(slots, ctx, b);
    else blk = scale(slots, ctx, b);
  }
  blk.gap = blk.h || blk.fill ? ctx.sp(b.gap ?? 20) : 0;
  return blk;
}

const shift = (pl, dy) => (pl.abs ? { ...pl, abs: { ...pl.abs, y: pl.abs.y + dy } } : pl.aff ? { ...pl, aff: { ...pl.aff, dy: pl.aff.dy + dy } } : pl);

// ---- flow ----------------------------------------------------------------------------------------
const DISPLAY = 28;   // points: text this size or larger shrinks together to fit the width
const maxSize = (it) => Math.max(0, ...it.paras.flatMap((p) => p.runs.map((r) => r.s || 0)), ...it.paras.map((p) => p.size || 0));

function findPanel(slots, deck) {
  let panel = null;
  for (const r of slots) {
    if (r.t !== 'rect') continue;
    const others = slots.filter((o) => o !== r);
    const n = others.filter((o) => inside(r.box, centre(o.box))).length;
    if (others.length && n >= Math.max(1, 0.6 * others.length) && (!panel || area(r.box) > area(panel.box))) panel = r;
  }
  if (!panel) return null;
  panel.bleed = panel.box.x <= 2 || panel.box.x + panel.box.w >= deck.w - 2;
  return panel;
}

function flow(slots, ctx, opt) {
  const { W, M, AW, T, deck } = ctx;
  const items = [];
  const panel = findPanel(slots, deck);
  let content = slots.filter((s) => s !== panel);
  if (opt.drop) { for (const s of content.filter((s) => matches(opt.drop, s))) items.push([s, { hide: true }]); content = content.filter((s) => !matches(opt.drop, s)); }
  if (!content.length) return { h: 0, items };
  const cb = union(content.map((s) => s.box));
  let x0 = M, aw = AW, padT = 0, padB = 0;
  if (panel) {
    const lo = ctx.tight ? 6 : 10, hi = ctx.tight ? 18 : 36;
    padT = clamp(cb.y - panel.box.y, lo, hi); padB = clamp(panel.box.y + panel.box.h - cb.y - cb.h, lo, hi);
    if (!panel.bleed) { const padL = clamp(cb.x - panel.box.x, 10, 24); x0 = M + padL; aw = AW - 2 * padL; }
  }
  const blockW = cb.w;

  // units: shapes drawn in (nearly) the same place move together
  const units = [];
  for (const s of content.slice().sort((a, b) => area(b.box) - area(a.box))) {
    const u = units.find((u) => u.members.some((m) => (m.t === 'rect') === (s.t === 'rect') && inter(m.box, s.box) > 0.5 * Math.min(area(m.box), area(s.box)) && area(s.box) > 0));
    if (u) { u.members.push(s); u.box = union(u.members.map((m) => m.box)); } else units.push({ members: [s], box: s.box, lead: s });
  }
  // landscape "visual" extent of text (its content, not its box) for spacing
  for (const u of units) {
    const s = u.lead;
    if (s.t === 'text') {
      const ch = Math.max(...s.inst.map((it) => T.height(it)));
      const off = s.rep.anchor === 'ctr' ? (s.box.h - ch) / 2 : s.rep.anchor === 'b' ? s.box.h - ch : 0;
      u.vis = { y: s.box.y + Math.max(0, off), h: Math.min(ch, s.box.h) };
    } else u.vis = { y: u.box.y, h: u.box.h };
  }
  // rows: units that overlap vertically
  units.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
  const rows = [];
  for (const u of units) {
    const r = rows[rows.length - 1];
    const ov = r ? Math.min(r.y1, u.box.y + u.box.h) - Math.max(r.y0, u.box.y) : 0;
    if (r && ov > 0.3 * Math.min(u.box.h, r.y1 - r.y0)) { r.units.push(u); r.y1 = Math.max(r.y1, u.box.y + u.box.h); }
    else rows.push({ units: [u], y0: u.box.y, y1: u.box.y + u.box.h });
  }
  const isWide = (u) => !(opt.narrow && matches(opt.narrow, u.lead)) && (u.lead.t !== 'rect' && u.box.w >= 120 || u.lead.t === 'img');
  const isBand = (u) => u.lead.t === 'rect' && u.box.w >= 0.8 * blockW;
  // containers: a rect in a row that holds that row's other shapes (slabs, bars)
  const subrows = [];
  rows.forEach((r, ri) => {
    r.units.sort((a, b) => a.box.x - b.box.x);
    const container = r.units.find((u) => u.lead.t === 'rect' && r.units.some((o) => o !== u && inside(u.box, centre(o.box))));
    const us = r.units.filter((u) => u !== container);
    let cur = null;
    for (const u of us) {
      const last = cur?.units[cur.units.length - 1];
      if (!cur || (isWide(u) && cur.units.some(isWide)) || (last && u.box.x - (last.box.x + last.box.w) > 150)) subrows.push(cur = { units: [], ri, container: null });
      cur.units.push(u);
    }
    if (container) { if (!cur) subrows.push(cur = { units: [], ri }); cur.container = container; cur.units.forEach((u) => { u.inContainer = true; }); }
    r.vis0 = Math.min(...r.units.map((u) => u.vis.y)); r.vis1 = Math.max(...r.units.map((u) => u.vis.y + u.vis.h));
  });
  if (opt.order === 'cols') {   // column by column: cluster sub-rows by where they start
    const cols = [];
    for (const sr of subrows) {
      const x = Math.min(...sr.units.map((u) => u.box.x));
      let c = cols.find((c) => Math.abs(c.x - x) < 60);
      if (!c) cols.push(c = { x, rows: [] });
      c.rows.push(sr);
    }
    cols.sort((a, b) => a.x - b.x);
    cols.forEach((c, i) => { if (i) c.rows[0].colBreak = true; });
    subrows.splice(0, subrows.length, ...cols.flatMap((c) => c.rows));
  }

  if (opt.pack) {
    const packed = [];
    for (const sr of subrows) {
      const one = sr.units.length === 1 && !sr.container && matches(opt.pack, sr.units[0].lead);
      const prev = packed[packed.length - 1];
      if (one && prev?.pack && prev.units.length === 1) { prev.units.push(sr.units[0]); continue; }
      if (one) sr.pack = true;
      packed.push(sr);
    }
    subrows.splice(0, subrows.length, ...packed);
  }

  // the shared display scale: big type shrinks together until its longest word fits
  const wideAvail = (sr, u) => {
    const x = Math.min(...sr.units.map((v) => v.box.x));
    const w = aw - (u.box.x - x);
    return w < 0.45 * aw ? aw : w;
  };
  let fsD = 1;
  for (const sr of subrows) for (const u of sr.units) {
    const s = u.lead;
    if (s.t !== 'text' || !isWide(u)) continue;
    for (const it of s.inst) {
      if (maxSize(it) < DISPLAY) continue;
      fsD = Math.min(fsD, (wideAvail(sr, u) * 0.97 - it.ins[0] - it.ins[2]) / T.widest(opt.oneLine ? { ...it, wrap: false } : it));
    }
  }
  const fsOf = (u, availW) => {
    const s = u.lead;
    if (s.t !== 'text') return 1;
    let f = Math.max(...s.inst.map(maxSize)) >= DISPLAY ? fsD : 1;
    for (const it of s.inst) f = Math.min(f, (availW * 0.98 - it.ins[0] - it.ins[2]) / T.widest(it));
    return Math.min(f, 1);
  };

  let y = padT, prevRow = null;
  for (const sr of subrows) {
    if (prevRow !== null) {
      const a = rows[prevRow], b = rows[sr.ri];
      y += sr.colBreak ? ctx.sp(24) : sr.ri === prevRow ? ctx.sp(8) : clamp(b.vis0 - a.vis1, sr.container || subrows.find((s) => s.ri === prevRow)?.container ? 0 : 6, ctx.sp(32));
    }
    prevRow = sr.ri;
    if (sr.pack) {   // side by side, halves of the width, one height
      const gap = 6, half = (aw - gap) / 2;
      const hs = sr.units.map((u) => { const fs = fsOf(u, half); return [fs, Math.max(...u.members.flatMap((m) => m.inst.map((it) => T.height({ ...T.scaleText(it, fs), w: half }))))]; });
      const rowH = Math.max(...hs.map((x) => x[1]));
      sr.units.forEach((u, i) => { for (const m of u.members) items.push([m, { abs: { x: x0 + i * (half + gap), y, w: half, h: rowH }, fs: hs[i][0] }]); });
      y += rowH;
      continue;
    }
    const rx = sr.units.length ? Math.min(...sr.units.map((u) => u.box.x)) : 0;
    const ry = sr.units.length ? Math.min(...sr.units.map((u) => u.box.y)) : sr.container.box.y;
    let bottom = y, wideSeen = false;
    const placed = [];
    for (const u of sr.units) {
      const off = u.box.x - rx;
      let x, w;
      if (isBand(u)) { x = u.box.x <= 2 && u.box.x + u.box.w >= deck.w - 2 ? 0 : x0; w = x ? aw : W; }
      else if (isWide(u) && !wideSeen) {
        wideSeen = true;
        x = x0 + off; w = x0 + aw - x;
        if (w < 0.45 * aw) { x = x0; w = aw; y = bottom + 6; }
      } else { x = x0 + off; w = u.box.w; }
      const fs = fsOf(u, w);
      if (u.lead.t === 'rect' && !isBand(u)) w = u.box.w >= 0.8 * blockW ? aw : u.box.w;
      // members of a unit keep their arrangement relative to its lead
      const ly = y + (u.box.y - ry) * (isWide(u) ? fsD : 1);
      let h;
      if (u.lead.t === 'text') h = Math.max(...u.members.filter((m) => m.t === 'text').flatMap((m) => m.inst.map((it) => T.height({ ...T.scaleText(it, fs), w }))));
      else if (u.lead.t === 'img' || u.members.length > 1) { const s = Math.min(ctx.up, w / u.box.w) * (u.lead.t === 'img' ? ctx.pic : 1); w = u.box.w * s; h = u.box.h * s; }
      else h = u.box.h;
      for (const m of u.members) {
        if (u.lead.t === 'text' && m.t === 'text') placed.push([m, { abs: { x, y: ly, w, h }, fs }]);
        else if (u.members.length === 1 && m.t !== 'img') placed.push([m, { abs: { x, y: ly, w, h }, fs }]);
        else { const s = w / u.box.w; placed.push([m, { aff: { s, ox: u.box.x, oy: u.box.y, dx: x, dy: ly } }]); }
      }
      bottom = Math.max(bottom, ly + h);
    }
    if (sr.container) {   // the slab grows to hold its contents; shapes drawn to its full height follow it
      const c = sr.container.box;
      const cy = sr.units.length ? y - (ry - c.y) : y;
      const ch = Math.max(c.h, bottom - cy + Math.max(0, c.y + c.h - (ry + Math.max(...sr.units.map((u) => u.box.h)))));
      const full = c.x <= 2 && c.x + c.w >= deck.w - 2;
      for (const m of sr.container.members) items.push([m, { abs: { x: full ? 0 : x0, y: cy, w: full ? W : aw, h: ch } }]);
      for (const p of placed) {
        const src = p[0].box;
        if (p[1].abs && Math.abs(src.y - c.y) < 3 && Math.abs(src.h - c.h) < 3) p[1] = { ...p[1], abs: { ...p[1].abs, y: cy, h: ch } };
      }
      bottom = Math.max(bottom, cy + ch);
    }
    items.push(...placed);
    y = bottom;
  }
  y += padB;
  if (panel) items.push([panel, { abs: { x: panel.bleed ? 0 : M, y: 0, w: panel.bleed ? W : AW, h: y } }]);
  return { h: y, items };
}

// ---- scale / grid ---------------------------------------------------------------------------------
function scale(slots, ctx, opt) {
  const { W, H, M, AW, deck } = ctx;
  const items = [];
  if (opt.drop) { for (const s of slots.filter((s) => matches(opt.drop, s))) items.push([s, { hide: true }]); slots = slots.filter((s) => !matches(opt.drop, s)); }
  if (!slots.length) return { h: 0, items };
  const panel = findPanel(slots, deck);
  const bb = union(slots.map((s) => s.box));
  let s, ox = bb.x, dx;
  const pic = Math.max(ctx.pic, opt.minPic ?? 0);
  if (panel && panel.bleed) { s = Math.min((opt.maxS ?? 1.05) * ctx.up, W / panel.box.w) * pic; ox = panel.box.x; dx = (W - panel.box.w * s) / 2; }
  else { s = Math.min((opt.maxS ?? 1) * ctx.up, AW / bb.w) * pic; dx = M + (AW - bb.w * s) / 2; }
  if (opt.maxH) s = Math.min(s, (opt.maxH * H) / bb.h), dx = panel?.bleed ? 0 : M + (AW - bb.w * s) / 2;
  for (const sl of slots) items.push([sl, { aff: { s, ox, oy: bb.y, dx, dy: 0 } }]);
  if (panel && panel.bleed) {   // a bleeding panel spans the whole width, as it touched the slide edge
    items.push([panel, { abs: { x: 0, y: (panel.box.y - bb.y) * s, w: W, h: panel.box.h * s } }]);
  }
  return { h: bb.h * s, items };
}

function pieces(slots, opt) {
  if (opt.groups) return opt.groups.map((g) => ({ slots: slots.filter((s) => matches(g.m, s)), s: g.s }));
  const cuts = [-Infinity, ...(opt.split || []), Infinity];
  return cuts.slice(1).map((c, i) => ({ slots: slots.filter((s) => { const x = centre(s.box).x; return x >= cuts[i] && x < c; }) }));
}

function grid(slots, ctx, opt) {
  const { M, AW } = ctx;
  const up = ctx.up;
  const items = [];
  if (opt.drop) { for (const s of slots.filter((s) => matches(opt.drop, s))) items.push([s, { hide: true }]); slots = slots.filter((s) => !matches(opt.drop, s)); }
  const ps = pieces(slots, opt).filter((p) => p.slots.length);
  for (const p of ps) p.box = union(p.slots.map((s) => s.box));
  const cols = opt.cols || ps.length, gap = opt.gap ?? 12;
  for (const p of ps) if (p.s) p.s *= up;
  const fixedW = ps.filter((p) => p.s).reduce((a, p) => a + p.box.w * p.s, 0);
  const free = ps.filter((p) => !p.s);
  const cellW = Math.max(0, ...free.map((p) => p.box.w));
  const perRow = Math.min(cols, ps.length);
  const nFree = Math.min(perRow, free.length);
  const s = nFree ? Math.min((opt.maxS ?? 1) * ctx.up, (AW - (perRow - 1) * gap - fixedW) / (nFree * cellW)) * ctx.pic : 1;
  let y = 0;
  for (let r = 0; r * cols < ps.length; r++) {
    const row = ps.slice(r * cols, r * cols + cols);
    let x = M, rowH = 0;
    const used = row.reduce((a, p) => a + (p.s ? p.box.w * p.s : cellW * s), 0) + (row.length - 1) * gap;
    x += (AW - used) / 2;
    for (const p of row) {
      const ps_ = p.s || s, cw = p.s ? p.box.w * p.s : cellW * s;
      const dx = x + (cw - p.box.w * ps_) / 2;
      for (const sl of p.slots) items.push([sl, { aff: { s: ps_, ox: p.box.x, oy: p.box.y, dx, dy: y } }]);
      rowH = Math.max(rowH, p.box.h * ps_);
      x += cw + gap;
    }
    y += rowH + gap;
  }
  return { h: Math.max(0, y - gap), items };
}

// ---- images that fill a band ----------------------------------------------------------------------
// the crop that shows a w x h window of the image, centred on what the slide showed
export function coverCrop(it, W, H, fx = 0.5, fy = 0.5) {
  const [l, t, r, b] = it.crop;
  const FW = it.w / (1 - l - r), FH = it.h / (1 - t - b);   // the whole picture, in slide points
  const B = W / H;
  let rw, rh;
  if (B < it.w / it.h) { rh = it.h; rw = rh * B; } else { rw = it.w; rh = rw / B; }
  const vx = l * FW, vy = t * FH;
  const rx = clamp(vx + (it.w - rw) * fx, 0, FW - rw), ry = clamp(vy + (it.h - rh) * fy, 0, FH - rh);
  return [rx / FW, ry / FH, 1 - (rx + rw) / FW, 1 - (ry + rh) / FH];
}

function art(slots, ctx, opt) {
  const { W, H } = ctx;
  const blk = { h: opt.h === 'fill' ? 0 : (opt.h || 0.4) * H, items: [], fill: opt.h === 'fill' };
  const place = () => { blk.items = slots.map((s) => [s, { abs: { x: 0, y: 0, w: W, h: blk.h }, crop: coverCrop(s.rep, W, blk.h, opt.fx, opt.fy) }]); };
  blk.setH = (h) => { blk.h = h; place(); };
  place();
  return blk;
}

function bands(slots, ctx, opt) {
  const { W, H, M, T, deck } = ctx;
  const panel = slots.find((s) => s.t === 'rect' && s.box.w >= 0.9 * deck.w);
  const ps = pieces(slots.filter((s) => s !== panel), opt).filter((p) => p.slots.length);
  const pad = panel ? 5 : 0, gap = 5;
  const blk = { h: 0, items: [], fill: opt.h === 'fill' };
  const place = () => {
    const bh = (blk.h - 2 * pad - gap * (ps.length - 1)) / ps.length;
    blk.items = [];
    if (panel) blk.items.push([panel, { abs: { x: 0, y: 0, w: W, h: blk.h } }]);
    ps.forEach((p, i) => {
      const y = pad + i * (bh + gap);
      const img = p.slots.filter((s) => s.t === 'img').sort((a, b) => area(b.box) - area(a.box))[0];
      for (const s of p.slots) {
        if (s === img) { blk.items.push([s, { abs: { x: 0, y, w: W, h: bh }, crop: coverCrop(s.rep, W, bh) }]); continue; }
        const ref = img ? img.box : p.box;
        const full = s.box.w >= 0.9 * ref.w;
        const x = full ? ((s.box.x - ref.x) / ref.w) * W : M / 2 + (s.box.x - ref.x), w = full ? (s.box.w / ref.w) * W : Math.min(s.box.w, W - x);
        const h = Math.max(...s.inst.map((it) => (it.t === 'text' ? T.height({ ...it, w }) : it.h)));
        blk.items.push([s, { abs: { x, y: y + bh - h, w, h } }]);
      }
    });
  };
  blk.setH = (h) => { blk.h = h; place(); };
  if (!blk.fill) blk.setH(opt.h > 1 ? opt.h * ctx.pic : (opt.h || 0.6) * H);
  return blk;
}

// ---- the toads -----------------------------------------------------------------------------------
function scatter(slots, ctx) {
  const { W, H, deck } = ctx;
  const ss = Math.sqrt((W * H) / (deck.w * deck.h));
  for (const s of slots) {
    const c = centre(s.box);
    ctx.out.set(s.key, { abs: { x: (c.x * W) / deck.w - (s.box.w * ss) / 2, y: (c.y * H) / deck.h - (s.box.h * ss) / 2, w: s.box.w * ss, h: s.box.h * ss }, absolute: true });
  }
  return { h: 0, items: [] };
}
