(function (root, document) {
  'use strict';

  var VERSION = '1.2.0';
  var scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : 'https://mintresearch.org/assets/mint-site-nav.v1.js';
  var defaultSiteOrigin = new URL('/', scriptUrl).origin;
  var renderCount = 0;

  /* Primary navigation is deliberately smaller than sitemap.xml: generated
     newsletter issues and reports are discoverable from their index pages. */
  var canonicalItems = [
    {
      id: 'about',
      type: 'page',
      href: '/',
      label: 'About MINT Lab',
      sections: [
        { id: 'about-overview', href: '/#about', label: 'About' },
        { id: 'about-people', href: '/#people', label: 'People' },
        { id: 'about-papers', href: '/#papers', label: 'Papers' },
        { id: 'about-events', href: '/#events', label: 'Events' },
        { id: 'about-news', href: '/#news', label: 'News' },
        { id: 'about-contact', href: '/#contact', label: 'Contact' }
      ]
    },
    {
      id: 'cv',
      type: 'page',
      href: '/cv/',
      label: 'Seth Lazar CV',
      sections: [
        { id: 'cv-employment', href: '/cv/#employment', label: 'Employment' },
        { id: 'cv-education', href: '/cv/#education', label: 'Education' },
        { id: 'cv-fellowships', href: '/cv/#fellowships', label: 'Fellowships' },
        { id: 'cv-books', href: '/cv/#books', label: 'Books & Symposia' },
        { id: 'cv-papers', href: '/cv/#papers', label: 'Papers' },
        { id: 'cv-other-writing', href: '/cv/#other-writing', label: 'Other Writing' },
        { id: 'cv-grants', href: '/cv/#grants', label: 'Grants' },
        { id: 'cv-events', href: '/cv/#events', label: 'Events' },
        { id: 'cv-presentations', href: '/cv/#presentations', label: 'Presentations' },
        { id: 'cv-impact', href: '/cv/#impact', label: 'Impact' },
        { id: 'cv-supervision', href: '/cv/#supervision', label: 'Supervision' },
        { id: 'cv-teaching', href: '/cv/#teaching', label: 'Teaching' },
        { id: 'cv-service', href: '/cv/#service', label: 'Service' }
      ]
    },
    {
      id: 'guide',
      type: 'page',
      href: '/guide/',
      label: 'Lab Infrastructure',
      sections: [
        { id: 'guide-overview', href: '/guide/#overview', label: 'Overview' },
        { id: 'guide-what-is-this', href: '/guide/#what-is-this', label: 'What Is This?' },
        { id: 'guide-content-pipeline', href: '/guide/#content-pipeline', label: 'Content Pipeline' },
        { id: 'guide-corpus', href: '/guide/#corpus', label: 'Corpus Ingestion' },
        { id: 'guide-corpus-overview', href: '/guide/#corpus-overview', label: 'The Corpus' },
        { id: 'guide-corpus-search', href: '/guide/#corpus-search', label: 'Corpus Search' },
        { id: 'guide-persona', href: '/guide/#persona', label: 'Minty Persona' },
        { id: 'guide-daemons', href: '/guide/#daemons', label: 'Daemons' },
        { id: 'guide-timeline', href: '/guide/#timeline', label: 'Schedule' },
        {
          id: 'guide-members',
          href: '/guide/#guide',
          label: 'For Lab Members',
          divider: 'Practical Guide',
          children: [
            { id: 'guide-bots', href: '/guide/#bots', label: 'Bots' },
            { id: 'guide-slack', href: '/guide/#slack-channels', label: 'Slack Channels' }
          ]
        },
        { id: 'guide-agents', href: '/guide/#agents', label: 'Agent Engineering' },
        { id: 'guide-integrations', href: '/guide/#integrations', label: 'Integrations' },
        { id: 'guide-subscribe', href: '/guide/#subscribe', label: 'Subscribe' }
      ]
    },
    {
      id: 'newsletters',
      type: 'page',
      href: '/newsletter/',
      label: 'Newsletters',
      sections: [
        { id: 'newsletter-yesterday', href: '/newsletter/#yesterday-in-ai', label: 'Yesterday in AI' },
        { id: 'newsletter-computing', href: '/newsletter/#philosophy-of-computing', label: 'Philosophy of Computing' },
        { id: 'newsletter-archive', href: '/newsletter/#back-issues', label: 'YinAI Archive' }
      ]
    },
    {
      id: 'microsites',
      type: 'group',
      label: 'Microsites',
      children: [
        { id: 'governing-with-agents', type: 'page', href: '/governing-with-agents/', label: 'Governing with Agents' },
        { id: 'ai-culture', type: 'page', href: '/ai-culture/', label: 'AI (etc)' },
        { id: 'blind-refusal', type: 'page', href: 'https://blindrefusal.mintresearch.org/', label: 'Blind Refusal' },
        { id: 'moral-reasoning', type: 'page', href: '/lab-overview/', label: 'Can Machines Reason Morally?' },
        { id: 'normative-competence', type: 'page', href: '/nc/', label: 'Evaluating LLM Normative Competence' },
        { id: 'agi-policy-student', type: 'page', href: '/FDC', label: 'The AGI-Ready Policy Student' },
        { id: 'navigating-agi-reckoning', type: 'page', href: '/navigating/', label: 'Navigating the AGI Reckoning' },
        { id: 'incoherent-values', type: 'page', href: 'https://coherence.mintresearch.org/', label: 'Incoherent Values?' }
      ]
    },
    { id: 'corpus-map', type: 'page', href: '/corpus-map/', label: 'Corpus Map', sections: [] },
    { id: 'data-dash', type: 'page', href: '/data-dash/', label: 'Data Dash', sections: [] }
  ];

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function targetElement(target) {
    if (typeof target === 'string') return document.querySelector(target);
    return target && target.nodeType === 1 ? target : null;
  }

  function canonicalHref(href, siteOrigin) {
    return new URL(href, siteOrigin + '/').href;
  }

  function localHref(href, currentUrl) {
    if (href.charAt(0) === '#') return href;
    return new URL(href, currentUrl).href;
  }

  function normalPath(pathname) {
    if (pathname === '/') return '/';
    return pathname.replace(/\/+$/, '') + '/';
  }

  function routeMatches(itemHref, currentUrl, siteOrigin) {
    var target;
    try {
      target = new URL(canonicalHref(itemHref, siteOrigin));
    } catch (error) {
      return false;
    }
    if (target.origin !== currentUrl.origin) return false;
    var targetPath = normalPath(target.pathname);
    var currentPath = normalPath(currentUrl.pathname);
    return targetPath === '/' ? currentPath === '/' : currentPath.indexOf(targetPath) === 0;
  }

  function findById(items, id) {
    for (var index = 0; index < items.length; index += 1) {
      if (items[index].id === id) return items[index];
      var nested = findById(items[index].children || [], id);
      if (nested) return nested;
    }
    return null;
  }

  function addLocalSections(items, local) {
    if (!local) return '';
    if (!local.parentId || !Array.isArray(local.sections)) {
      throw new Error('MintSiteNav local config requires parentId and a sections array.');
    }

    var localId = local.currentId || local.id || '';
    var existing = localId ? findById(items, localId) : null;
    var parent = findById(items, local.parentId);
    if (!parent) throw new Error('MintSiteNav local parent was not found: ' + local.parentId);

    local.sections.forEach(function (section) {
      if (!section || !section.id || !section.label || !section.href) {
        throw new Error('Each MintSiteNav local section requires id, label, and href.');
      }
    });

    if (parent.type === 'group' && local.label) {
      if (!localId) throw new Error('An injected MintSiteNav microsite requires currentId or id.');
      if (!existing) {
        existing = {
          id: localId,
          type: 'page',
          href: local.href || '#top',
          label: local.label,
          localPage: true
        };
        parent.children = parent.children || [];
        if (local.position === 'last') parent.children.push(existing);
        else parent.children.unshift(existing);
      }
      existing.localSections = clone(local.sections);
      return localId;
    }

    if (parent.type === 'group') {
      throw new Error('A MintSiteNav paper injected into a group requires label and currentId or id.');
    }

    parent.localSections = clone(local.sections);
    return localId || parent.id;
  }

  function mark(text, className) {
    var span = document.createElement('span');
    span.className = className || 'nav-mark';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = text;
    return span;
  }

  function appendLabel(element, label) {
    element.appendChild(document.createTextNode(label));
  }

  function addControlledId(element, id) {
    var current = element.getAttribute('aria-controls');
    element.setAttribute('aria-controls', current ? current + ' ' + id : id);
  }

  function isSectionCurrent(href, currentUrl, siteOrigin, local) {
    var resolved;
    try {
      resolved = new URL(local ? localHref(href, currentUrl.href) : canonicalHref(href, siteOrigin), currentUrl.href);
    } catch (error) {
      return false;
    }
    return Boolean(
      resolved.hash &&
      resolved.origin === currentUrl.origin &&
      normalPath(resolved.pathname) === normalPath(currentUrl.pathname) &&
      resolved.hash === currentUrl.hash
    );
  }

  function sectionLink(section, context, options) {
    var link = document.createElement('a');
    var current = isSectionCurrent(section.href, context.currentUrl, context.siteOrigin, options.local);
    link.className = 'nav-link nav-section' + (options.subLink ? ' sub-link' : '') + (options.depth > 2 ? ' nav-subsection' : '') + (current ? ' active' : '');
    link.href = options.local
      ? localHref(section.href, context.currentUrl.href)
      : canonicalHref(section.href, context.siteOrigin);
    if (options.local) link.setAttribute('data-page-anchor', '');
    link.setAttribute('data-nav-depth', String(options.depth));
    if (current) link.setAttribute('aria-current', 'location');
    link.appendChild(mark(options.last ? '└──' : '├──'));
    appendLabel(link, section.label);
    return link;
  }

  function renderSections(sections, context, options) {
    var fragment = document.createDocumentFragment();
    var depth = options.depth || (options.subLink ? 2 : 1);
    sections.forEach(function (section, index) {
      if (section.divider) {
        var divider = document.createElement('div');
        divider.className = 'nav-divider';
        divider.setAttribute('role', 'separator');
        divider.textContent = section.divider;
        fragment.appendChild(divider);
      }
      var children = section.children || [];
      var last = index === sections.length - 1 && children.length === 0;
      fragment.appendChild(sectionLink(section, context, {
        local: options.local,
        subLink: options.subLink,
        depth: depth,
        last: last
      }));
      children.forEach(function (child, childIndex) {
        fragment.appendChild(sectionLink(child, context, {
          local: options.local,
          subLink: true,
          depth: depth + 1,
          last: childIndex === children.length - 1
        }));
      });
    });
    return fragment;
  }

  function sectionsContainer(owner, sections, context, options) {
    renderCount += 1;
    var container = document.createElement('div');
    container.id = 'mint-nav-sections-' + owner.id + '-' + renderCount;
    container.className = 'nav-sections' + (options.local ? ' nav-local-sections' : '') + (options.expanded ? ' expanded' : '');
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', options.local ? owner.label + ' page sections' : owner.label + ' sections');
    if (!options.expanded) container.hidden = true;
    container.appendChild(renderSections(sections, context, {
      local: options.local,
      subLink: options.subLink,
      depth: options.depth
    }));
    return container;
  }

  function pageLink(page, context, options) {
    var active = context.currentId
      ? context.currentId === page.id
      : routeMatches(page.href, context.currentUrl, context.siteOrigin);
    var link = document.createElement('a');
    link.className = 'nav-link ' + (options.child ? 'nav-section' : 'nav-page') + (active ? ' active' : '');
    link.href = page.localPage
      ? localHref(page.href, context.currentUrl.href)
      : canonicalHref(page.href, context.siteOrigin);
    link.setAttribute('data-nav-id', page.id);
    if (active) {
      link.setAttribute('aria-current', 'page');
      if (options.child) link.setAttribute('data-microsite-current', '');
    }
    link.appendChild(mark(options.child ? (options.last ? '└──' : '├──') : (active ? '❯' : '▸')));
    appendLabel(link, page.label);
    return { element: link, active: active };
  }

  function renderPage(page, context, options) {
    var fragment = document.createDocumentFragment();
    var result = pageLink(page, context, options);
    var allSections = page.sections || [];
    var hasCanonicalSections = allSections.length > 0;
    var hasLocalSections = Boolean(page.localSections && page.localSections.length);
    var expanded = result.active || page.alwaysExpanded;

    if (hasCanonicalSections || hasLocalSections) {
      result.element.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
    fragment.appendChild(result.element);

    if (hasCanonicalSections) {
      var canonicalContainer = sectionsContainer(page, allSections, context, {
        expanded: expanded,
        local: false,
        subLink: false,
        depth: 1
      });
      addControlledId(result.element, canonicalContainer.id);
      fragment.appendChild(canonicalContainer);
    }
    if (hasLocalSections) {
      var localContainer = sectionsContainer(page, page.localSections, context, {
        expanded: expanded,
        local: true,
        subLink: true,
        depth: options.child ? 2 : 1
      });
      addControlledId(result.element, localContainer.id);
      fragment.appendChild(localContainer);
    }
    return fragment;
  }

  function renderGroup(group, context) {
    var fragment = document.createDocumentFragment();
    var active = (group.children || []).some(function (page) {
      return context.currentId ? context.currentId === page.id : routeMatches(page.href, context.currentUrl, context.siteOrigin);
    });
    var expanded = Boolean(group.alwaysExpanded || active);
    var heading = document.createElement('button');
    heading.type = 'button';
    heading.className = 'nav-link nav-page nav-group';
    heading.setAttribute('data-nav-id', group.id);
    heading.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    var groupMark = mark(expanded ? '▾' : '▸');
    heading.appendChild(groupMark);
    appendLabel(heading, group.label);
    fragment.appendChild(heading);

    renderCount += 1;
    var children = document.createElement('div');
    children.id = 'mint-nav-group-' + group.id + '-' + renderCount;
    children.className = 'nav-sections nav-site-group' + (expanded ? ' expanded' : '');
    children.setAttribute('role', 'group');
    children.setAttribute('aria-label', group.label);
    children.hidden = !expanded;
    addControlledId(heading, children.id);
    (group.children || []).forEach(function (page, index) {
      children.appendChild(renderPage(page, context, {
        child: true,
        last: index === group.children.length - 1
      }));
    });
    heading.addEventListener('click', function () {
      expanded = !expanded;
      heading.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      groupMark.textContent = expanded ? '▾' : '▸';
      children.hidden = !expanded;
      if (expanded) children.classList.add('expanded');
      else children.classList.remove('expanded');
    });
    fragment.appendChild(children);
    return fragment;
  }

  function render(config) {
    config = config || {};
    var target = targetElement(config.target || '[data-mint-site-nav]');
    if (!target) throw new Error('MintSiteNav.render target was not found.');

    var siteOrigin = (config.siteOrigin || defaultSiteOrigin).replace(/\/+$/, '');
    var currentUrl = new URL(config.currentUrl || root.location.href, root.location.href);
    var items = clone(canonicalItems);
    var localCurrentId = addLocalSections(items, config.local);
    var context = {
      currentId: config.currentId || (config.local && config.local.currentId) || localCurrentId || '',
      currentUrl: currentUrl,
      siteOrigin: siteOrigin
    };
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) {
      fragment.appendChild(item.type === 'group'
        ? renderGroup(item, context)
        : renderPage(item, context, { child: false, last: false }));
    });

    while (target.firstChild) target.removeChild(target.firstChild);
    target.classList.add('nav-pages');
    target.setAttribute('data-mint-site-nav-rendered', '1');
    target.setAttribute('data-mint-site-nav-version', VERSION);
    target.appendChild(fragment);
    target.dispatchEvent(new CustomEvent('mint-site-nav:rendered', {
      bubbles: true,
      detail: {
        target: target,
        version: VERSION,
        currentId: context.currentId,
        currentUrl: currentUrl.href
      }
    }));
    return target;
  }

  function configForDataset(target, defaults) {
    var config = Object.assign({}, defaults || {});
    config.target = target;
    if (target.getAttribute('data-current-id')) config.currentId = target.getAttribute('data-current-id');
    if (target.getAttribute('data-current-url')) config.currentUrl = target.getAttribute('data-current-url');
    if (target.getAttribute('data-site-origin')) config.siteOrigin = target.getAttribute('data-site-origin');
    return config;
  }

  function autoRender(scope, defaults) {
    var parent = scope && scope.querySelectorAll ? scope : document;
    var targets = parent.querySelectorAll('[data-mint-site-nav]');
    return Array.prototype.map.call(targets, function (target) {
      return render(configForDataset(target, defaults));
    });
  }

  deepFreeze(canonicalItems);
  var api = Object.freeze({
    version: VERSION,
    items: canonicalItems,
    render: render,
    autoRender: autoRender
  });
  root.MintSiteNav = api;
  root.dispatchEvent(new CustomEvent('mint-site-nav:ready', { detail: { version: VERSION } }));

  function boot() {
    var config = root.MintSiteNavConfig;
    if (Array.isArray(config)) {
      config.forEach(render);
    } else if (config && typeof config === 'object') {
      render(config);
    } else {
      autoRender(document);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})(window, document);
