export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function externalLink(label, href, className = '') {
  const link = element('a', className, label);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

export function setupGallery(options) {
  const root = document.querySelector(options.root);
  if (!root) return;
  const buttons = Array.from(document.querySelectorAll(options.buttonSelector));
  const search = document.querySelector(options.searchSelector);
  const count = document.querySelector(options.countSelector);
  const empty = document.querySelector(options.emptySelector);
  let filter = 'all';

  const siteSearchTrigger = document.querySelector('#searchTrigger');
  const siteSearchOverlay = document.querySelector('#searchOverlay');

  function focusCollectionSearch() {
    siteSearchOverlay?.classList.remove('open');
    search?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    search?.focus({ preventScroll: true });
  }

  if (siteSearchTrigger && search && !siteSearchTrigger.dataset.collectionSearchBound) {
    siteSearchTrigger.dataset.collectionSearchBound = 'true';
    siteSearchTrigger.setAttribute('aria-controls', search.id);
    siteSearchTrigger.addEventListener('click', () => window.setTimeout(focusCollectionSearch, 0));
    document.addEventListener('keydown', (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      focusCollectionSearch();
    }, true);
  }

  function refresh() {
    const query = (search?.value || '').trim().toLowerCase();
    const cards = Array.from(root.querySelectorAll(options.cardSelector));
    let visible = 0;
    cards.forEach((card) => {
      const values = (card.dataset.filterValues || '').split(/\s+/);
      const matchesFilter = filter === 'all' || values.includes(filter);
      const matchesQuery = !query || (card.dataset.search || card.textContent).toLowerCase().includes(query);
      card.hidden = !(matchesFilter && matchesQuery);
      if (!card.hidden) visible += 1;
    });
    if (count) count.textContent = `${visible} / ${cards.length}`;
    if (empty) empty.hidden = visible !== 0;
    root.dispatchEvent(new CustomEvent('mint-gallery:updated', {
      detail: { visible, total: cards.length, filter, query }
    }));
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      filter = button.dataset.filterValue || 'all';
      buttons.forEach((candidate) => {
        candidate.setAttribute('aria-pressed', String(candidate === button));
      });
      refresh();
    });
  });

  search?.addEventListener('input', refresh);
  refresh();
}

export function showSubmissionReceipt() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('submitted') !== '1') return;
  const receipt = document.querySelector('[data-submission-receipt]');
  if (receipt) receipt.hidden = false;
}

export async function loadCuratorNotes(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return;
    const notes = await response.json();
    document.querySelectorAll('[data-note-id]').forEach((slot) => {
      const note = notes[slot.dataset.noteId];
      if (typeof note !== 'string' || !note.trim()) return;
      slot.textContent = note.trim();
      slot.hidden = false;
    });
  } catch (_) {
    /* Notes are an optional editorial layer; the bibliography remains usable. */
  }
}
