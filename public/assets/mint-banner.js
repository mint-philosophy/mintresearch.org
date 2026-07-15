(function (root, document) {
  'use strict';

  var VERSION = '1.0.0';
  var scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : 'https://mintresearch.org/assets/mint-banner.js';
  var defaultAssetRoot = new URL('.', scriptUrl).href;
  var defaultHomeHref = new URL('/', scriptUrl).href;
  var colors = Object.freeze(['red', 'brown', 'yellow', 'green', 'teal', 'indigo', 'purple', 'cool']);
  var states = typeof WeakMap === 'function' ? new WeakMap() : null;

  function elementFor(target) {
    if (typeof target === 'string') return document.querySelector(target);
    return target && target.nodeType === 1 ? target : null;
  }

  function emit(target, name, detail) {
    target.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }));
  }

  function publishHeight(banner) {
    var height = banner.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--banner-h', height + 'px');
    banner.style.setProperty('--mint-banner-height', height + 'px');
    return height;
  }

  function mount(target, options) {
    var banner = elementFor(target);
    if (!banner) throw new Error('MintBanner.mount target was not found.');

    options = options || {};
    var assetRoot = new URL(
      options.assetRoot || banner.getAttribute('data-asset-root') || defaultAssetRoot,
      scriptUrl
    ).href;
    var homeHref = options.homeHref || banner.getAttribute('data-home-href') || defaultHomeHref;

    var inner = banner.querySelector('.top-banner-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'top-banner-inner';
      banner.appendChild(inner);
    }

    var logo = inner.querySelector('.top-banner-logo');
    var home = logo && logo.closest ? logo.closest('a') : null;
    if (!home || !inner.contains(home)) {
      home = inner.querySelector('a.top-banner-home, a[data-mint-banner-home]');
    }
    if (!home) {
      home = document.createElement('a');
      inner.insertBefore(home, inner.firstChild);
    }
    home.classList.add('top-banner-home');
    home.setAttribute('data-mint-banner-home', '');
    home.href = homeHref;

    if (!logo) {
      logo = document.createElement('img');
      logo.className = 'top-banner-logo';
      home.appendChild(logo);
    } else if (logo.parentNode !== home) {
      home.appendChild(logo);
    }
    logo.src = assetRoot + 'mint-banner.png';
    logo.alt = options.logoAlt || banner.getAttribute('data-logo-alt') || 'MINT LAB';

    var group = inner.querySelector('.top-banner-minties');
    if (!group) {
      group = document.createElement('div');
      group.className = 'top-banner-minties';
      inner.appendChild(group);
    }
    group.setAttribute('aria-hidden', 'true');

    var existing = Array.prototype.slice.call(group.querySelectorAll('.top-banner-minty'));
    colors.forEach(function (color, index) {
      var minty = existing[index];
      if (!minty) {
        minty = document.createElement('img');
        minty.className = 'top-banner-minty';
        group.appendChild(minty);
      }
      minty.setAttribute('data-mint-color', color);
      minty.src = assetRoot + 'minty-' + color + '.png';
      minty.alt = '';
      minty.style.animationDelay = (index * 0.3) + 's';
    });
    existing.slice(colors.length).forEach(function (minty) { minty.remove(); });

    banner.setAttribute('data-mint-banner-contract', '1');
    banner.setAttribute('data-mint-banner-version', VERSION);

    var state = states && states.get(banner);
    if (!state) {
      state = { observer: null };
      if ('ResizeObserver' in root) {
        state.observer = new ResizeObserver(function () { publishHeight(banner); });
        state.observer.observe(banner);
      }
      root.addEventListener('load', function () { publishHeight(banner); }, { once: true });
      if (states) states.set(banner, state);
    }

    var height = publishHeight(banner);
    emit(banner, 'mint-banner:rendered', { banner: banner, height: height, version: VERSION });
    return banner;
  }

  function init(selector, options) {
    var targets = document.querySelectorAll(selector || '.top-banner');
    return Array.prototype.map.call(targets, function (banner) { return mount(banner, options); });
  }

  var api = Object.freeze({
    version: VERSION,
    colors: colors,
    mount: mount,
    init: init,
    measure: function (target) {
      var banner = elementFor(target);
      if (!banner) throw new Error('MintBanner.measure target was not found.');
      return publishHeight(banner);
    }
  });
  root.MintBanner = api;
  root.dispatchEvent(new CustomEvent('mint-banner:ready', { detail: { version: VERSION } }));

  function autoInit() { init('.top-banner'); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
})(window, document);
