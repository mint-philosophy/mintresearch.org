#!/usr/bin/env python3
"""Inject the Minty floating overlay into Astro-rendered HTML pages.

Usage:
    python3 inject_minty.py dist/cv/index.html public/cv/index.html
    python3 inject_minty.py dist/index.html public/index.html

Reads the dist HTML, injects the three Minty blocks (sprite HTML, CSS,
JS module) before </body>, and writes to the output path.
"""

import sys
import os
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# ── The three Minty injection blocks ────────────────────────────────────────

SPRITE_HTML = '''\
<!-- ══ MINTY CHARACTER (fixed, WASD + drag controlled) ══ -->
<div id="minty-wrap" style="position:fixed;z-index:8000;pointer-events:none;top:0;left:0;width:0;height:0;overflow:visible">
  <img id="minty-sprite"
       src="/assets/cv/crocodile-dundee-minty.png"
       alt="Minty"
       style="position:absolute;width:100px;height:100px;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:auto;cursor:grab" />
</div>

<!-- ══ MINTY HUD (hidden, used internally) ══ -->
<div id="minty-hud" style="display:none">
  <span id="minty-pos"></span>
  <span id="ptx-badge"></span>
</div>'''

CSS_BLOCK = '''\
<style>
@keyframes bob {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
@keyframes bob-fast {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}
@keyframes glow-pulse {
  0%,100% { filter: drop-shadow(0 0 6px rgba(46,196,182,0.35)); }
  50% { filter: drop-shadow(0 0 20px rgba(46,196,182,0.6)) drop-shadow(0 0 45px rgba(46,196,182,0.2)); }
}
#minty-sprite {
  animation: bob 2.4s ease-in-out infinite, glow-pulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(46,196,182,0.35));
}
#minty-sprite.moving {
  animation: bob-fast 0.32s ease-in-out infinite !important;
  filter: drop-shadow(0 0 6px rgba(46,196,182,0.35)) !important;
}
.sidebar { overflow: hidden !important; }
</style>'''

# Text-containing elements for pretext reflow (superset across all pages)
TEXT_SELECTOR = ', '.join([
    'p', '.lead', 'td', 'th', 'li',
    '.card-sub', '.card-title',
    '.detail-row .dv', '.prompt-detail', '.prompt-sub',
    '.accord-inner p', '.callout p', '.ingest-desc',
    # Index page
    '.person-role', '.tp-blurb', '.tp-title', '.pf-bio', '.ct-line',
    # CV page
    '.cv-text', '.cv-text-block', '.pub-blurb', '.pub-title',
    # Newsletter page
    '.newsletter-meta', '.archive-sub', '.subscribe-msg',
    # Agent reports
    '.step-label',
    # Shared
    '.subtitle', '.dd-sub', '.hero-sub',
])

