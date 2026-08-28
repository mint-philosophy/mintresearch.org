const endpoints = [
  'https://agi-editor.mintresearch.org/v1/decks/should-we-build-agi',
  'https://mint-agi-inline-editor.mintlabjhu.workers.dev/v1/decks/should-we-build-agi',
  'https://agi-inline-editor.mintresearch.org/v1/decks/should-we-build-agi',
];
let endpoint = endpoints[0];
const fields = [];
const savedValues = new Map();
let revision = 'base';
let editing = false;
const controlsPreferenceKey = 'agi-editor-controls-hidden';

const excluded = [
  '[aria-hidden="true"]',
  '.prompt-number',
  '.definition-number',
  '.state-number',
  '.short-rule',
  '.reason-dialog-close',
  '.reason-card-action',
  '.ellipsis-row *',
].join(',');

function normaliseText(value) {
  return String(value || '').trim().replace(/[ \t\r\n\f]+/g, ' ');
}

function hashText(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function editableLeaves() {
  const duplicates = new Map();
  document.querySelectorAll('.slide').forEach((slide, slideIndex) => {
    slide.querySelectorAll('h1, h2, h3, p, li, th, td, span, small, div').forEach((element) => {
      if (element.matches(excluded)) return;
      if (element.children.length > 0) return;
      const source = normaliseText(element.textContent);
      if (!source) return;

      const classes = [...element.classList].filter((name) => name !== 'active').sort().join('.');
      const descriptor = `${slideIndex + 1}|${element.tagName}|${classes}|${source}`;
      const duplicateNumber = (duplicates.get(descriptor) || 0) + 1;
      duplicates.set(descriptor, duplicateNumber);
      const key = `s${String(slideIndex + 1).padStart(2, '0')}-${hashText(descriptor)}-${String(duplicateNumber).padStart(2, '0')}`;

      element.dataset.editorKey = key;
      fields.push({ element, key, slide: slideIndex + 1 });
      savedValues.set(key, source);
    });
  });
}

function applyValues(values) {
  for (const field of fields) {
    if (Object.hasOwn(values, field.key) && typeof values[field.key] === 'string') {
      field.element.textContent = values[field.key];
      savedValues.set(field.key, values[field.key]);
    }
  }
}

function setToolbarMode(mode, message = '') {
  const edit = document.getElementById('inlineEditorEdit');
  const save = document.getElementById('inlineEditorSave');
  const cancel = document.getElementById('inlineEditorCancel');
  const hide = document.getElementById('inlineEditorHide');
  const status = document.getElementById('inlineEditorStatus');
  edit.hidden = mode !== 'view';
  save.hidden = mode !== 'edit';
  cancel.hidden = mode !== 'edit';
  hide.hidden = mode !== 'view';
  save.disabled = mode === 'saving';
  cancel.disabled = mode === 'saving';
  status.textContent = message;
}

function controlsAreHidden() {
  try {
    const saved = window.localStorage.getItem(controlsPreferenceKey);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

function rememberControlsHidden(hidden) {
  try {
    window.localStorage.setItem(controlsPreferenceKey, String(hidden));
  } catch {
    // The editor still works if storage is blocked; it simply resets to compact mode.
  }
}

function setControlsHidden(hidden, { remember = true } = {}) {
  const toolbar = document.getElementById('inlineEditorToolbar');
  const reveal = document.getElementById('inlineEditorReveal');
  if (!toolbar || !reveal || (editing && hidden)) return;
  toolbar.hidden = hidden;
  reveal.hidden = !hidden;
  reveal.setAttribute('aria-expanded', String(!hidden));
  if (remember) rememberControlsHidden(hidden);
}

function makePlainTextPaste(event) {
  event.preventDefault();
  const text = normaliseText(event.clipboardData?.getData('text/plain'));
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function enterEditMode() {
  editing = true;
  window.__agiPretext?.suspend();
  document.documentElement.dataset.editorMode = 'editing';
  for (const field of fields) {
    field.element.setAttribute('contenteditable', 'plaintext-only');
    field.element.setAttribute('spellcheck', 'true');
    field.element.addEventListener('paste', makePlainTextPaste);
  }
  setToolbarMode('edit', 'Editing — click any outlined text');
}

function leaveEditMode({ restore = false } = {}) {
  if (restore) {
    for (const field of fields) field.element.textContent = savedValues.get(field.key) ?? '';
  }
  for (const field of fields) {
    field.element.removeAttribute('contenteditable');
    field.element.removeAttribute('spellcheck');
    field.element.removeEventListener('paste', makePlainTextPaste);
  }
  editing = false;
  delete document.documentElement.dataset.editorMode;
  window.__agiPretext?.resume();
}

function currentValues() {
  return Object.fromEntries(fields.map(({ element, key }) => [key, normaliseText(element.textContent)]));
}

async function save() {
  setToolbarMode('saving', 'Saving…');
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revision, fields: currentValues() }),
      credentials: 'omit',
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Save failed (${response.status})`);

    revision = body.revision;
    applyValues(body.fields || {});
    leaveEditMode();
    setToolbarMode('view', 'Saved live');
  } catch (error) {
    setToolbarMode('edit', error.message || 'Save failed');
  }
}

function waitForPretextBeforeReveal() {
  const revealControls = () => setControlsHidden(controlsAreHidden(), { remember: false });
  const state = document.documentElement.dataset.pretextStatus;
  if (state === 'ready' || state === 'fallback') {
    revealControls();
    return;
  }
  window.addEventListener('agi-pretext-state', revealControls, { once: true });
}

async function initialiseEditor() {
  editableLeaves();
  const toolbar = document.getElementById('inlineEditorToolbar');
  const edit = document.getElementById('inlineEditorEdit');
  const saveButton = document.getElementById('inlineEditorSave');
  const cancel = document.getElementById('inlineEditorCancel');
  const hide = document.getElementById('inlineEditorHide');
  const reveal = document.getElementById('inlineEditorReveal');
  if (!toolbar || !edit || !saveButton || !cancel || !hide || !reveal) return;

  edit.addEventListener('click', enterEditMode);
  saveButton.addEventListener('click', save);
  hide.addEventListener('click', () => setControlsHidden(true));
  reveal.addEventListener('click', () => setControlsHidden(false));
  cancel.addEventListener('click', () => {
    leaveEditMode({ restore: true });
    setToolbarMode('view', 'Changes discarded');
  });
  document.addEventListener('keydown', (event) => {
    if (!editing || event.key !== 'Enter' || !(event.target instanceof Element) || !event.target.closest('[contenteditable="plaintext-only"]')) return;
    event.preventDefault();
    event.target.blur();
  });

  for (const candidate of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2_500);
    try {
      const response = await fetch(candidate, {
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: controller.signal,
      });
      if (!response.ok) continue;
      const state = await response.json();
      endpoint = candidate;
      revision = state.revision || 'base';
      applyValues(state.fields || {});
      if (state.canEdit === true) waitForPretextBeforeReveal();
      break;
    } catch {
      // Try the next hostname. This also works around stale negative DNS caches.
    } finally {
      clearTimeout(timeout);
    }
  }
}

window.__agiEditorReady = initialiseEditor();
window.__agiEditor = { endpoints, fields, get endpoint() { return endpoint; }, get editing() { return editing; } };
