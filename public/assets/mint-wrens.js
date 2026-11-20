/* MINT wrens v1 (20 Nov 2026). Carolina wrens live on the site's pages, as they do on the agents page.
   Left alone they shuffle about the page: they turn round, hop to a nearby perch on the top edge of a
   heading, picture, card or button, and now and then two fly together and nuzzle, or one flies off into
   the distance and later flies back in from the side. When you scroll they follow you down the page.
   Clicked (or Enter/Space when focused), a wren may fly to another perch or off into the distance, or
   it puffs up a little more with each click; keep going and it sends up hearts and looks at you with
   big eyes. Typing "ash" tames them all (and again sets them free). Very rarely a puffed wren lays an
   egg, which hatches a chick that walks towards you.
   With Reduce Motion nothing travels across the screen: a wren fades out and fades in at its new
   perch, puffs up without bounce, and hearts appear and fade in place. On touch screens the wrens are
   only to look at. Nothing here runs until the page has loaded and the browser is idle, and the
   pictures (about 300 KB in all, mostly fetched only when needed) come from /assets/wrens/.
   Loaded by mint-banner.js. To remove the wrens, delete this file's loader there. */
(function () {
  'use strict';
  if (window.MintWrens) return;
  window.MintWrens = { version: '1.0.0' };
  if (/[?&]nowrens\b/.test(location.search)) return;

  var NS = 'http://www.w3.org/2000/svg';
  var script = document.currentScript;
  var ROOT = new URL('wrens/', (script && script.src) || (location.origin + '/assets/mint-wrens.js')).href;
  var SIZE = 46;          /* a perched wren's height in pixels */
  var FLY_AREA = 2500;    /* a flying wren's drawn area, so tall and wide frames read the same size */
  var BEAT = 62;          /* ms per wingbeat frame */
  var PUFF_CAP = 14, DOTE_AT = 6, CHICK_CAP = 10, CHICK_DOTE = 5;
  var EGG_CHANCE = 0.025; /* per puffing click; add ?egg to the address to see it every time */
  var HEART = 'M0 4C-7-2-11-7-6-11C-3-13 0-11 0-8C0-11 3-13 6-11C11-7 7-2 0 4Z';
  var STILL = /[?&]still\b/.test(location.search);

  /* the drawings: ten perched wrens, and the extra poses every wren can take */
  var WRENS = [
    ['wren-flapping', 1.185], ['wren-fluffed', 1.019], ['wren-hopping', 1.185], ['wren-looking-up', 0.7],
    ['wren-peering', 0.906], ['wren-preening', 0.9], ['wren-side', 1.143], ['wren-singing', 0.969],
    ['wren-tiny-hat', 0.8], ['wren-worm', 1.185]
  ];
  var EXTRA = {
    'chick-preening': 0.839, 'chick-puffed': 0.964, 'chick-walking': 0.903, doting: 0.967, eating: 1.111,
    'egg-hatching': 0.719, egg: 0.762, 'fly-belly-down': 1.455, 'fly-belly-mid': 1.818, 'fly-belly-up': 1.088,
    'fly-side-down': 1.616, 'fly-side-mid': 2.105, 'fly-side-up': 1.103, puffed: 1.067
  };
  function sprite(n, r) { return { n: n, r: r, src: ROOT + n + '.webp' }; }
  var fx = {};
  Object.keys(EXTRA).forEach(function (n) { fx[n] = sprite(n, EXTRA[n]); });
  fx.eating.tip = [0.999, 0.354];

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  if (mq) { var onMq = function (e) { reduced = e.matches; }; if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq); }

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffled(list) { return list.slice().sort(function () { return Math.random() - 0.5; }); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function spring(t) { return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-5 * t); }
  function hyp(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function puffSize(p) { return 0.92 + 0.13 * p; }
  function load(sp) {
    return new Promise(function (ok) {
      var im = new Image(); im.onload = function () { ok(true); }; im.onerror = function () { ok(false); }; im.src = sp.src;
    });
  }

  var CSS = [
    '.mint-wrens{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none;z-index:80}',
    '.mint-wrens .wren{pointer-events:auto;cursor:pointer;outline:none}',
    '.mint-wrens .wren-hit{fill:transparent;stroke:none}',
    '.mint-wrens .wren:focus-visible .wren-hit{stroke:var(--text-1,#333);stroke-width:2.5;stroke-dasharray:1 6;stroke-linecap:round}',
    '.wren-heart{fill:#f27c95;stroke:#3a2a2a;stroke-width:1.4;stroke-linejoin:round;pointer-events:none}',
    '.wren-worm{fill:none;stroke:#e7849a;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 .6px #3a2a2a);pointer-events:none}',
    '.wren-toast{position:fixed;top:calc(var(--banner-h,0px) + 14px);left:50%;transform:translateX(-50%);z-index:85;font:600 14px/1.3 "JetBrains Mono",ui-monospace,monospace;background:var(--bg-0,#f5f1e6);color:var(--text-1,#222);border:1px solid var(--border,#bbb);border-radius:999px;padding:8px 16px;white-space:nowrap;pointer-events:none;transition:opacity .8s}',
    '.wren-toast.gone{opacity:0}',
    '.wren-chick{position:fixed;z-index:85;padding:0;margin:0;border:0;background:none;cursor:pointer;transform-origin:50% 100%}',
    '.wren-chick img{display:block;width:100%;height:100%;pointer-events:none}',
    '.wren-chick-heart{position:fixed;z-index:86;pointer-events:none;overflow:visible}',
    '@media (hover:none){.mint-wrens .wren,.wren-chick{pointer-events:none}}',
    '@media print{.mint-wrens,.wren-toast,.wren-chick,.wren-chick-heart{display:none!important}}'
  ].join('\n');

  /* ---- perches: the top edges of headings, pictures, cards and buttons in the page's flow ---------- */
  var PERCH_SEL = 'h1,h2,h3,h4,p,ul,ol,img,picture,button,summary,details,table,pre,blockquote,figure,form,hr,iframe,video,canvas,section,article,' +
    '[class*="card"],[class*="project"],[class*="tile"],[class*="panel"],[class*="box"]';
  var SKIP_SEL = '.mint-wrens,.wren-chick,.sidebar,.mobile-overlay,.statusline,#minty-wrap,#minty-chat,#minty-hud,[aria-hidden="true"],[hidden]';
  function pinned(el) {
    for (var e = el; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.position === 'fixed' || cs.position === 'sticky') return true;
      if (cs.display === 'none' || cs.visibility === 'hidden') return true;
      if (e !== el && /(auto|scroll|hidden)/.test(cs.overflowY + cs.overflowX) && (e.scrollHeight > e.clientHeight + 4 || e.scrollWidth > e.clientWidth + 4)) return true;
    }
    return false;
  }
  function textSpan(el, r) {
    if (!/^H[1-3]$/.test(el.tagName)) return r;
    try {
      var range = document.createRange(); range.selectNodeContents(el);
      var t = range.getBoundingClientRect();
      if (t.width > 20) return { left: t.left, right: t.right, top: Math.min(r.top, t.top), width: t.width };
    } catch (e) { /* fall back to the box */ }
    return r;
  }

  function Flock(count) {
    var self = this;
    this.svg = document.createElementNS(NS, 'svg');
    this.svg.setAttribute('class', 'mint-wrens');
    this.svg.setAttribute('aria-label', 'Wrens');
    this.svg.setAttribute('role', 'group');
    this.layer = document.createElementNS(NS, 'g');
    this.svg.appendChild(this.layer);
    document.body.appendChild(this.svg);
    function frames(kind) { return ['up', 'mid', 'down', 'mid'].map(function (k) { return fx['fly-' + kind + '-' + k]; }); }
    this.wings = { side: frames('side'), belly: frames('belly') };
    this.puffed = fx.puffed; this.doting = fx.doting;
    this.timers = {};
    this.findPerches();
    var start = this.perches.filter(function (p) { return self.seen(p); });
    if (start.length < count) start = start.concat(shuffled(this.perches.filter(function (p) { return start.indexOf(p) < 0; })));
    start = shuffled(start.slice(0, Math.max(count * 3, 8))).slice(0, count);
    var kinds = shuffled(WRENS);
    this.birds = start.map(function (p, i) {
      var k = kinds[i % kinds.length], b = self.make(sprite(k[0], k[1]), Math.random() < 0.5 ? -1 : 1, i);
      self.settle(b, p); b.x = p.x; b.y = p.y; self.place(b);
      if (k[0] === 'wren-worm') self.giveWorm(b);
      return b;
    });
    this.schedule('shuffle'); this.schedule('event');
    /* the page moves under them: keep perched wrens on their perches as the layout shifts */
    var t = 0, relayout = function () { clearTimeout(t); t = setTimeout(function () { self.relayout(); }, 250); };
    window.addEventListener('resize', relayout);
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(document.body);
    /* and follow the reader down the page */
    var s = 0;
    window.addEventListener('scroll', function () { clearTimeout(s); s = setTimeout(function () { self.follow(); }, 450); }, { passive: true });
  }

  Flock.prototype.origin = function () { var r = this.svg.getBoundingClientRect(); return { x: r.left, y: r.top }; };
  /* the boxes a perched wren must not stand in front of: anything with words or pictures in it */
  var BLOCK_SEL = 'h1,h2,h3,h4,h5,h6,p,li,a,span,label,td,th,dt,dd,code,input,textarea,select,svg,img,video,button,summary,pre,blockquote,figure,canvas,iframe,[class*="card"],[class*="tile"]';
  function blockers(o) {
    var out = [], els = document.querySelectorAll(BLOCK_SEL), vw = document.documentElement.clientWidth;
    for (var i = 0; i < els.length && out.length < 4000; i++) {
      var el = els[i];
      if (el.closest(SKIP_SEL)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > vw) continue;
      if (el.tagName === 'IMG' && +getComputedStyle(el).opacity < 0.3) continue;   /* faint watermarks */
      out.push({ el: el, l: r.left - o.x, r: r.right - o.x, t: r.top - o.y, b: r.bottom - o.y });
    }
    return out;
  }
  function clear(x, y, el, boxes) {
    for (var i = 0; i < boxes.length; i++) {
      var q = boxes[i];
      if (q.b <= y - SIZE + 8 || q.t >= y - 3 || q.r <= x - 15 || q.l >= x + 15) continue;
      if (q.el === el || q.el.contains(el) || el.contains(q.el)) continue;
      return false;
    }
    return true;
  }
  Flock.prototype.findPerches = function () {
    var o = this.origin(), list = [], vw = document.documentElement.clientWidth, boxes = blockers(o);
    var els = document.querySelectorAll(PERCH_SEL), n = 0;
    for (var i = 0; i < els.length && n < 600; i++) {
      var el = els[i];
      if (el.closest(SKIP_SEL)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 48 || r.height < 10 || r.right < 0 || r.left > vw) continue;
      n++;
      if (pinned(el)) continue;
      var s = textSpan(el, r), lo = Math.max(s.left + 18, 8), hi = Math.min(s.right - 18, vw - 8);
      if (hi <= lo) continue;
      var spots = s.width > 420 ? 3 : s.width > 200 ? 2 : 1;
      for (var j = 0; j < spots; j++) {
        var f = (j + rnd(0.2, 0.8)) / spots, x = lo + (hi - lo) * f;
        if (!clear(x - o.x, s.top - o.y, el, boxes)) continue;
        list.push({ el: el, fx: (x - r.left) / Math.max(1, r.width), x: x - o.x, y: s.top - o.y, bird: null });
      }
    }
    /* not too close together */
    list.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    var kept = (this.perches || []).filter(function (p) { return p.bird && !p.gone; });
    list.forEach(function (p) { if (!kept.some(function (q) { return Math.abs(q.y - p.y) < 30 && Math.abs(q.x - p.x) < 44; })) kept.push(p); });
    this.perches = kept;
  };
  /* re-measure every perch; a perch whose element has gone keeps no bird */
  Flock.prototype.relayout = function () {
    var self = this, o = this.origin();
    this.perches.forEach(function (p) {
      if (!p.el.isConnected) { p.gone = true; return; }
      var r = p.el.getBoundingClientRect(), s = textSpan(p.el, r);
      if (r.width < 1) { p.gone = true; return; }
      p.gone = false; p.x = r.left + p.fx * r.width - o.x; p.y = s.top - o.y;
    });
    this.findPerches();
    this.birds.forEach(function (b) {
      if (b.busy || b.flyingNow || b.away) return;
      if (b.perch && !b.perch.gone) { b.x = b.perch.x; b.y = b.perch.y; self.place(b); return; }
      var p = self.freePerch(b); if (!p) return;
      self.settle(b, p); b.x = p.x; b.y = p.y; self.place(b);
    });
  };

  Flock.prototype.make = function (own, face, i) {
    var self = this, g = document.createElementNS(NS, 'g'), pose = document.createElementNS(NS, 'g'), hit = document.createElementNS(NS, 'circle'), im = document.createElementNS(NS, 'image');
    var b = { g: g, pose: pose, im: im, own: own, face: face, x: 0, y: 0, scale: 1, tilt: 0, sy: 1, lean: 0, lift: 0, busy: false, away: false,
      i: i, puffy: [0.7, 0.2, 0.45, 0.15, 0.6, 0.3, 0.75, 0.25, 0.5, 0.35][i % 10], belly: [0.7, 0.3, 0.5, 0.8, 0.2, 0.6, 0.4, 0.75, 0.3, 0.55][i % 10], puff: 0, dote: false, cur: null };
    g.setAttribute('class', 'wren');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', 'A Carolina wren. Press it and see what it does.');
    hit.setAttribute('class', 'wren-hit'); hit.setAttribute('r', '24'); hit.setAttribute('cy', '-22');
    pose.appendChild(im); g.appendChild(hit); g.appendChild(pose);
    this.layer.appendChild(g);
    this.perched(b, own);
    g.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); self.poke(b); });
    g.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); e.stopPropagation(); self.poke(b);
    });
    /* a focused wren stays where the keyboard can find it */
    g.addEventListener('focus', function () { b.focused = true; });
    g.addEventListener('blur', function () { b.focused = false; });
    return b;
  };
  Flock.prototype.perched = function (b, sp) {
    if (b.cur === sp) return; b.cur = sp;
    var w = SIZE * sp.r;
    b.im.setAttribute('href', sp.src);
    b.im.setAttribute('x', (-w / 2).toFixed(1)); b.im.setAttribute('y', (-SIZE + 2).toFixed(1));
    b.im.setAttribute('width', w.toFixed(1)); b.im.setAttribute('height', SIZE);
  };
  Flock.prototype.flying = function (b, sp) {
    if (b.cur === sp) return; b.cur = sp;
    var w = Math.sqrt(FLY_AREA * sp.r), h = Math.sqrt(FLY_AREA / sp.r);
    b.im.setAttribute('href', sp.src);
    b.im.setAttribute('x', (-w / 2).toFixed(1)); b.im.setAttribute('y', (-SIZE / 2 - h / 2).toFixed(1));
    b.im.setAttribute('width', w.toFixed(1)); b.im.setAttribute('height', h.toFixed(1));
  };
  Flock.prototype.place = function (b) {
    b.g.setAttribute('transform', 'translate(' + (b.x + (b.dx || 0)).toFixed(1) + ' ' + (b.y + b.lift).toFixed(1) + ')');
    b.pose.setAttribute('transform', 'rotate(' + (b.tilt + b.lean + (b.wob || 0)).toFixed(1) + ') scale(' + (b.face * b.scale).toFixed(3) + ' ' + (b.scale * b.sy * (b.breath || 1)).toFixed(3) + ')');
  };
  Flock.prototype.alive = function () { return this.svg.isConnected; };

  /* what can be seen, in screen pixels: the window less the fixed banner, sidebar and status line */
  Flock.prototype.view = function () {
    var v = { lo: 0, hi: document.documentElement.clientWidth, top: 0, bottom: window.innerHeight };
    var ban = document.querySelector('.top-banner'), side = document.querySelector('.sidebar'), st = document.querySelector('.statusline');
    function fixed(e) { return e && getComputedStyle(e).position === 'fixed'; }
    if (fixed(ban)) { var br = ban.getBoundingClientRect(); if (br.bottom > 0 && br.bottom < v.bottom / 2) v.top = br.bottom; }
    if (fixed(side)) { var sr = side.getBoundingClientRect(); if (sr.right > 0 && sr.width > 0 && sr.right < v.hi / 2) v.lo = sr.right; }
    if (fixed(st)) { var tr = st.getBoundingClientRect(); if (tr.top > v.bottom / 2) v.bottom = tr.top; }
    return v;
  };
  Flock.prototype.seen = function (pt) {
    var o = this.origin(), v = this.view(), x = pt.x + o.x, y = pt.y + o.y;
    return x > v.lo + 24 && x < v.hi - 24 && y > v.top + SIZE + 6 && y < v.bottom - 6;
  };
  Flock.prototype.nearest = function (pt) {
    var best = null, d = Infinity;
    this.perches.forEach(function (p) { var e = hyp(p, pt); if (e < d) { d = e; best = p; } });
    return best;
  };
  /* a free perch for b: one that can be seen and is not too near, preferring a short hop */
  Flock.prototype.freePerch = function (b, avoid, within) {
    var self = this, free = this.perches.filter(function (p) { return !p.bird && !p.gone && p !== avoid; });
    var near = free.filter(function (p) { var d = hyp(p, b); return d > 50 && (!within || d < within) && self.seen(p); });
    if (near.length) {
      near.sort(function (p, q) { return hyp(p, b) - hyp(q, b); });
      return pick(near.slice(0, 4));
    }
    if (within) return null;
    var seen = free.filter(function (p) { return self.seen(p); });
    return seen.length ? pick(seen) : null;
  };
  Flock.prototype.leave = function (b) { if (b.perch && b.perch.bird === b) b.perch.bird = null; b.perch = null; };
  Flock.prototype.settle = function (b, p) { this.leave(b); b.perch = p; if (p) p.bird = b; };

  /* ---- flying: an arc from where the bird is, wings beating -------------------------------------- */
  Flock.prototype.flight = function (b, to, opts, done) {
    var self = this;
    opts = opts || {};
    var s = { x: b.x, y: b.y, scale: b.scale, op: opts.fromOp == null ? 1 : opts.fromOp };
    var e = { x: to.x, y: to.y, scale: opts.toScale == null ? 1 : opts.toScale, op: opts.toOp == null ? 1 : opts.toOp };
    var dist = hyp(e, s), lift = opts.lift == null ? Math.max(36, Math.min(220, dist * 0.32)) : opts.lift;
    var cx = (s.x + e.x) / 2, cy = Math.min(s.y, e.y) - lift, dur = opts.dur || Math.min(3000, 700 + dist * 1.7);
    var wings = this.wings[Math.random() < b.belly ? 'belly' : 'side'], t0 = 0;
    b.face = e.x >= s.x ? 1 : -1;
    b.flyingNow = true;
    function frame(now) {
      if (!self.alive()) return;
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / dur), k = ease(t), u = 1 - k;
      if (to.perch) { e.x = to.perch.x; e.y = to.perch.y; }
      b.x = u * u * s.x + 2 * u * k * cx + k * k * e.x;
      b.y = u * u * s.y + 2 * u * k * cy + k * k * e.y;
      var dx = 2 * u * (cx - s.x) + 2 * k * (e.x - cx), dy = 2 * u * (cy - s.y) + 2 * k * (e.y - cy);
      b.tilt = Math.max(-18, Math.min(18, Math.atan2(dy, Math.abs(dx) + 1) * 57.3 * 0.45)) * b.face;
      b.scale = s.scale + (e.scale - s.scale) * k;
      var n = Math.floor((now - t0) / BEAT), glide = dist > 260 && t > 0.35 && t < 0.7 && (n % 12) > 7;
      self.flying(b, wings[glide ? 1 : n % wings.length]);
      b.lift = glide ? 0 : -2.5 * Math.sin(((now - t0) / (BEAT * 4)) * Math.PI * 2);
      b.sy = 1;
      b.g.style.opacity = (s.op + (e.op - s.op) * k).toFixed(3);
      self.place(b);
      if (t < 1) { requestAnimationFrame(frame); return; }
      b.tilt = 0; b.lift = 0; b.flyingNow = false;
      self.perched(b, b.own);
      self.place(b);
      if (done) done();
    }
    requestAnimationFrame(frame);
  };
  Flock.prototype.tween = function (b, dur, step, done) {
    var self = this, t0 = 0;
    function frame(now) {
      if (!self.alive()) return;
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / dur);
      step(t); self.place(b);
      if (t < 1) requestAnimationFrame(frame); else if (done) done();
    }
    requestAnimationFrame(frame);
  };
  Flock.prototype.fade = function (b, from, to, dur, done) {
    this.tween(b, dur, function (t) { b.g.style.opacity = (from + (to - from) * t).toFixed(3); }, done);
  };
  Flock.prototype.landHop = function (b, done) {
    this.tween(b, 260, function (t) { b.sy = 1 - 0.12 * Math.sin(t * Math.PI); }, function () { b.sy = 1; if (done) done(); });
  };
  /* go to a perch: flying, or with reduced motion a fade out and in */
  Flock.prototype.go = function (b, to, done, opts) {
    var self = this;
    if (reduced) {
      this.fade(b, 1, 0, 280, function () {
        b.x = to.perch ? to.perch.x + (to.off || 0) : to.x; b.y = to.perch ? to.perch.y : to.y;
        b.face = to.face || (Math.random() < 0.5 ? 1 : -1); self.place(b);
        self.fade(b, 0, 1, 380, done);
      });
      return;
    }
    this.flight(b, to, opts, function () {
      if (to.face) b.face = to.face;
      self.landHop(b, done);
    });
  };
  Flock.prototype.hopTo = function (b, p, done, quiet) {
    var self = this;
    b.busy = true; this.settle(b, p);
    this.go(b, { x: p.x, y: p.y, perch: p }, function () { b.x = p.x; b.y = p.y; self.place(b); b.busy = false; if (!quiet) self.landed(b); if (done) done(); });
  };
  /* after a landing: two wrens close together may fall in love a little */
  Flock.prototype.landed = function (b) {
    var self = this, mate = this.birds.filter(function (o) { return o !== b && !o.busy && !o.away && !o.flyingNow && hyp(o, b) < 70; })[0];
    if (mate && Math.random() < 0.6) {
      b.face = mate.x > b.x ? 1 : -1; mate.face = -b.face; this.place(b); this.place(mate);
      this.hearts(b, 2); setTimeout(function () { self.hearts(mate, 2); }, 250);
    }
  };
  Flock.prototype.toast = function (words) {
    var t = document.createElement('div');
    Array.prototype.forEach.call(document.querySelectorAll('.wren-toast'), function (o) { o.remove(); });
    t.className = 'wren-toast'; t.setAttribute('role', 'status'); t.textContent = words;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('gone'); setTimeout(function () { t.remove(); }, 800); }, 3500);
  };

  /* ---- the worm: the wren that has one holds it in its beak, where it wriggles; a while later it
     gets gulped down, and later still the wren finds another ------------------------------------- */
  Flock.prototype.giveWorm = function (b) {
    var sp = fx.eating, self = this;
    b.eat = sp; b.own = sp; if (!b.flyingNow && !b.puff) { this.perched(b, sp); this.place(b); }
    if (!b.worm) {
      b.worm = document.createElementNS(NS, 'path'); b.worm.setAttribute('class', 'wren-worm');
      b.pose.appendChild(b.worm);
    }
    b.wormLen = 1;
    clearTimeout(b.wormT);
    b.wormT = setTimeout(function () { self.gulp(b); }, rnd(7000, 14000));
    if (!this.wriggling) {
      this.wriggling = true;
      requestAnimationFrame(function f(now) {
        if (!self.alive()) return;
        if (!self.wriggle(now)) { self.wriggling = false; return; }
        requestAnimationFrame(f);
      });
    }
  };
  Flock.prototype.wriggle = function (now) {
    var any = false, vis = !document.hidden;
    this.birds.forEach(function (b) {
      if (!b.worm) return;
      var on = b.wormLen > 0 && b.cur === b.eat;
      b.worm.style.display = on ? '' : 'none';
      if (!on) return;
      any = true;
      if (!vis) return;
      var w = SIZE * b.eat.r, tx = -w / 2 + b.eat.tip[0] * w - 2, ty = -SIZE + 2 + b.eat.tip[1] * SIZE, L = 16 * b.wormLen, n = 8, d = 'M' + tx.toFixed(1) + ' ' + ty.toFixed(1);
      var amp = reduced ? 1 : 2.6, sp = reduced ? 500 : 160;
      for (var i = 1; i <= n; i++) {
        var s = i / n, x = tx + 3 * s + amp * s * Math.sin(now / sp + i * 1.1), y = ty + L * s;
        d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      b.worm.setAttribute('d', d);
    });
    return any;
  };
  Flock.prototype.gulp = function (b) {
    var self = this;
    if (!this.alive()) return;
    if (b.busy || b.flyingNow || b.puff) { b.wormT = setTimeout(function () { self.gulp(b); }, 3000); return; }
    b.busy = true;
    this.tween(b, reduced ? 1400 : 1100, function (t) {
      b.wormLen = Math.max(0, 1 - t * 1.15);
      b.sy = reduced ? 1 : 1 - 0.07 * Math.sin(t * Math.PI * 3) * t;
      b.tilt = reduced ? 0 : -8 * Math.sin(t * Math.PI) * b.face;
    }, function () {
      b.sy = 1; b.tilt = 0; b.wormLen = 0; b.busy = false; self.place(b);
      self.wormLater(b);
    });
  };
  Flock.prototype.noWorm = function (b) { if (b.worm && b.wormLen > 0) { b.wormLen = 0; clearTimeout(b.wormT); } };
  Flock.prototype.wormLater = function (b) {
    var self = this;
    if (!b.worm) return;
    clearTimeout(b.wormT);
    b.wormT = setTimeout(function () { if (self.alive()) self.giveWorm(b); }, rnd(25000, 50000));
  };

  /* ---- left alone: shuffling about ----------------------------------------------------------------- */
  Flock.prototype.turn = function (b) {
    var self = this, was = b.busy;
    if (reduced) { b.face = -b.face; this.place(b); return; }
    b.busy = true;
    var flipped = false;
    this.tween(b, 300, function (t) {
      b.lift = -6 * Math.sin(t * Math.PI); b.sy = 1 - 0.08 * Math.sin(t * Math.PI * 2);
      if (!flipped && t > 0.5) { flipped = true; b.face = -b.face; }
    }, function () { b.lift = 0; b.sy = 1; b.busy = was && !!b.puff; self.place(b); });
  };
  /* a puffed-up wren is never quite still: it sways, shifts from foot to foot and breathes */
  Flock.prototype.fidget = function () {
    var self = this;
    if (this.fidgeting) return; this.fidgeting = true;
    requestAnimationFrame(function f(now) {
      if (!self.alive()) return;
      var any = false;
      self.birds.forEach(function (b) {
        if (!b.puff || b.flyingNow || reduced) { if (b.wob || b.dx || (b.breath && b.breath !== 1)) { b.wob = b.dx = 0; b.breath = 1; self.place(b); } return; }
        any = true;
        var k = Math.min(1, b.puff / 3);
        b.wob = k * 5 * Math.sin(now / 520 + b.i * 1.7);
        b.dx = k * 5 * Math.sin(now / 1300 + b.i) + 1.5 * Math.sin(now / 260 + b.i);
        b.breath = 1 + 0.03 * Math.sin(now / 380 + b.i);
        self.place(b);
      });
      if (any) requestAnimationFrame(f); else self.fidgeting = false;
    });
  };
  Flock.prototype.idle = function () {
    var self = this;
    return this.birds.filter(function (b) { return !b.busy && !b.away && !b.puff && !b.focused && self.seen(b); });
  };
  Flock.prototype.shuffle = function () {
    var self = this, puffed = this.birds.filter(function (b) { return b.puff && !b.flyingNow && self.seen(b); });
    if (puffed.length && Math.random() < 0.5) { this.turn(pick(puffed)); return; }
    var idle = this.idle(); if (!idle.length) return;
    var b = pick(idle), p = Math.random() < 0.8 && this.freePerch(b, null, 520);
    if (p && !reduced) this.hopTo(b, p); else this.turn(b);
  };
  /* after scrolling: if no wren can be seen, one or two fly in from the side to perches in view */
  Flock.prototype.follow = function () {
    var self = this;
    if (!this.alive() || STILL || document.hidden) return;
    var seen = this.birds.filter(function (b) { return !b.away && self.seen(b); }).length, want = Math.min(2, this.birds.length);
    if (seen >= want) return;
    var off = shuffled(this.birds.filter(function (b) { return !b.away && !b.busy && !b.puff && !b.focused && !self.seen(b); }));
    off.slice(0, want - seen).forEach(function (b, i) {
      setTimeout(function () { self.flyIn(b); }, 200 + i * 700 + rnd(0, 500));
    });
  };
  Flock.prototype.flyIn = function (b) {
    var self = this, p = this.freePerch(b);
    if (!p || b.busy || b.away || this.seen(b)) return;
    this.settle(b, p);
    b.busy = true;
    var done = function () { b.x = p.x; b.y = p.y; self.place(b); b.busy = false; self.landed(b); };
    if (reduced) { b.g.style.opacity = '0'; b.x = p.x; b.y = p.y; this.place(b); this.fade(b, 0, 1, 700, done); return; }
    var o = this.origin(), v = this.view(), lo = v.lo - o.x, hi = v.hi - o.x, fromLeft = Math.abs(p.x - lo) < Math.abs(hi - p.x);
    b.x = fromLeft ? lo - 50 : hi + 50; b.y = p.y - rnd(60, 160); b.scale = 1; b.g.style.opacity = '1';
    this.place(b);
    this.flight(b, { x: p.x, y: p.y, perch: p }, { lift: rnd(20, 60) }, function () { self.landHop(b, done); });
  };

  /* ---- clicked ----------------------------------------------------------------------------------- */
  Flock.prototype.poke = function (b) {
    if (b.away || b.flyingNow) return;
    if (this.tame || b.puff) { this.puffUp(b); return; }
    if (b.busy) return;
    var r = Math.random();
    if (r < b.puffy) { this.puffUp(b); return; }
    if (b.focused) { this.puffUp(b); return; }   /* a wren chosen with the keyboard stays to be seen */
    if (r < b.puffy + (1 - b.puffy) * 0.3) { this.flyOff(b); return; }
    var p = this.freePerch(b);
    if (p) this.hopTo(b, p); else this.puffUp(b);
  };
  Flock.prototype.puffUp = function (b) {
    var self = this;
    if (b.busy && !b.puff) return;
    b.busy = true;
    clearTimeout(b.deflate);
    b.deflate = setTimeout(function () { self.deflate(b); }, 6000);
    this.noWorm(b);
    if (b.puff < PUFF_CAP) {
      b.puff++;
      this.perched(b, b.dote ? this.doting : this.puffed);
      this.resize(b, puffSize(b.puff));
      this.fidget();
      if (Math.random() < EGG_CHANCE || /[?&]egg\b/.test(location.search)) this.layEgg(b);
    } else this.resize(b, b.scale + 0.06, true);
    if (b.puff >= DOTE_AT) { if (!b.dote) this.dote(b); else this.hearts(b, 2); }
  };
  Flock.prototype.resize = function (b, to, back) {
    var self = this, from = b.scale;
    if (reduced) { this.tween(b, 220, function (t) { b.scale = from + (to - from) * t; }, back && function () { b.scale = from; self.place(b); }); return; }
    this.tween(b, back ? 380 : 520, function (t) {
      b.scale = back ? from + (to - from) * Math.sin(t * Math.PI) : from + (to - from) * spring(t);
      b.sy = 1 + 0.04 * Math.sin(t * Math.PI * 3) * (1 - t);
    }, function () { b.sy = 1; if (!back) b.scale = to; });
  };
  Flock.prototype.dote = function (b) {
    b.dote = true;
    this.perched(b, this.doting); this.place(b);
    this.hearts(b, 6);
  };
  Flock.prototype.deflate = function (b) {
    var self = this;
    if (!this.alive()) return;
    if (b.puff > 0) b.puff--;
    if (b.dote && b.puff < DOTE_AT) { b.dote = false; this.perched(b, this.puffed); }
    if (!b.puff) { this.resize(b, 1); this.perched(b, b.own); b.busy = false; this.wormLater(b); return; }
    this.resize(b, puffSize(b.puff));
    b.deflate = setTimeout(function () { self.deflate(b); }, 900);
  };
  Flock.prototype.hearts = function (b, n) {
    var self = this, top = b.y - SIZE * b.scale - 2;
    for (var i = 0; i < n; i++) (function (i) {
      setTimeout(function () {
        if (!self.alive()) return;
        var h = document.createElementNS(NS, 'path'), x0 = b.x + rnd(-14, 14), sway = rnd(8, 16) * (i % 2 ? 1 : -1), size = rnd(1.2, 1.7), t0 = 0;
        h.setAttribute('d', HEART); h.setAttribute('class', 'wren-heart');
        self.layer.appendChild(h);
        var rise = reduced ? 8 : rnd(55, 85), dur = reduced ? 1600 : rnd(1500, 2100);
        (function frame(now) {
          if (!t0) t0 = now;
          var t = Math.min(1, (now - t0) / dur), x = x0 + (reduced ? 0 : sway * Math.sin(t * Math.PI * 2)), y = top - rise * t;
          var sc = size * (reduced ? 1 : 0.5 + 0.5 * Math.min(1, t * 4));
          h.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(2) + ')');
          h.style.opacity = (t < 0.15 ? t / 0.15 : t > 0.6 ? (1 - t) / 0.4 : 1).toFixed(2);
          if (t < 1) requestAnimationFrame(frame); else h.remove();
        })(performance.now());
      }, i * (reduced ? 220 : 160));
    })(i);
  };

  /* ---- the rare egg: a puffed wren lays it, it wobbles and hatches, and the chick walks out towards
     you, getting bigger. Click it and it preens and puffs up. Left alone for 8 s it walks off. ------- */
  var hatching = false;
  Flock.prototype.layEgg = function (b) {
    var self = this;
    if (hatching || document.querySelector('.wren-chick')) return;
    hatching = true;
    var egg = document.createElementNS(NS, 'image'), eh = 15, side = b.face > 0 ? -1 : 1, ex = b.x + side * 20, ey = b.y;
    function show(sp, h) { egg.setAttribute('href', sp.src); egg.setAttribute('width', (h * sp.r).toFixed(1)); egg.setAttribute('height', h); egg.setAttribute('x', (-h * sp.r / 2).toFixed(1)); egg.setAttribute('y', -h); }
    var holder = document.createElementNS(NS, 'g'); holder.appendChild(egg);
    show(fx.egg, eh);
    this.layer.insertBefore(holder, this.layer.firstChild);
    var t0 = 0, dur = reduced ? 2600 : 2400;
    (function frame(now) {
      if (!self.alive()) { hatching = false; return; }
      if (!t0) t0 = now;
      var e = now - t0, t = Math.min(1, e / dur), rot = 0, sc = 1, op = 1;
      if (reduced) op = Math.min(1, e / 400);
      else {
        sc = Math.min(1, e / 260) * (e < 260 ? 1.2 : 1);
        if (e > 700) rot = 14 * Math.sin((e - 700) / 85) * Math.max(0, 1 - (e - 700) / 1700);
      }
      if (t > 0.72 && egg.getAttribute('href') === fx.egg.src) show(fx['egg-hatching'], eh * 1.35);
      holder.setAttribute('transform', 'translate(' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ') rotate(' + rot.toFixed(1) + ') scale(' + sc.toFixed(2) + ')');
      holder.style.opacity = op;
      if (t < 1) { requestAnimationFrame(frame); return; }
      var o = self.origin();
      setTimeout(function () { holder.remove(); }, 300);
      new Chick(self, b, ex + o.x, ey + o.y, eh);
    })(performance.now());
  };

  function Chick(flock, mother, sx, sy, h0) {
    var self = this;
    this.flock = flock; this.mother = mother; this.puff = 0; this.scale = 1;
    var el = this.el = document.createElement('button'), img = this.img = document.createElement('img');
    el.type = 'button'; el.className = 'wren-chick'; el.setAttribute('aria-label', 'A wren chick has hatched. Press to make it preen and puff up.');
    img.alt = ''; el.appendChild(img); document.body.appendChild(el);
    this.sprite(fx['chick-walking']);
    el.addEventListener('click', function (e) { e.stopPropagation(); self.poke(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); self.leave(); } });
    var h1 = Math.min(280, window.innerHeight * 0.42), x1 = window.innerWidth / 2, y1 = window.innerHeight - 40;
    this.x = sx; this.y = sy; this.h = h0;
    if (reduced) { this.x = x1; this.y = y1; this.h = h1; this.draw(); el.style.opacity = 0; this.fade(0, 1, 700, function () { self.ready(); }); return; }
    var t0 = 0, dur = 4600;
    function frame(now) {
      if (!el.isConnected) return;
      if (!t0) t0 = now;
      var e = now - t0, t = Math.min(1, e / dur), k = t * t * (3 - 2 * t);
      self.x = sx + (x1 - sx) * k; self.y = sy + (y1 - sy) * k;
      self.h = h0 * Math.pow(h1 / h0, t);
      self.flip = Math.floor(e / 280) % 2 ? -1 : 1;
      self.rot = t < 1 ? 7 * Math.sin(e / 280 * Math.PI) : 0;
      self.bob = t < 1 ? -Math.abs(Math.sin(e / 280 * Math.PI)) * self.h * 0.04 : 0;
      self.draw();
      if (t < 1) requestAnimationFrame(frame); else { self.flip = 1; self.draw(); self.ready(); }
    }
    requestAnimationFrame(frame);
  }
  Chick.prototype.sprite = function (sp) { if (sp) { this.sp = sp; this.img.src = sp.src; } };
  Chick.prototype.draw = function () {
    var h = this.h * this.scale, w = h * this.sp.r, el = this.el;
    el.style.width = w.toFixed(1) + 'px'; el.style.height = h.toFixed(1) + 'px';
    el.style.left = (this.x - w / 2).toFixed(1) + 'px'; el.style.top = (this.y - h + (this.bob || 0)).toFixed(1) + 'px';
    el.style.transform = 'rotate(' + (this.rot || 0).toFixed(1) + 'deg) scaleX(' + (this.flip || 1) + ')';
  };
  Chick.prototype.fade = function (a, b, dur, done) {
    var el = this.el, t0 = 0;
    (function frame(now) { if (!t0) t0 = now; var t = Math.min(1, (now - t0) / dur); el.style.opacity = a + (b - a) * t; if (t < 1) requestAnimationFrame(frame); else if (done) done(); })(performance.now());
  };
  Chick.prototype.ready = function () {
    var m = this.mother; hatching = false;
    if (m) { m.busy = !!m.puff; }
    this.later();
  };
  Chick.prototype.later = function () { var self = this; clearTimeout(this.timer); this.timer = setTimeout(function () { self.leave(); }, 8000); };
  Chick.prototype.poke = function () {
    var self = this;
    if (this.going) return;
    this.later();
    clearTimeout(this.preenT);
    this.sprite(fx['chick-preening']); this.draw();
    if (this.puff < CHICK_CAP) {
      this.puff++;
      var from = this.scale, to = 1 + 0.1 * this.puff, t0 = 0;
      (function frame(now) {
        if (!t0) t0 = now;
        var t = Math.min(1, (now - t0) / (reduced ? 220 : 520));
        self.scale = from + (to - from) * (reduced ? t : spring(t)); self.draw();
        if (t < 1) requestAnimationFrame(frame);
      })(performance.now());
    }
    if (this.puff >= CHICK_DOTE) this.hearts(this.puff === CHICK_DOTE ? 5 : 2);
    this.preenT = setTimeout(function () { self.sprite(self.puff >= 2 ? fx['chick-puffed'] : fx['chick-walking']); self.draw(); }, 750);
  };
  Chick.prototype.hearts = function (n) {
    var self = this;
    for (var i = 0; i < n; i++) (function (i) {
      setTimeout(function () {
        var s = document.createElementNS(NS, 'svg'), size = rnd(24, 38), x0 = self.x + rnd(-self.h * 0.3, self.h * 0.3), y0 = self.y - self.h * self.scale, t0 = 0;
        s.setAttribute('viewBox', '-12 -14 24 20'); s.setAttribute('class', 'wren-chick-heart'); s.setAttribute('aria-hidden', 'true');
        var path = document.createElementNS(NS, 'path'); path.setAttribute('class', 'wren-heart'); path.setAttribute('d', HEART); s.appendChild(path);
        s.style.width = size + 'px'; s.style.height = size + 'px';
        document.body.appendChild(s);
        (function frame(now) {
          if (!t0) t0 = now;
          var t = Math.min(1, (now - t0) / 1800), rise = reduced ? 10 : 120;
          s.style.left = (x0 - size / 2 + (reduced ? 0 : 14 * Math.sin(t * 6))).toFixed(1) + 'px';
          s.style.top = (y0 - size - rise * t).toFixed(1) + 'px';
          s.style.opacity = t < 0.15 ? t / 0.15 : t > 0.6 ? (1 - t) / 0.4 : 1;
          if (t < 1) requestAnimationFrame(frame); else s.remove();
        })(performance.now());
      }, i * 150);
    })(i);
  };
  Chick.prototype.leave = function () {
    var self = this, el = this.el;
    if (this.going) return; this.going = true;
    clearTimeout(this.timer);
    if (reduced || !this.flock.alive()) { this.fade(1, 0, 700, function () { el.remove(); }); return; }
    this.sprite(fx['chick-walking']);
    var w = this.h * this.scale * this.sp.r, tx = this.x < window.innerWidth / 2 ? -w : window.innerWidth + w, ty = this.y;
    var sx = this.x, sy = this.y, h0 = this.h * this.scale, h1 = h0 * 0.8, t0 = 0, dur = 2600;
    this.scale = 1;
    (function frame(now) {
      if (!t0) t0 = now;
      var e = now - t0, t = Math.min(1, e / dur), k = t * t * (3 - 2 * t);
      self.x = sx + (tx - sx) * k; self.y = sy + (ty - sy) * k; self.h = h0 * Math.pow(h1 / h0, t);
      self.flip = Math.floor(e / 260) % 2 ? -1 : 1; self.rot = 6 * Math.sin(e / 260 * Math.PI);
      self.bob = -Math.abs(Math.sin(e / 260 * Math.PI)) * self.h * 0.03;
      self.draw();
      if (t < 1) requestAnimationFrame(frame); else el.remove();
    })(performance.now());
  };

  /* ---- now and then -------------------------------------------------------------------------------- */
  /* two wrens fly to one perch, side by side, and nuzzle; then one goes off to another perch */
  Flock.prototype.nuzzle = function () {
    var self = this, idle = this.idle(); if (idle.length < 2) return false;
    var a = pick(idle), b = idle.filter(function (o) { return o !== a; }).sort(function (p, q) { return hyp(p, a) - hyp(q, a); })[0];
    if (!b) return false;
    var free = this.perches.filter(function (p) { return !p.gone && (!p.bird || p.bird === a || p.bird === b) && self.seen(p); });
    if (!free.length) return false;
    var meet = free.sort(function (p, q) { return Math.max(hyp(p, a), hyp(p, b)) - Math.max(hyp(q, a), hyp(q, b)); })[0];
    var left = a.x <= b.x ? a : b, right = left === a ? b : a, gap = 14;
    a.busy = b.busy = true;
    this.leave(a); this.leave(b); meet.bird = right; right.perch = meet;
    var landed = 0;
    function both() {
      if (++landed < 2) return;
      left.face = 1; right.face = -1; left.y = right.y = meet.y; self.place(left); self.place(right);
      var lean = reduced ? 0 : 1;
      self.tween(left, 1800, function (t) {
        var v = Math.max(0, lean * Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI));
        left.lean = 14 * v; right.lean = -14 * v;
        left.x = meet.x - gap + 4 * v; right.x = meet.x + gap - 4 * v;
        self.place(right);
      }, function () {
        left.lean = right.lean = 0; self.place(left); self.place(right);
        self.hearts(left, 2); setTimeout(function () { self.hearts(right, 2); }, 200);
        setTimeout(function () {
          if (!self.alive()) return;
          var go = Math.random() < 0.5 ? left : right, stay = go === left ? right : left, p = self.freePerch(go, meet);
          self.settle(stay, meet);
          stay.busy = false;
          var sx = stay.x;
          if (!reduced) self.tween(stay, 420, function (t) { stay.x = sx + (meet.x - sx) * t; });
          else { stay.x = meet.x; self.place(stay); }
          if (!p) { go.busy = false; self.settle(go, self.freePerch(go) || null); return; }
          self.hopTo(go, p);
        }, reduced ? 5000 : 2600);
      });
    }
    this.go(left, { x: meet.x - gap, y: meet.y, face: 1 }, both);
    setTimeout(function () { self.go(right, { x: meet.x + gap, y: meet.y, face: -1 }, both); }, reduced ? 0 : 300);
    return true;
  };
  /* a wren flies off into the distance; some while later it flies back in from one side */
  Flock.prototype.flyOff = function (b) {
    if (!b) {
      if (this.birds.filter(function (o) { return o.away; }).length >= Math.max(1, Math.floor(this.birds.length / 2))) return false;
      var idle = this.idle(); if (!idle.length) return false;
      b = pick(idle);
    }
    var self = this;
    b.busy = true; this.leave(b);
    function gone() {
      b.away = true; b.busy = false; b.g.style.display = 'none';
      b.g.setAttribute('tabindex', '-1'); b.g.setAttribute('aria-hidden', 'true');
      if (document.activeElement === b.g && document.activeElement.blur) document.activeElement.blur();
      setTimeout(function () { self.back(b); }, rnd(12000, 28000));
    }
    if (reduced) { this.fade(b, 1, 0, 600, gone); return true; }
    var dir = Math.random() < 0.5 ? 1 : -1;
    this.flight(b, { x: b.x + dir * rnd(90, 200), y: b.y - rnd(180, 300) }, { toScale: 0.08, toOp: 0, dur: 3400, lift: 40 }, gone);
    return true;
  };
  Flock.prototype.back = function (b) {
    if (!this.alive()) return;
    var self = this, p = this.freePerch(b);
    if (!p || document.hidden) { setTimeout(function () { self.back(b); }, 8000); return; }
    b.away = false; b.g.style.display = '';
    b.g.removeAttribute('aria-hidden'); b.g.setAttribute('tabindex', '0');
    b.x = -9999; b.scale = 1;
    this.flyIn(b);
  };

  /* shuffles every few seconds; a nuzzle or a flight into the distance less often */
  Flock.prototype.schedule = function (kind) {
    var self = this;
    clearTimeout(this.timers[kind]);
    if (STILL) return;
    var wait = kind === 'shuffle' ? (reduced ? rnd(10000, 18000) : rnd(2500, 5500)) : (reduced ? rnd(35000, 60000) : rnd(14000, 26000));
    this.timers[kind] = setTimeout(function () {
      if (!self.alive()) return;
      if (!document.hidden) {
        if (self.tame) {
          if (kind === 'shuffle') { var pf = self.birds.filter(function (b) { return b.puff && !b.flyingNow && self.seen(b); }); if (pf.length) self.turn(pick(pf)); }
        }
        else if (kind === 'shuffle') self.shuffle();
        else if (Math.random() < 0.55) self.nuzzle() || self.flyOff();
        else self.flyOff() || self.nuzzle();
      }
      self.schedule(kind);
    }, wait);
  };

  /* "ash" typed anywhere outside a text field tames every wren: they come back, look at you with
     hearts, and each click puffs them up. "ash" again lets them go wild. Nothing typed is blocked. */
  Flock.prototype.setTame = function (on) {
    var self = this;
    this.tame = on;
    this.birds.forEach(function (b, i) {
      if (on && b.away) {
        var p = self.freePerch(b);
        if (p) { b.away = false; b.g.style.display = ''; b.g.style.opacity = '0'; b.g.removeAttribute('aria-hidden'); b.g.setAttribute('tabindex', '0'); self.settle(b, p); b.x = p.x; b.y = p.y; b.scale = 1; self.place(b); self.fade(b, 0, 1, 500); }
      }
      b.g.setAttribute('aria-label', on ? 'A tame Carolina wren. Press to puff it up.' : 'A Carolina wren. Press it and see what it does.');
      if (!on) return;
      setTimeout(function () {
        if (!self.alive() || b.flyingNow || b.away) return;
        if (!b.puff) { self.perched(b, self.doting); b.face = 1; self.place(b); }
        self.hearts(b, 3);
        setTimeout(function () { if (!b.puff && !b.dote) { self.perched(b, b.own); self.place(b); } }, 3500);
      }, 200 + i * 90);
    });
    this.toast(on ? 'The wrens are tame. Puff them up!' : 'The wrens are wild again.');
  };

  function start() {
    if (window.MintWrens.flock || !document.body) return;
    var phone = document.documentElement.clientWidth < 760;
    var count = phone ? 2 : 4;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    /* fetch only what is needed to show them perched; the rest arrives as it is used */
    var kinds = shuffled(WRENS).slice(0, count);
    Promise.all(kinds.map(function (k) { return load(sprite(k[0], k[1])); })).then(function (ok) {
      if (!ok.every(Boolean)) return;
      var flock = window.MintWrens.flock = new Flock(count);
      if (!flock.birds.length) { flock.svg.remove(); return; }
      setTimeout(function () { Object.keys(fx).forEach(function (n) { if (!/^(egg|chick)/.test(n)) load(fx[n]); }); }, 1500);
      var typed = '';
      document.addEventListener('keydown', function (e) {
        var t = e.target, tag = t && t.tagName;
        if (e.ctrlKey || e.metaKey || e.altKey || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
        if (!e.key || e.key.length !== 1) return;
        typed = (typed + e.key.toLowerCase()).slice(-3);
        if (typed !== 'ash') return;
        typed = '';
        if (flock.alive()) flock.setTame(!flock.tame);
      });
    });
  }
  function whenIdle() {
    var go = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(start, { timeout: 3000 }); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  }
  whenIdle();
})();
