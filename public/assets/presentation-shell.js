(function () {
  var body = document.body;
  var currentPath = body.dataset.presentationPath || window.location.pathname;
  var pageTitle = body.dataset.presentationTitle || document.title;

  var pages = [
    {
      path: '/',
      label: 'About MINT Lab',
      sections: [
        ['/#about', 'About'],
        ['/#people', 'People'],
        ['/#papers', 'Publications'],
        ['/#events', 'Events'],
        ['/#news', 'News'],
        ['/#contact', 'Contact']
      ]
    },
    {
      path: '/cv/',
      label: 'Seth Lazar CV',
      sections: [
        ['/cv/#employment', 'Employment'],
        ['/cv/#education', 'Education'],
        ['/cv/#fellowships', 'Fellowships'],
        ['/cv/#books', 'Books & Symposia'],
        ['/cv/#papers', 'Papers'],
        ['/cv/#other-writing', 'Other Writing'],
        ['/cv/#grants', 'Grants'],
        ['/cv/#events', 'Events'],
        ['/cv/#presentations', 'Presentations'],
        ['/cv/#impact', 'Impact'],
        ['/cv/#supervision', 'Supervision'],
        ['/cv/#teaching', 'Teaching'],
        ['/cv/#service', 'Service']
      ]
    },
    {
      path: '/guide/',
      label: 'Lab Infrastructure',
      sections: [
        ['/guide/#overview', 'Overview'],
        ['/guide/#what-is-this', 'What Is This?'],
        ['/guide/#content-pipeline', 'Content Pipeline'],
        ['/guide/#corpus', 'Corpus Ingestion'],
        ['/guide/#corpus-overview', 'The Corpus'],
        ['/guide/#corpus-search', 'Corpus Search'],
        ['/guide/#persona', 'Minty Persona'],
        ['/guide/#daemons', 'Daemons'],
        ['/guide/#timeline', 'Schedule'],
        ['/guide/#guide', 'For Lab Members'],
        ['/guide/#agents', 'Agent Engineering'],
        ['/guide/#integrations', 'Integrations'],
        ['/guide/#subscribe', 'Subscribe']
      ]
    },
    {
      path: '/newsletter/',
      label: 'Newsletters',
      sections: [
        ['/newsletter/#yesterday-in-ai', 'Yesterday in AI'],
        ['/newsletter/#philosophy-of-computing', 'Philosophy of Computing'],
        ['/newsletter/#back-issues', 'YinAI Archive']
      ]
    },
    {
      label: 'Microsites',
      groupOnly: true,
      alwaysExpanded: true,
      sections: [
        ['https://blindrefusal.mintresearch.org/', 'Blind Refusal'],
        ['/lab-overview/', 'Can Machines Reason Morally?'],
        ['/nc/', 'Evaluating LLM Normative Competence'],
        ['/FDC', 'The AGI-Ready Policy Student']
      ]
    },
    { path: '/corpus-map/', label: 'Corpus Map', sections: [] },
    { path: '/data-dash/', label: 'Data Dash', sections: [] }
  ];

  function isActive(path) {
    if (!path || /^https?:\/\//.test(path)) return false;
    if (path === '/') return currentPath === '/';
    return currentPath.indexOf(path) === 0;
  }

  function renderNav() {
    return pages.map(function (page) {
      var active = !page.groupOnly && isActive(page.path);
      var heading = page.groupOnly
        ? '<div class="nav-link nav-page nav-group" role="heading" aria-level="2"><span class="nav-mark">▾</span>' + page.label + '</div>'
        : '<a class="nav-link nav-page' + (active ? ' active' : '') + '" href="' + page.path + '"><span class="nav-mark">' + (active ? '❯' : '▸') + '</span>' + page.label + '</a>';

      if (!page.sections.length) return heading;

      var expanded = active || page.alwaysExpanded;
      var sections = page.sections.map(function (section, index) {
        var href = section[0];
        var sectionActive = isActive(href);
        var mark = index === page.sections.length - 1 ? '└──' : '├──';
        return '<a class="nav-link nav-section' + (sectionActive ? ' active' : '') + '" href="' + href + '"><span class="nav-mark">' + mark + '</span>' + section[1] + '</a>';
      }).join('');

      return heading + '<div class="nav-sections' + (expanded ? ' expanded' : '') + '">' + sections + '</div>';
    }).join('');
  }

  var minties = ['red', 'brown', 'yellow', 'green', 'teal', 'indigo', 'purple', 'cool'];
  var mintyImages = minties.map(function (color, index) {
    return '<img src="/assets/minty-' + color + '.png" alt="" class="top-banner-minty" style="animation-delay:' + (index * 0.3) + 's">';
  }).join('');

  var chrome = document.getElementById('siteChrome');
  chrome.innerHTML =
    '<button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu" title="Open navigation">' +
      '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 6h14M4 11h14M4 16h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>' +
    '</button>' +
    '<div class="mobile-overlay" id="mobileOverlay"></div>' +
    '<nav class="sidebar" id="sidebar" aria-label="Site navigation">' +
      '<a href="/" class="sidebar-header" style="text-decoration:none"><span class="sidebar-title">MINT</span><span class="sidebar-sub">Research Lab</span></a>' +
      '<div class="search-trigger" id="searchTrigger"><span aria-hidden="true">⌕</span> Search... <kbd>⌘K</kbd></div>' +
      '<div class="nav-pages">' + renderNav() + '</div>' +
    '</nav>' +
    '<div class="search-overlay" id="searchOverlay"><div class="search-box"><input type="text" id="searchInput" placeholder="$ grep -r \'query\' ./corpus/"><div class="search-results" id="searchResults"></div></div></div>' +
    '<button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" title="Toggle sidebar">«</button>' +
    '<div class="top-banner"><div class="top-banner-inner">' +
      '<a href="/" style="display:inline-flex"><img src="/assets/mint-banner.png" alt="MINT LAB" class="top-banner-logo"></a>' +
      '<div class="top-banner-minties">' + mintyImages + '</div>' +
    '</div></div>' +
    '<div class="statusline" id="statusline">' +
      '<div class="statusline-row statusline-row-top"><span class="statusline-site">mintresearch.org</span><span class="statusline-section" id="statusSection">' + pageTitle + '</span></div>' +
      '<div class="statusline-row statusline-row-bottom"><img src="/assets/minty-teal.png" alt="" class="statusline-minty"><div class="statusline-progress"><span class="statusline-bar" id="statusBar"></span><span class="statusline-pct" id="statusPct">100%</span></div><span class="statusline-tokens" id="tokenDisplay"><span class="arrow">↓</span> slides</span></div>' +
    '</div>';

  var banner = chrome.querySelector('.top-banner');
  function measureBanner() {
    document.documentElement.style.setProperty('--banner-h', banner.getBoundingClientRect().height + 'px');
  }
  measureBanner();
  window.addEventListener('load', measureBanner);
  window.addEventListener('resize', measureBanner);
  if ('ResizeObserver' in window) new ResizeObserver(measureBanner).observe(banner);

  var toggle = document.getElementById('presentationModeToggle');
  var frame = document.getElementById('presentationFrame');

  function setPresentationMode(enabled) {
    body.classList.toggle('presentation-mode', enabled);
    toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    toggle.setAttribute('aria-label', enabled ? 'Show site navigation and header' : 'Hide site navigation and header');
    toggle.title = enabled ? 'Show site navigation and header' : 'Hide site navigation and header';
    if (enabled) frame.focus();
  }

  toggle.addEventListener('click', function () {
    setPresentationMode(!body.classList.contains('presentation-mode'));
  });
})();