# Repellable elements (superset across all pages — unmatched selectors are harmless)
REPEL_SELECTOR = ', '.join([
    # ── Cards & internals ──
    '.card', '.card-head', '.card-body', '.card-icon', '.card-title', '.card-sub',
    # ── Pipeline flow ──
    '.pf-card', '.pf-hub', '.pipeline-tip',
    # ── Prompt grid ──
    '.prompt-item', '.prompt-icon', '.prompt-label', '.prompt-title', '.prompt-sub', '.prompt-detail',
    # ── Q-grid ──
    '.q-cell', '.q-id', '.q-key',
    # ── Ingest pipeline ──
    '.ingest-stage', '.ingest-box', '.ingest-dot', '.ingest-line',
    '.ingest-name', '.ingest-num', '.ingest-desc', '.ingest-info',
    '.ingest-detail-block', '.ingest-detail-title', '.ingest-detail-text',
    # ── Hierarchy ──
    '.h-node', '.h-title', '.h-sub', '.h-connector', '.h-tier',
    # ── Scores & bars ──
    '.score-row', '.score-label', '.score-bar-wrap', '.score-val',
    # ── Tables ──
    'table', 'thead tr', 'tbody tr', 'td', 'th',
    # ── Lists ──
    'li', 'ul.clean',
    # ── Accordions ──
    'details', 'summary', '.accord-inner', '.accordion-inner', '.lab-accordion',
    # ── Text blocks ──
    '.callout', '.detail-row', '.detail-label', '.detail-val',
    # ── Headings ──
    'h1', 'h2', 'h3', 'h4', '.cli-call', '.section-num', '.section-label',
    # ── Badges & tags ──
    '.badge', '.tag', '.tag-daily', '.tag-persistent', '.tag-polling', '.tag-daemon',
    '.health-ok', '.status-pulse',
    # ── Code & CLI ──
    'code', '.line-numbered', '.cli-line',
    # ── Navigation ──
    '.nav-item', '.sidebar-logo', '.sidebar-hint',
    # ── Images & media ──
    "img:not(#minty-sprite)", '.watermark',
    # ── Forms ──
    'form', 'input', 'button',
    # ── Sections & containers ──
    'section', '.hero', '.grid-2',
    # ── Timeline ──
    '.timeline-wrap', '.timeline-hours',
    # ── Links & inline ──
    'a', 'strong', 'em',
    # ── SVG diagrams ──
    'svg:not([data-anim-delayed])',
    # ── iframe / canvas ──
    'iframe', 'canvas',

    # ══ Shared shell (all pages) ══
    '.sidebar', '.sidebar-header', '.sidebar-sub', '.sidebar-title', '.sidebar-toggle',
    '.nav-link', '.nav-mark', '.nav-page', '.nav-pages', '.nav-section', '.nav-sections',
    '.nav-divider', '.sub-link', '.mobile-menu-btn', '.mobile-overlay',
    '.top-banner', '.top-banner-inner', '.top-banner-logo', '.top-banner-minties', '.top-banner-minty',
    '.statusline', '.statusline-bar', '.statusline-minty', '.statusline-pct', '.statusline-progress',
    '.statusline-row', '.statusline-section', '.statusline-site', '.statusline-tokens',
    '.search-box', '.search-overlay', '.search-results', '.search-trigger',
    '.typing-cursor', '.cmd-name', '.cmd-path', '.cmd-prefix', '.cmd-flag',

    # ══ Index page ══
    '.person-card', '.person-disc', '.person-initials', '.person-name', '.person-role',
    '.person-detail', '.person-detail-body', '.person-detail-close', '.person-detail-facts',
    '.person-detail-inner', '.person-detail-photo',
    '.pf-bio', '.pf-label', '.pf-links', '.pf-name', '.pf-row', '.pf-value',
    '.about-grid', '.people-grid', '.project-list',
    '.contact-terminal', '.contact-scene', '.contact-squid',
    '.ct-body', '.ct-cursor', '.ct-dot', '.ct-field', '.ct-input-label', '.ct-input-row',
    '.ct-line', '.ct-submit', '.ct-submit-row', '.ct-title', '.ct-titlebar',
    '.tp', '.tp-bar', '.tp-blurb', '.tp-body', '.tp-chevron', '.tp-counter',
    '.tp-date', '.tp-entry', '.tp-expand', '.tp-head', '.tp-hint', '.tp-meta',
    '.tp-nav', '.tp-num', '.tp-page', '.tp-row', '.tp-seg', '.tp-source',
    '.tp-status', '.tp-tag', '.tp-title', '.tp-venue',
    '.cmd-arg',

    # ══ CV page ══
    '.cv-cards', '.cv-details', '.cv-entries', '.cv-entry', '.cv-text',
    '.cv-text-block', '.cv-year',
    '.pub-blurb', '.pub-expand', '.pub-item', '.pub-meta', '.pub-row',
    '.pub-scroll', '.pub-source', '.pub-text', '.pub-title', '.pub-venue',
    '.hero-sub',

    # ══ Newsletter page ══
    '.newsletter-card', '.newsletter-link', '.newsletter-meta',
    '.archive-label', '.archive-link', '.archive-sub',
    '.subscribe-form', '.subscribe-msg',
    '.subtitle',

    # ══ Corpus map page ══
    '.map-container', '.map-frame',

    # ══ Data dash page ══
    '.data-dash-page', '.dd-controls', '.dd-ctrl-label', '.dd-ctrl-sep',
    '.dd-hero', '.dd-sub', '.dd-key',
    '.dd-mobile-blocker', '.dd-mobile-minty', '.dd-mobile-sorry',
    '.dd-terminal', '.dd-term-body', '.dd-term-title', '.dd-term-titlebar', '.term-dot',
    '.dd-float-squid', '.dd-floating-minties',

    # ══ Agent reports page ══
    '.pipeline-step', '.report-pipeline-steps', '.step-label', '.step-num',
])


