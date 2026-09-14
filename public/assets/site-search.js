const fold = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function searchRecords(records, query) {
  const phrase = fold(query).trim();
  const words = phrase.match(/[\p{L}\p{N}]+/gu) || [];
  if (!words.length) return [];
  const matches = records.flatMap(record => {
    if (!/^https?:\/\//i.test(record.url || '')) return [];
    const title = fold(record.title), text = fold(record.text);
    if (!words.every(word => title.includes(word) || text.includes(word))) return [];
    const score = (title.includes(phrase) ? 40 : 0) + words.filter(word => title.includes(word)).length * 12 + (text.includes(phrase) ? 4 : 0);
    const start = Math.max(0, text.indexOf(words[0]) - 65);
    return [{ ...record, score, snippet: (start ? '…' : '') + record.text.slice(start, start + 210) + (record.text.length > start + 210 ? '…' : '') }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return matches.filter((item, i) => matches.findIndex(other => other.url === item.url) === i).slice(0, 20);
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const overlay = document.getElementById('searchOverlay');
  if (!input || !results || !overlay || input.dataset.searchReady) return;
  input.dataset.searchReady = 'true';
  input.placeholder = 'Search MINT pages and publications…';
  input.setAttribute('aria-label', 'Search MINT pages and publications');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'searchResults');
  input.setAttribute('aria-expanded', 'false');
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', 'Search results');
  const status = document.createElement('p');
  status.className = 'mint-search-status';
  status.setAttribute('role', 'status');
  results.before(status);
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('site-search.css', import.meta.url).href;
  document.head.appendChild(css);
  let indexPromise, generation = 0, links = [], active = -1;
  function select(index) {
    active = index;
    links.forEach((link, i) => link.setAttribute('aria-selected', String(i === index)));
    if (links[index]) {
      input.setAttribute('aria-activedescendant', links[index].id);
      links[index].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }
  function clear() {
    results.replaceChildren(); links = []; select(-1); input.setAttribute('aria-expanded', 'false');
  }
  async function update() {
    const token = ++generation, query = input.value.trim();
    clear();
    if (!query) { status.textContent = 'Search public pages and publications.'; return; }
    status.textContent = 'Searching…';
    try {
      indexPromise ||= fetch(new URL('search-index.json', import.meta.url), { credentials: 'omit' }).then(response => {
        if (!response.ok) throw new Error('Search unavailable');
        return response.json();
      }).catch(error => { indexPromise = null; throw error; });
      const records = await indexPromise;
      if (token !== generation) return;
      const matches = searchRecords(records, query);
      status.textContent = matches.length ? `${matches.length === 20 ? 'Top ' : ''}${matches.length} result${matches.length === 1 ? '' : 's'}` : 'No results. Try another name or keyword.';
      links = matches.map((record, i) => {
        const link = document.createElement('a');
        link.className = 'mint-search-result'; link.id = `mint-search-result-${i}`; link.href = record.url;
        link.setAttribute('role', 'option'); link.setAttribute('aria-selected', 'false');
        for (const [tag, text] of [['strong', record.title], ['span', record.snippet]]) {
          const element = document.createElement(tag); element.textContent = text; link.appendChild(element);
        }
        link.addEventListener('click', () => overlay.classList.remove('open'));
        results.appendChild(link); return link;
      });
      input.setAttribute('aria-expanded', String(links.length > 0));
    } catch {
      if (token !== generation) return;
      status.textContent = 'Search could not load. ';
      const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Try again';
      retry.addEventListener('click', update); status.appendChild(retry);
    }
  }
  input.addEventListener('input', update);
  input.addEventListener('focus', update);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (links.length && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      select(active === -1 ? (event.key === 'ArrowDown' ? 0 : links.length - 1) : (active + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length);
    } else if (links.length && event.key === 'Enter') {
      event.preventDefault(); links[Math.max(active, 0)].click();
    } else if (event.key === 'Escape') {
      overlay.classList.remove('open'); input.blur();
      const trigger = document.getElementById('searchTrigger'); trigger?.setAttribute('tabindex', '0'); trigger?.focus();
    }
  });
}
if (typeof document !== 'undefined') setupSearch();
