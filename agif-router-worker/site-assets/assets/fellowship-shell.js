(function () {
  var body = document.body;
  var currentDay = body.dataset.fellowshipDay || '';
  var pageTitle = body.dataset.presentationTitle || document.title;

  var days = [
    { id: 'definitions', label: 'Definitions', href: '/definitions/' },
    { id: 'day-1', label: 'Day 1', href: '/day-1/' },
    { id: 'day-2', label: 'Day 2', href: '/day-2/' },
    { id: 'day-3', label: 'Day 3', href: '/day-3/' },
    { id: 'projects', label: 'Projects', href: '/projects/' }
  ];
  var dayLinks = days.map(function (day, index) {
    var marker = index === days.length - 1 ? '└──' : '├──';
    var active = currentDay === day.id ? ' active' : '';
    var current = currentDay === day.id ? ' aria-current="page"' : '';
    return '<a class="nav-link nav-page' + active + '" href="' + day.href + '"' + current + '><span class="nav-mark">' + marker + '</span> ' + day.label + '</a>';
  }).join('');

  var chrome = document.getElementById('siteChrome');
  chrome.innerHTML =
    '<button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open Fellowship menu">' +
      '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 6h14M4 11h14M4 16h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>' +
    '</button>' +
    '<div class="mobile-overlay" id="mobileOverlay"></div>' +
    '<nav class="sidebar" id="sidebar" aria-label="Fellowship navigation">' +
      '<a href="https://mintresearch.org/" class="sidebar-header" style="text-decoration:none"><span class="sidebar-title">MINT</span><span class="sidebar-sub">Research Lab</span></a>' +
      '<div class="fellowship-nav-label">AGI Governance Fellowship</div>' +
      '<div class="nav-pages">' +
        '<a class="nav-link nav-page" href="/"><span class="nav-mark">▸</span> Overview</a>' +
        dayLinks +
        '<a class="nav-link nav-page" href="/logout"><span class="nav-mark">×</span> Sign out</a>' +
        '<a class="nav-link nav-page" href="https://mintresearch.org/"><span class="nav-mark">←</span> MINT Research Lab</a>' +
      '</div>' +
    '</nav>' +
    '<button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" title="Toggle sidebar">«</button>' +
    '<div class="top-banner" aria-label="MINT Lab masthead"></div>' +
    '<div class="statusline" id="statusline">' +
      '<div class="statusline-row statusline-row-top"><span class="statusline-site">fellowship.mintresearch.org</span><span class="statusline-section" id="statusSection">' + pageTitle + '</span></div>' +
      '<div class="statusline-row statusline-row-bottom"><img src="/assets/minty-teal.png" alt="" class="statusline-minty"><div class="statusline-progress"><span class="statusline-bar" id="statusBar"></span><span class="statusline-pct" id="statusPct">100%</span></div><span class="statusline-tokens" id="tokenDisplay"><span class="arrow">↓</span> slides</span></div>' +
    '</div>';

  var statusline = chrome.querySelector('.statusline');
  function measureFrameChrome() {
    document.documentElement.style.setProperty('--presentation-status-h', statusline.getBoundingClientRect().height + 'px');
  }
  measureFrameChrome();
  window.addEventListener('load', measureFrameChrome);
  window.addEventListener('resize', measureFrameChrome);
  if ('ResizeObserver' in window) new ResizeObserver(measureFrameChrome).observe(statusline);

  var toggle = document.getElementById('presentationModeToggle');
  var frame = document.getElementById('presentationFrame');

  function notifyFrameResize() {
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage('mint-presentation-resize', window.location.origin);
    try {
      frame.contentWindow.dispatchEvent(new Event('resize'));
      frame.contentWindow.refitFdcSlides?.();
    } catch (error) {
      // Cross-origin presentation frames still receive the postMessage path.
    }
  }

  frame.addEventListener('load', notifyFrameResize);
  if ('ResizeObserver' in window) new ResizeObserver(notifyFrameResize).observe(frame);

  function setPresentationMode(enabled) {
    body.classList.toggle('presentation-mode', enabled);
    toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    toggle.setAttribute('aria-label', enabled ? 'Show Fellowship navigation and header' : 'Hide Fellowship navigation and header');
    toggle.title = enabled ? 'Show Fellowship navigation and header' : 'Hide Fellowship navigation and header';
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
