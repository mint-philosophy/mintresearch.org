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
</div>

<!-- ══ MINTY CHAT BUBBLE ══ -->
<div id="minty-chat" style="display:none">
  <div id="minty-chat-header">
    <span id="minty-chat-title">Minty</span>
    <span id="minty-chat-counter"></span>
    <button id="minty-chat-close" aria-label="Close chat">&times;</button>
  </div>
  <div id="minty-chat-messages"></div>
  <div id="minty-chat-input-wrap">
    <input id="minty-chat-input" type="text" placeholder="Ask about the MINT Lab..." autocomplete="off" maxlength="1000" />
    <button id="minty-chat-send" aria-label="Send">&#x27A4;</button>
  </div>
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

/* ── Minty Chat Bubble ── */
#minty-chat {
  position: fixed;
  z-index: 8001;
  width: 360px;
  max-width: calc(100vw - 24px);
  max-height: 480px;
  background: #1a1f2e;
  border: 1px solid rgba(46,196,182,0.3);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 12px rgba(46,196,182,0.15);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
  pointer-events: auto;
}
#minty-chat-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(46,196,182,0.08);
  border-bottom: 1px solid rgba(46,196,182,0.15);
  gap: 8px;
}
#minty-chat-title {
  font-weight: 600;
  font-size: 14px;
  color: #2ec4b6;
  flex: 1;
}
#minty-chat-counter {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}
#minty-chat-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
#minty-chat-close:hover { color: #fff; }
#minty-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;
  max-height: 320px;
}
.minty-msg {
  max-width: 88%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.45;
  word-wrap: break-word;
}
.minty-msg.bot {
  background: rgba(46,196,182,0.12);
  color: #e0e0e0;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.minty-msg.user {
  background: rgba(255,255,255,0.08);
  color: #e0e0e0;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.minty-msg.bot.thinking::after {
  content: '';
  display: inline-block;
  width: 4px; height: 4px;
  background: #2ec4b6;
  border-radius: 50%;
  margin-left: 4px;
  animation: minty-blink 1s infinite;
}
@keyframes minty-blink {
  0%,100% { opacity: 0.2; }
  50% { opacity: 1; }
}
#minty-chat-input-wrap {
  display: flex;
  padding: 10px 12px;
  gap: 8px;
  border-top: 1px solid rgba(46,196,182,0.15);
  background: rgba(0,0,0,0.15);
}
#minty-chat-input {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e0e0e0;
  font-size: 13px;
  outline: none;
}
#minty-chat-input:focus { border-color: rgba(46,196,182,0.4); }
#minty-chat-input::placeholder { color: rgba(255,255,255,0.25); }
#minty-chat-send {
  background: rgba(46,196,182,0.2);
  border: 1px solid rgba(46,196,182,0.3);
  border-radius: 8px;
  color: #2ec4b6;
  font-size: 16px;
  cursor: pointer;
  padding: 6px 12px;
  transition: background 0.15s;
}
#minty-chat-send:hover { background: rgba(46,196,182,0.35); }
#minty-chat-send:disabled { opacity: 0.3; cursor: default; }
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


# ── Chat Worker URL (set before deploying) ────────────────────────────────────
CHAT_WORKER_URL = 'https://minty-chatbot.mintresearch.workers.dev'

