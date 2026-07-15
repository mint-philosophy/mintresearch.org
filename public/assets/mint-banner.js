(function () {
  var scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : 'https://mintresearch.org/assets/mint-banner.js';
  var assetRoot = new URL('.', scriptUrl).href;
  var colors = ['red', 'brown', 'yellow', 'green', 'teal', 'indigo', 'purple', 'cool'];

  function render() {
    var banner = document.querySelector('.top-banner');
    if (!banner) return;

    var inner = banner.querySelector('.top-banner-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'top-banner-inner';
      banner.appendChild(inner);
    }

    var home = inner.querySelector('a');
    if (!home) {
      home = document.createElement('a');
      inner.prepend(home);
    }
    home.href = 'https://mintresearch.org/';
    home.style.display = 'inline-flex';

    var logo = home.querySelector('.top-banner-logo');
    if (!logo) {
      logo = document.createElement('img');
      logo.className = 'top-banner-logo';
      home.appendChild(logo);
    }
    logo.src = assetRoot + 'mint-banner.png';
    logo.alt = 'MINT LAB';

    var group = inner.querySelector('.top-banner-minties');
    if (!group) {
      group = document.createElement('div');
      group.className = 'top-banner-minties';
      inner.appendChild(group);
    }
    group.setAttribute('aria-hidden', 'true');

    var existing = Array.from(group.querySelectorAll('.top-banner-minty'));
    colors.forEach(function (color, index) {
      var minty = existing[index];
      if (!minty) {
        minty = document.createElement('img');
        minty.className = 'top-banner-minty';
        group.appendChild(minty);
      }
      minty.src = assetRoot + 'minty-' + color + '.png';
      minty.alt = '';
      minty.style.animationDelay = (index * 0.3) + 's';
    });
    existing.slice(colors.length).forEach(function (minty) { minty.remove(); });

    banner.dataset.mintBannerContract = '1';

    function publishHeight() {
      document.documentElement.style.setProperty('--banner-h', banner.getBoundingClientRect().height + 'px');
    }

    publishHeight();
    window.addEventListener('load', publishHeight, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(publishHeight).observe(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
})();