def build_js_module(text_sel: str, repel_sel: str) -> str:
    """Build the complete Minty JS module with the given selectors."""
    return f'''\
<script type="module">
// ════════════════════════════════════════════════════════════════════════════
//  MINTY — WASD + drag, pixel-contour text reflow, element repulsion
//
//  Text flows snugly around Minty's actual silhouette (not a rectangle).
//  Sprite image is scanned at load to build a per-row shape profile.
// ════════════════════════════════════════════════════════════════════════════

const SPRITE_W = 100, SPRITE_H = 100;
const GAP = 18;           // px padding around silhouette for readable text
const MAX_SPEED = 6;
const FRICTION = 0.84;
const DEAD_ZONE = 0.15;
const SCROLL_ZONE = 60;
const SCROLL_SPEED = 8;
const REPEL_RADIUS = 300;
const REPEL_FORCE = 180;

const minty = window.__minty = {{
  x: 0, y: 0, vx: 0, vy: 0, facingLeft: false, moving: false,
}};
minty.x = window.innerWidth - SPRITE_W - 30;
minty.y = window.innerHeight - SPRITE_H - 80;

const keys = Object.create(null);
const sprite = document.getElementById('minty-sprite');
const posLabel = document.getElementById('minty-pos');
const ptxBadge = document.getElementById('ptx-badge');

sprite.style.left = minty.x + 'px';
sprite.style.top = minty.y + 'px';

// ── Input ───────────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {{
  const k = e.key.toLowerCase();
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') {{ keys[k] = true; e.preventDefault(); }}
}}, {{ passive: false }});
window.addEventListener('keyup', e => {{
  const k = e.key.toLowerCase();
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') keys[k] = false;
}});

// ── Drag + flick ────────────────────────────────────────────────────────────
let dragging = false, dragOffX = 0, dragOffY = 0;
const BOUNCE_DAMPING = 0.7;  // energy retained per bounce (pong-style)
const FLICK_SCALE = 1.8;     // amplify flick velocity for satisfying feel
let lastTouchX = 0, lastTouchY = 0, lastTouchT = 0;

sprite.addEventListener('mousedown', e => {{
  dragging = true; dragOffX = e.clientX - minty.x; dragOffY = e.clientY - minty.y;
  sprite.style.cursor = 'grabbing'; e.preventDefault();
}});
window.addEventListener('mousemove', e => {{
  if (!dragging) return;
  minty.x = e.clientX - dragOffX; minty.y = e.clientY - dragOffY;
  minty.vx = 0; minty.vy = 0;
}});
window.addEventListener('mouseup', () => {{ if (dragging) {{ dragging = false; sprite.style.cursor = 'grab'; }} }});

// Touch: track velocity for flick release
sprite.addEventListener('touchstart', e => {{
  const t = e.touches[0]; dragging = true;
  dragOffX = t.clientX - minty.x; dragOffY = t.clientY - minty.y;
  lastTouchX = t.clientX; lastTouchY = t.clientY; lastTouchT = performance.now();
  minty.vx = 0; minty.vy = 0;
  e.preventDefault();
}}, {{ passive: false }});
window.addEventListener('touchmove', e => {{
  if (!dragging) return;
  const t = e.touches[0];
  const now = performance.now();
  const dt = now - lastTouchT;
  if (dt > 0) {{
    minty.vx = (t.clientX - lastTouchX) / dt * 16;  // normalize to ~60fps
    minty.vy = (t.clientY - lastTouchY) / dt * 16;
  }}
  lastTouchX = t.clientX; lastTouchY = t.clientY; lastTouchT = now;
  minty.x = t.clientX - dragOffX; minty.y = t.clientY - dragOffY;
}}, {{ passive: false }});
window.addEventListener('touchend', () => {{
  if (!dragging) return;
  dragging = false;
  // Apply flick: scale up velocity for satisfying momentum
  minty.vx *= FLICK_SCALE;
  minty.vy *= FLICK_SCALE;
}});

// ── Utility ─────────────────────────────────────────────────────────────────
function escHTML(s) {{ return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }}

// ════════════════════════════════════════════════════════════════════════════
//  SHAPE PROFILE — scan sprite image for pixel-precise silhouette
// ════════════════════════════════════════════════════════════════════════════

// Default rectangular profile (fallback)
let shapeProfile = [];
for (let y = 0; y < SPRITE_H; y++) shapeProfile.push({{ left: 0, right: SPRITE_W }});

function buildShapeProfile() {{
  const img = sprite;
  if (!img.naturalWidth) return;

  const canvas = document.createElement('canvas');
  const w = img.naturalWidth, h = img.naturalHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  let data;
  try {{ data = ctx.getImageData(0, 0, w, h).data; }}
  catch (_) {{ console.warn('[minty] canvas tainted, using rect profile'); return; }}

  const scaleX = SPRITE_W / w;
  const scaleY = SPRITE_H / h;
  const profile = [];

  for (let dispY = 0; dispY < SPRITE_H; dispY++) {{
    const srcY = Math.min(Math.floor(dispY / scaleY), h - 1);
    let left = w, right = -1;

    for (let x = 0; x < w; x++) {{
      const alpha = data[(srcY * w + x) * 4 + 3];
      if (alpha > 30) {{
        if (x < left) left = x;
        if (x > right) right = x;
      }}
    }}

    if (right < left) {{
      profile.push({{ left: SPRITE_W / 2, right: SPRITE_W / 2 }});
    }} else {{
      profile.push({{ left: left * scaleX, right: (right + 1) * scaleX }});
    }}
  }}

  shapeProfile = profile;
  console.log('[minty] shape profile built:', SPRITE_H, 'rows');
}}

if (sprite.complete) buildShapeProfile();
else sprite.addEventListener('load', buildShapeProfile);

// ════════════════════════════════════════════════════════════════════════════
//  PRETEXT
// ════════════════════════════════════════════════════════════════════════════

const blocks = [];
let layoutNextLineFn = null;
let ptxReady = false;
let prevRX = -999, prevRY = -999;
const repelEls = [];

async function loadPretext() {{
  const urls = ['https://esm.sh/@chenglou/pretext', 'https://cdn.jsdelivr.net/npm/@chenglou/pretext/+esm'];
  for (const url of urls) {{
    try {{
      const mod = await import(url);
      if (typeof mod.prepareWithSegments === 'function' && typeof mod.layoutNextLine === 'function') {{
        console.log('[pretext] loaded from', url); return mod;
      }}
    }} catch (e) {{ console.warn('[pretext] CDN failed:', url, e.message); }}
  }}
  return null;
}}

let ptxModule = null;
const mainEl = document.querySelector('main') || document.body;
const preparedEls = new WeakSet();  // track already-prepared elements
const repelledEls = new WeakSet();  // track already-registered repel elements

function prepareTextBlocks(root) {{
  if (!ptxModule) return 0;
  let count = 0;
  for (const el of root.querySelectorAll('{text_sel}')) {{
    if (preparedEls.has(el)) continue;
    const text = el.textContent.trim();
    if (text.length < 20 || el.closest('svg')) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 50) continue;  // skip truly hidden, but allow narrow elements

    const cs = getComputedStyle(el);
    const lh = cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.75 : parseFloat(cs.lineHeight);
    const fontStr = cs.fontWeight + ' ' + cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontFamily;

    try {{
      const prepared = ptxModule.prepareWithSegments(text, fontStr);
      blocks.push({{ el, prepared, lh, orig: el.innerHTML, active: false, lastHTML: '' }});
      preparedEls.add(el);
      count++;
    }} catch (_) {{}}
  }}
  return count;
}}

function collectRepelEls(root) {{
  const repelSel = '{repel_sel}';
  let count = 0;
  for (const el of root.querySelectorAll(repelSel)) {{
    if (repelledEls.has(el) || el.closest('svg')) continue;
    el.style.transition = 'transform 0.12s ease-out';
    repelEls.push(el);
    repelledEls.add(el);
    count++;
  }}
  return count;
}}

async function initPretext() {{
  ptxBadge.textContent = '\\u29D6 pretext\\u2026';
  const ptx = await loadPretext();
  if (!ptx) {{ ptxBadge.textContent = '\\u2717 pretext unavailable'; return; }}

  ptxModule = ptx;
  layoutNextLineFn = ptx.layoutNextLine;
  await document.fonts.ready;

  const t0 = performance.now();

  const textCount = prepareTextBlocks(mainEl);
  collectRepelEls(mainEl);

  // Sidebar nav items (outside main)
  for (const el of document.querySelectorAll('.nav-item, .sidebar-hint, .nav-link, .nav-page, .sidebar-logo')) {{
    if (repelledEls.has(el)) continue;
    el.style.transition = 'transform 0.12s ease-out';
    repelEls.push(el);
    repelledEls.add(el);
  }}

  // SVG pipeline nodes — repel individually with SVG-aware transforms
  for (const svg of document.querySelectorAll('svg')) {{
    const svgRect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!vb || !vb.width) continue;
    const scaleX = vb.width / svgRect.width;
    const scaleY = vb.height / svgRect.height;

    for (const g of svg.querySelectorAll('g.pn, g[transform]')) {{
      const origTransform = g.getAttribute('transform') || '';
      g._origTransform = origTransform;
      g._svgScaleX = scaleX;
      g._svgScaleY = scaleY;
      g._isSvgNode = true;
      repelEls.push(g);
    }}
    for (const el of svg.querySelectorAll('line, circle, rect:not(defs rect), text, image')) {{
      el._isSvgNode = true;
      el._origTransform = el.getAttribute('transform') || '';
      el._svgScaleX = scaleX;
      el._svgScaleY = scaleY;
      repelEls.push(el);
    }}
  }}

  console.log('[pretext] prepared ' + textCount + ' text blocks, ' + repelEls.length + ' repellable in ' + (performance.now() - t0).toFixed(1) + 'ms');
  ptxReady = true;

  // Re-collect when accordion sections expand (handles both <details> and custom .card accordions)
  document.addEventListener('toggle', e => {{
    if (!e.target.open) return;
    const added = prepareTextBlocks(e.target);
    const repelAdded = collectRepelEls(e.target);
    if (added || repelAdded) console.log('[pretext] section expanded: +' + added + ' text, +' + repelAdded + ' repel');
  }}, true);

  // MutationObserver for custom accordions (display:none → display:block on .card-body etc.)
  const observer = new MutationObserver(mutations => {{
    for (const m of mutations) {{
      if (m.type === 'attributes' && m.attributeName === 'style') {{
        const el = m.target;
        if (el.getBoundingClientRect().width > 0) {{
          const added = prepareTextBlocks(el);
          const repelAdded = collectRepelEls(el);
          if (added || repelAdded) console.log('[pretext] accordion opened: +' + added + ' text, +' + repelAdded + ' repel');
        }}
      }}
    }}
  }});
  for (const body of document.querySelectorAll('.card-body, .accordion-inner, .accord-inner')) {{
    observer.observe(body, {{ attributes: true, attributeFilter: ['style'] }});
  }}
}}

// ── Contour-aware split-line reflow ─────────────────────────────────────────
function getExclusionAtY(lineY, lineLH) {{
  const midY = lineY + lineLH / 2;
  const spriteRow = Math.floor(midY - minty.y);
  if (spriteRow < 0 || spriteRow >= SPRITE_H) return null;

  const profile = shapeProfile[spriteRow];
  if (!profile) return null;

  let left, right;
  if (minty.facingLeft) {{
    left = SPRITE_W - profile.right;
    right = SPRITE_W - profile.left;
  }} else {{
    left = profile.left;
    right = profile.right;
  }}

  return {{
    left: minty.x + left - GAP,
    right: minty.x + right + GAP,
  }};
}}

function reflowBlock(block, blockRect) {{
  const lnl = layoutNextLineFn;
  const {{ el, prepared, lh }} = block;
  const cw = blockRect.width;
  if (cw < 100) return;

  const mT = minty.y, mB = minty.y + SPRITE_H;

  let cursor = {{ segmentIndex: 0, graphemeIndex: 0 }};
  const lines = [];
  let y = 0;

  for (let safety = 0; safety < 500; safety++) {{
    const lt = blockRect.top + y;
    const lb = lt + lh;
    const vertOverlap = lb > mT && lt < mB;

    if (!vertOverlap) {{
      let line;
      try {{ line = lnl(prepared, cursor, cw); }} catch (_) {{ break; }}
      if (!line) break;
      lines.push('<span style="display:block">' + escHTML(line.text) + '</span>');
      cursor = line.end;
    }} else {{
      const excl = getExclusionAtY(lt, lh);

      if (!excl || excl.right <= blockRect.left || excl.left >= blockRect.right) {{
        let line;
        try {{ line = lnl(prepared, cursor, cw); }} catch (_) {{ break; }}
        if (!line) break;
        lines.push('<span style="display:block">' + escHTML(line.text) + '</span>');
        cursor = line.end;
      }} else {{
        const leftEdge = excl.left - blockRect.left;
        const rightEdge = excl.right - blockRect.left;

        const leftW = Math.max(0, leftEdge);
        const rightW = Math.max(0, cw - rightEdge);

        let leftHTML = '';
        let rightHTML = '';

        if (leftW >= 30) {{
          let line;
          try {{ line = lnl(prepared, cursor, leftW); }} catch (_) {{ break; }}
          if (!line) break;
          leftHTML = escHTML(line.text);
          cursor = line.end;
        }}

        if (rightW >= 30) {{
          let line;
          try {{ line = lnl(prepared, cursor, rightW); }} catch (_) {{ break; }}
          if (line) {{
            rightHTML = escHTML(line.text);
            cursor = line.end;
          }}
        }}

        if (!leftHTML && !rightHTML) {{
          let line;
          try {{ line = lnl(prepared, cursor, cw); }} catch (_) {{ break; }}
          if (!line) break;
          lines.push('<span style="display:block">' + escHTML(line.text) + '</span>');
          cursor = line.end;
        }} else {{
          let html = '<span style="display:block;position:relative;height:' + lh + 'px">';
          if (leftHTML) {{
            html += '<span style="position:absolute;left:0;top:0">' + leftHTML + '</span>';
          }}
          if (rightHTML) {{
            html += '<span style="position:absolute;left:' + rightEdge + 'px;top:0">' + rightHTML + '</span>';
          }}
          html += '</span>';
          lines.push(html);
        }}
      }}
    }}
    y += lh;
  }}

  const html = lines.join('');
  if (html !== block.lastHTML) {{
    el.innerHTML = html;
    block.lastHTML = html;
  }}
}}

// ── Element repulsion ───────────────────────────────────────────────────────
function repelElements() {{
  const mcx = minty.x + SPRITE_W / 2, mcy = minty.y + SPRITE_H / 2;
  for (const el of repelEls) {{
    const rect = el.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - mcx;
    const dy = rect.top + rect.height / 2 - mcy;
    const dist = Math.hypot(dx, dy);

    if (dist < REPEL_RADIUS && dist > 1) {{
      const f = Math.pow(1 - dist / REPEL_RADIUS, 2) * REPEL_FORCE;
      const tx = dx / dist * f;
      const ty = dy / dist * f;

      if (el._isSvgNode) {{
        const sx = el._svgScaleX || 1, sy = el._svgScaleY || 1;
        const orig = el._origTransform || '';
        el.setAttribute('transform', orig + ' translate(' + (tx * sx).toFixed(1) + ',' + (ty * sy).toFixed(1) + ')');
      }} else {{
        el.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
      }}
    }} else {{
      if (el._isSvgNode) {{
        const orig = el._origTransform || '';
        if (el.getAttribute('transform') !== orig) el.setAttribute('transform', orig);
      }} else if (el.style.transform) {{
        el.style.transform = '';
      }}
    }}
  }}
}}

// ── Main reflow ─────────────────────────────────────────────────────────────
function reflowAll() {{
  if (!ptxReady) return;
  const mT = minty.y, mB = minty.y + SPRITE_H;
  const rects = blocks.map(b => b.el.getBoundingClientRect());

  for (let i = 0; i < blocks.length; i++) {{
    const block = blocks[i], rect = rects[i];
    const overlaps = rect.bottom > mT - 5 && rect.top < mB + 5
                  && minty.x + SPRITE_W > rect.left && minty.x < rect.right;
    if (!overlaps) {{
      if (block.active) {{ block.el.innerHTML = block.orig; block.active = false; block.lastHTML = ''; }}
      continue;
    }}
    block.active = true;
    try {{ reflowBlock(block, rect); }} catch (_) {{}}
  }}
  repelElements();
}}
window.__reflowAll = reflowAll;

// ── Game loop ───────────────────────────────────────────────────────────────
let lastTs = performance.now();
function loop(ts) {{
  try {{
    const dt = Math.min((ts - lastTs) / 16.667, 3.0); lastTs = ts;

    if (!dragging) {{
      if (keys['a']) minty.vx -= MAX_SPEED * dt * 0.35;
      if (keys['d']) minty.vx += MAX_SPEED * dt * 0.35;
      if (keys['w']) minty.vy -= MAX_SPEED * dt * 0.35;
      if (keys['s']) minty.vy += MAX_SPEED * dt * 0.35;
      const spd = Math.hypot(minty.vx, minty.vy);
      if (spd > MAX_SPEED) {{ minty.vx = minty.vx / spd * MAX_SPEED; minty.vy = minty.vy / spd * MAX_SPEED; }}
      minty.vx *= FRICTION; minty.vy *= FRICTION;
      if (Math.abs(minty.vx) < DEAD_ZONE) minty.vx = 0;
      if (Math.abs(minty.vy) < DEAD_ZONE) minty.vy = 0;
      minty.x += minty.vx; minty.y += minty.vy;
    }}

    const maxX = window.innerWidth - SPRITE_W;
    const maxY = window.innerHeight - SPRITE_H - 20;
    // Pong-style edge bouncing
    if (minty.x < 0) {{ minty.x = 0; minty.vx = Math.abs(minty.vx) * BOUNCE_DAMPING; }}
    else if (minty.x > maxX) {{ minty.x = maxX; minty.vx = -Math.abs(minty.vx) * BOUNCE_DAMPING; }}
    if (minty.y < 0) {{ minty.y = 0; minty.vy = Math.abs(minty.vy) * BOUNCE_DAMPING; }}
    else if (minty.y > maxY) {{ minty.y = maxY; minty.vy = -Math.abs(minty.vy) * BOUNCE_DAMPING; }}

    const isMoving = Math.abs(minty.vx) > 0.5 || Math.abs(minty.vy) > 0.5 || dragging;
    if (isMoving) {{
      if (minty.y < SCROLL_ZONE && window.scrollY > 0)
        window.scrollBy(0, -SCROLL_SPEED * (1 - minty.y / SCROLL_ZONE));
      if (minty.y > maxY - SCROLL_ZONE)
        window.scrollBy(0, SCROLL_SPEED * (1 - Math.max(0, maxY - minty.y) / SCROLL_ZONE));
    }}

    if (minty.vx < -0.2) minty.facingLeft = true;
    else if (minty.vx > 0.2) minty.facingLeft = false;
    minty.moving = Math.hypot(minty.vx, minty.vy) > 0.2;

    sprite.style.left = minty.x + 'px';
    sprite.style.top = minty.y + 'px';
    sprite.style.transform = minty.facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    if (!dragging) sprite.className = minty.moving ? 'moving' : '';

    const rx = Math.round(minty.x), ry = Math.round(minty.y);
    if (rx !== prevRX || ry !== prevRY) {{ reflowAll(); prevRX = rx; prevRY = ry; }}
    posLabel.textContent = 'Minty: (' + rx + ', ' + ry + ')';
  }} catch (err) {{ console.error('[minty] loop error:', err); }}
  requestAnimationFrame(loop);
}}
requestAnimationFrame(loop);

initPretext().catch(err => {{
  console.error('[pretext] init error:', err);
  ptxBadge.textContent = '\\u2717 pretext error';
}});

</script>'''


