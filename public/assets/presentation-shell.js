(function () {
  var body = document.body;
  var currentPath = body.dataset.presentationPath || window.location.pathname;
  var pageTitle = body.dataset.presentationTitle || document.title;

  var chrome = document.getElementById('siteChrome');
  chrome.innerHTML =
    '<button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu" title="Open navigation">' +
      '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 6h14M4 11h14M4 16h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>' +
    '</button>' +
    '<div class="mobile-overlay" id="mobileOverlay"></div>' +
    '<nav class="sidebar" id="sidebar" aria-label="Site navigation">' +
      '<a href="/" class="sidebar-header" style="text-decoration:none"><span class="sidebar-title">MINT</span><span class="sidebar-sub">Research Lab</span></a>' +
      '<div class="search-trigger" id="searchTrigger"><span aria-hidden="true">⌕</span> Search... <kbd>⌘K</kbd></div>' +
      '<div class="nav-pages" id="siteNav" data-mint-site-nav><a class="nav-link nav-page" href="/">About MINT Lab</a></div>' +
    '</nav>' +
    '<div class="search-overlay" id="searchOverlay"><div class="search-box"><input type="text" id="searchInput" placeholder="$ grep -r \'query\' ./corpus/"><div class="search-results" id="searchResults"></div></div></div>' +
    '<button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" title="Toggle sidebar">«</button>' +
    '<div class="top-banner" aria-label="MINT Lab masthead"></div>' +
    '<div class="statusline" id="statusline">' +
      '<div class="statusline-row statusline-row-top"><span class="statusline-site">mintresearch.org</span><span class="statusline-section" id="statusSection">' + pageTitle + '</span></div>' +
      '<div class="statusline-row statusline-row-bottom"><img src="/assets/minty-teal.png" alt="" class="statusline-minty"><div class="statusline-progress"><span class="statusline-bar" id="statusBar"></span><span class="statusline-pct" id="statusPct">100%</span></div><span class="statusline-tokens" id="tokenDisplay"><span class="arrow">↓</span> slides</span></div>' +
    '</div>';

  var statusline = chrome.querySelector('.statusline');
  function measureFrameChrome() {
    document.documentElement.style.setProperty('--presentation-status-h', statusline.getBoundingClientRect().height + 'px');
  }
  measureFrameChrome();
  window.addEventListener('load', measureFrameChrome);
  window.addEventListener('resize', measureFrameChrome);
  if ('ResizeObserver' in window) {
    var chromeObserver = new ResizeObserver(measureFrameChrome);
    chromeObserver.observe(statusline);
  }

  var toggle = document.getElementById('presentationModeToggle');
  var frame = document.getElementById('presentationFrame');

  function notifyFrameResize() {
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage('mint-presentation-resize', window.location.origin);
      try {
        frame.contentWindow.dispatchEvent(new Event('resize'));
        frame.contentWindow.refitFdcSlides?.();
      } catch (error) {
        // Cross-origin presentation frames still receive the postMessage path.
      }
    }
  }

  frame.addEventListener('load', notifyFrameResize);
  if ('ResizeObserver' in window) {
    var frameObserver = new ResizeObserver(notifyFrameResize);
    frameObserver.observe(frame);
  }

  function setPresentationMode(enabled) {
    body.classList.toggle('presentation-mode', enabled);
    toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    toggle.setAttribute('aria-label', enabled ? 'Show site navigation and header' : 'Hide site navigation and header');
    toggle.title = enabled ? 'Show site navigation and header' : 'Hide site navigation and header';
    requestAnimationFrame(notifyFrameResize);
    setTimeout(notifyFrameResize, 350);
    if (enabled) frame.focus();
  }

  document.querySelector('.presentation-main')?.addEventListener('transitionend', function (event) {
    if (event.propertyName === 'inset' || event.propertyName === 'padding') notifyFrameResize();
  });

  toggle.addEventListener('click', function () {
    setPresentationMode(!body.classList.contains('presentation-mode'));
  });
})();
