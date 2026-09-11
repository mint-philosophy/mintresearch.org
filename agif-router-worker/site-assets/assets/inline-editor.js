const deckId = document.documentElement.dataset.editorDeck || '';
const endpoint = `/editor/v1/decks/${deckId}`;
const fields = [];
const savedValues = new Map();
let revision = 'base';
let editing = false;
let canEdit = false;
const controlsPreferenceKey = `agi-editor-controls-hidden:${deckId}`;

const excluded = [
  '[aria-hidden="true"]', '.prompt-number',
  '.plan-number', '.short-rule', '.reason-dialog-close', '.reason-card-action', '.ellipsis-row *',
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
    // Keep saved edits attached to a slide when its display position changes.
    const editorIndex = Number(slide.dataset.editorIndex) || slideIndex + 1;
    slide.querySelectorAll('[data-pretext], h1, h2, h3, h4, p, li, th, td, span, small, div, b, strong, em, i').forEach((element) => {
      // Pretext replaces a block's inline markup during layout. Register the
      // block itself, rather than descendants that will become detached.
      if (element.matches(excluded) || element.parentElement?.closest('[data-pretext]')) return;
      if (element.children.length > 0 && !element.matches('[data-pretext]')) return;
      const source = normaliseText(element.textContent);
      if (!source) return;
      const classes = [...element.classList].filter((name) => name !== 'active').sort().join('.');
      const descriptor = `${editorIndex}|${element.tagName}|${classes}|${source}`;
      const duplicateNumber = (duplicates.get(descriptor) || 0) + 1;
      duplicates.set(descriptor, duplicateNumber);
      const key = `s${String(editorIndex).padStart(2, '0')}-${hashText(descriptor)}-${String(duplicateNumber).padStart(2, '0')}`;
      element.dataset.editorKey = key;
      fields.push({ element, key });
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
    return window.localStorage.getItem(controlsPreferenceKey) === 'true';
  } catch {
    return false;
  }
}

function rememberControlsHidden(hidden) {
  try {
    window.localStorage.setItem(controlsPreferenceKey, String(hidden));
  } catch {
    // Editing still works if storage is blocked; only the visibility preference resets.
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

async function authenticateEditor() {
  if (canEdit) return true;
  const password = window.prompt('Editor password');
  if (password === null) return false;
  setToolbarMode('saving', 'Unlocking…');
  try {
    const response = await fetch('/editor/v1/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'same-origin',
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.canEdit !== true) {
      throw new Error(body.error || `Unlock failed (${response.status})`);
    }
    canEdit = true;
    return true;
  } catch (error) {
    setToolbarMode('view', error.message || 'Editor unlock failed');
    return false;
  }
}

async function enterEditMode() {
  if (!(await authenticateEditor())) return;
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
      credentials: 'same-origin',
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) canEdit = false;
      throw new Error(body.error || `Save failed (${response.status})`);
    }
    revision = body.revision;
    applyValues(body.fields || {});
    leaveEditMode();
    setToolbarMode('view', 'Saved live');
  } catch (error) {
    setToolbarMode('edit', error.message || 'Save failed');
  }
}

function revealWhenLayoutReady() {
  const revealControls = () => setControlsHidden(controlsAreHidden(), { remember: false });
  const state = document.documentElement.dataset.pretextStatus;
  if (state === 'ready' || state === 'fallback') return revealControls();
  window.addEventListener('agi-pretext-state', revealControls, { once: true });
}

async function initialiseEditor() {
  if (!deckId) return;
  editableLeaves();
  const toolbar = document.getElementById('inlineEditorToolbar');
  const edit = document.getElementById('inlineEditorEdit');
  const saveButton = document.getElementById('inlineEditorSave');
  const cancel = document.getElementById('inlineEditorCancel');
  const hide = document.getElementById('inlineEditorHide');
  const reveal = document.getElementById('inlineEditorReveal');
  if (!toolbar || !edit || !saveButton || !cancel || !hide || !reveal) return;

  edit.addEventListener('click', () => void enterEditMode());
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

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!response.ok) return;
    const state = await response.json();
    revision = state.revision || 'base';
    applyValues(state.fields || {});
    canEdit = state.canEdit === true;
    if (state.canRequestEdit === true) revealWhenLayoutReady();
  } catch {
    // The static deck remains readable and editor controls remain hidden.
  }
}

window.__agiEditorReady = initialiseEditor();
window.__agiEditor = { deckId, endpoint, fields, get editing() { return editing; } };