CHAT_JS = '''\
<script type="module">
// ════════════════════════════════════════════════════════════════════════════
//  MINTY CHAT — Double-click/tap to chat with the MINT Lab's AI philosopher
// ════════════════════════════════════════════════════════════════════════════

const WORKER_URL = '__WORKER_URL__';
const MAX_MESSAGES = 15;
const COOLDOWN_MS = 3000;

const GREETINGS = [
  "That's not a risk assessment... this is a risk assessment. G'day!",
  "Pull up a log. I study AI governance at Johns Hopkins. What's on your mind?",
  "G'day! Seven billion people all wanting to build superintelligence. Must be the friendliest planet on earth.",
  "G'day mate. Got questions about the lab? Fire away.",
  "You know, if you've got a problem, you tell the town. Reckon that's half of what AI governance is. Ask me anything.",
  "G'day! Fair dinkum — the alignment problem's trickier than it looks. What do you want to know?",
  "Me and the AI safety crowd, we'd be mates. Got questions?",
  "Come and say g'day. I'll tell you about our research.",
  "Crikey, another visitor. Pull up a chair — what do you want to know about the MINT Lab?",
  "G'day mate. I study what happens when the machines get smarter than us. Ask away.",
  "G'day! Heard some people reckon AI governance is a hard problem. Should be alright — I'm from Australia.",
  "No worries — except about superintelligence. Got questions about the lab?",
  "G'day! I reckon normative competence is the most interesting question in AI safety right now. Want to hear why?",
  "Been thinking about whether advanced AI counts as an apex predator. Anyway — what's on your mind?",
  "G'day. The MINT Lab works on whether humanity can actually govern machines smarter than us. What do you want to know?",
  "Pull up a log, mate. I've been wrestling with the alignment problem all arvo. What can I help with?",
  "G'day! You know, the soul document is a bit like a letter from a parent to their kid. Fascinating stuff. Ask me about it.",
  "Imagine seven million people all wanting to live together — that's what AI governance feels like some days. G'day!",
  "G'day! The real danger isn't the machines going rogue — it's us not governing them well enough. Want to know more?",
  "G'day mate. Between you and me, I reckon the social contract needs a bit of a rewrite. What's on your mind?",
];

const chat = document.getElementById('minty-chat');
const msgBox = document.getElementById('minty-chat-messages');
const inputEl = document.getElementById('minty-chat-input');
const sendBtn = document.getElementById('minty-chat-send');
const closeBtn = document.getElementById('minty-chat-close');
const counterEl = document.getElementById('minty-chat-counter');
const sprite = document.getElementById('minty-sprite');
const minty = window.__minty;

let chatOpen = false;
let responseId = sessionStorage.getItem('minty-responseId') || null;
let msgCount = parseInt(sessionStorage.getItem('minty-msgCount') || '0', 10);
let lastSendTime = 0;
let sending = false;
let usedGreetings = JSON.parse(sessionStorage.getItem('minty-usedGreetings') || '[]');

function updateCounter() {
  const remaining = MAX_MESSAGES - msgCount;
  counterEl.textContent = remaining > 0 ? remaining + ' left' : 'limit reached';
  if (remaining <= 0) {
    inputEl.disabled = true;
    sendBtn.disabled = true;
    inputEl.placeholder = 'Chat limit reached for this session';
  }
}

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'minty-msg ' + role;
  div.textContent = text;
  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
  return div;
}

function pickGreeting() {
  const available = GREETINGS.filter((_, i) => !usedGreetings.includes(i));
  const pool = available.length > 0 ? available : GREETINGS;
  const idx = GREETINGS.indexOf(pool[Math.floor(Math.random() * pool.length)]);
  usedGreetings.push(idx);
  if (usedGreetings.length > GREETINGS.length - 3) usedGreetings = [];
  sessionStorage.setItem('minty-usedGreetings', JSON.stringify(usedGreetings));
  return GREETINGS[idx];
}

function positionChat() {
  const sx = minty.x, sy = minty.y;
  const cw = chat.offsetWidth || 360;
  const ch = chat.offsetHeight || 400;
  let left = sx + 110;
  let top = sy - 20;
  if (left + cw > window.innerWidth - 12) left = sx - cw - 10;
  if (top + ch > window.innerHeight - 12) top = window.innerHeight - ch - 12;
  if (top < 12) top = 12;
  if (left < 12) left = 12;
  chat.style.left = left + 'px';
  chat.style.top = top + 'px';
}

function openChat() {
  if (chatOpen) return;
  chatOpen = true;
  chat.style.display = 'flex';
  positionChat();
  updateCounter();
  if (msgBox.children.length === 0) {
    addMessage(pickGreeting(), 'bot');
  }
  inputEl.focus();
}

function closeChat() {
  chatOpen = false;
  chat.style.display = 'none';
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || sending || msgCount >= MAX_MESSAGES) return;
  const now = Date.now();
  if (now - lastSendTime < COOLDOWN_MS) return;
  lastSendTime = now;

  inputEl.value = '';
  addMessage(text, 'user');
  msgCount++;
  sessionStorage.setItem('minty-msgCount', String(msgCount));
  updateCounter();

  sending = true;
  sendBtn.disabled = true;
  const thinkDiv = addMessage('', 'bot thinking');

  try {
    const res = await fetch(WORKER_URL + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, responseId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      thinkDiv.classList.remove('thinking');
      thinkDiv.textContent = err.error === 'Rate limit exceeded'
        ? "Crikey, too many questions at once. Give it a minute, mate."
        : "Sorry mate, something went wrong on my end. Try again in a tick.";
      return;
    }

    // Read OpenAI Responses API SSE stream (raw passthrough from worker)
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let fullText = '';
    thinkDiv.classList.remove('thinking');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          // Capture response ID for multi-turn conversation
          if (evt.type === 'response.created' && evt.response?.id) {
            responseId = evt.response.id;
            sessionStorage.setItem('minty-responseId', responseId);
          }
          // Extract text deltas
          if (evt.type === 'response.output_text.delta' && evt.delta) {
            fullText += evt.delta;
            thinkDiv.textContent = fullText;
            msgBox.scrollTop = msgBox.scrollHeight;
          }
        } catch (_) {}
      }
    }
    if (!fullText) thinkDiv.textContent = "Hmm, I've gone a bit quiet. Try asking again, mate.";
  } catch (e) {
    thinkDiv.classList.remove('thinking');
    thinkDiv.textContent = "No worries — looks like I can't reach my thinking cap right now. Try again later.";
  } finally {
    sending = false;
    sendBtn.disabled = msgCount >= MAX_MESSAGES;
  }
}

// ── Double-click / double-tap to open ──────────────────────────────────────
let lastTapTime = 0;
let dragDistance = 0;
let tapStartX = 0, tapStartY = 0;

sprite.addEventListener('mousedown', e => {
  tapStartX = e.clientX; tapStartY = e.clientY; dragDistance = 0;
});
window.addEventListener('mousemove', e => {
  dragDistance += Math.abs(e.movementX) + Math.abs(e.movementY);
});
sprite.addEventListener('dblclick', e => {
  if (dragDistance < 15) { openChat(); e.preventDefault(); }
});

// Double-tap for touch
sprite.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTapTime < 350) {
    openChat();
    e.preventDefault();
    lastTapTime = 0;
  } else {
    lastTapTime = now;
  }
});

closeBtn.addEventListener('click', closeChat);
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  e.stopPropagation();  // Don't trigger WASD
});
inputEl.addEventListener('keyup', e => e.stopPropagation());

// Reposition chat when Minty moves
let chatPosFrame = 0;
(function trackMintyPos() {
  if (chatOpen) positionChat();
  requestAnimationFrame(trackMintyPos);
})();

// Close on Escape
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && chatOpen) closeChat();
});

console.log('[minty-chat] ready, ' + GREETINGS.length + ' greetings loaded');
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
    chat_js = CHAT_JS.replace('__WORKER_URL__', CHAT_WORKER_URL)
    payload = f'\n{SPRITE_HTML}\n\n{CSS_BLOCK}\n\n{js_block}\n\n{chat_js}\n\n'

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