import re as _re

def strip_minty(html: str) -> str:
    """Remove existing Minty injection blocks from HTML."""
    # Remove everything from the Minty comment to the closing </script> before </body>
    html = _re.sub(
        r'\n*<!-- ══ MINTY CHARACTER.*?</script>\s*',
        '',
        html,
        flags=_re.DOTALL,
    )
    return html


def inject(src_path: str, dst_path: str) -> None:
    """Read src HTML, inject Minty blocks before </body>, write to dst."""
    src = Path(src_path)
    dst = Path(dst_path)

    html = src.read_text(encoding='utf-8')

    # Strip any existing Minty injection (idempotent re-injection)
    html = strip_minty(html)

    # Build the injection payload
    js_block = build_js_module(TEXT_SELECTOR, REPEL_SELECTOR)
    payload = f'\n{SPRITE_HTML}\n\n{CSS_BLOCK}\n\n{js_block}\n\n'

    # Inject before </body>
    if '</body>' in html:
        html = html.replace('</body>', payload + '</body>')
    elif '</BODY>' in html:
        html = html.replace('</BODY>', payload + '</BODY>')
    else:
        html += payload

    # Ensure output directory exists
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(html, encoding='utf-8')
    print(f'  {src} -> {dst} ({len(html):,} bytes)')


def main():
    if len(sys.argv) == 3:
        inject(sys.argv[1], sys.argv[2])
    elif len(sys.argv) == 1:
        # Process all pages
        pages = [
            ('dist/index.html', 'public/index.html'),
            ('dist/cv/index.html', 'public/cv/index.html'),
            ('dist/newsletter/index.html', 'public/newsletter/index.html'),
            ('dist/corpus-map/index.html', 'public/corpus-map/index.html'),
            ('dist/data-dash/index.html', 'public/data-dash/index.html'),
            ('dist/agent-reports/index.html', 'public/agent-reports/index.html'),
        ]
        print(f'Injecting Minty overlay into {len(pages)} pages...')
        for src, dst in pages:
            src_full = REPO / src
            dst_full = REPO / dst
            if not src_full.exists():
                print(f'  SKIP {src} (not found)')
                continue
            inject(str(src_full), str(dst_full))
        print('Done.')
    else:
        print(f'Usage: {sys.argv[0]} [src_html dst_html]')
        print('  With no args: processes all pages')
        sys.exit(1)


if __name__ == '__main__':
    main()
