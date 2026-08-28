(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const navDots = document.getElementById('navDots');
  const counter = document.getElementById('slideCounter');
  const sectionName = document.getElementById('sectionName');
  const progress = document.getElementById('progressFill');
  const previous = document.getElementById('previousSlide');
  const next = document.getElementById('nextSlide');
  const reasonDialogs = Array.from(document.querySelectorAll('.reason-dialog'));
  let current = 0;
  let touchStart = null;

  window.__shouldWeBuildAgi = {
    status: 'initialising',
    slideCount: slides.length,
    currentSlide: 1,
    pretext: 'pending',
    layouts: {},
  };

  function slideFromLocation() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) return 0;
    return Math.max(0, Math.min(slides.length - 1, Number(match[1]) - 1));
  }

  function updateLocation(index) {
    const hash = `#slide-${index + 1}`;
    if (window.location.hash === hash) return;
    history.replaceState(null, '', hash);
  }

  function closeReasonDialogs() {
    reasonDialogs.forEach((dialog) => {
      if (dialog.open) dialog.close();
    });
  }

  function showSlide(index, options = {}) {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
    const oldSlide = slides[current];
    const newSlide = slides[nextIndex];

    closeReasonDialogs();
    oldSlide?.classList.remove('active');
    oldSlide?.setAttribute('aria-hidden', 'true');
    newSlide.classList.add('active');
    newSlide.removeAttribute('aria-hidden');
    if (nextIndex !== current || options.resetScroll) newSlide.scrollTop = 0;
    current = nextIndex;

    const section = newSlide.dataset.section || '';
    const name = newSlide.dataset.name || `Slide ${current + 1}`;
    counter.textContent = `${current + 1} / ${slides.length}`;
    sectionName.textContent = section;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;

    navDots.querySelectorAll('.nav-dot').forEach((dot, index) => {
      const active = index === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'step' : 'false');
      dot.tabIndex = active ? 0 : -1;
    });

    document.title = `${name} — Should We Build AGI?`;
    window.__shouldWeBuildAgi.currentSlide = current + 1;
    window.__shouldWeBuildAgi.status = 'ready';
    if (!options.skipHash) updateLocation(current);
    window.dispatchEvent(new CustomEvent('agi-slide-change', { detail: { index: current, slide: newSlide } }));
  }

  slides.forEach((slide, index) => {
    if (index !== 0) slide.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'nav-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.dataset.name || ''}`);
    dot.addEventListener('click', () => showSlide(index, { resetScroll: true }));
    navDots.appendChild(dot);
  });

  previous.addEventListener('click', () => showSlide(current - 1, { resetScroll: true }));
  next.addEventListener('click', () => showSlide(current + 1, { resetScroll: true }));

  document.querySelectorAll('[data-go]').forEach((button) => {
    button.addEventListener('click', () => showSlide(Number(button.dataset.go), { resetScroll: true }));
  });

  document.querySelectorAll('[data-reason-dialog]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (document.documentElement.dataset.editorMode === 'editing' && event.target instanceof Element && event.target.closest('[data-editor-key]')) return;
      const dialog = document.getElementById(button.dataset.reasonDialog);
      if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
    });
  });

  reasonDialogs.forEach((dialog) => {
    dialog.querySelector('.reason-dialog-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (document.querySelector('.reason-dialog[open]')) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], .table-scroll, .ledger-scroll')) return;
    if (target instanceof HTMLButtonElement && event.key === ' ') return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      showSlide(current + 1, { resetScroll: true });
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      showSlide(current - 1, { resetScroll: true });
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0, { resetScroll: true });
    } else if (event.key === 'End') {
      event.preventDefault();
      showSlide(slides.length - 1, { resetScroll: true });
    }
  });

  document.addEventListener('touchstart', (event) => {
    touchStart = null;
    if (document.querySelector('.reason-dialog[open]')) return;
    if (event.touches.length !== 1) return;
    if (event.target instanceof Element && event.target.closest('.table-scroll, .ledger-scroll, [contenteditable="plaintext-only"], .inline-editor-toolbar')) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  document.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    showSlide(current + (dx < 0 ? 1 : -1), { resetScroll: true });
  }, { passive: true });

  window.addEventListener('hashchange', () => showSlide(slideFromLocation(), { skipHash: true, resetScroll: true }));
  window.addEventListener('message', (event) => {
    if (event.origin === window.location.origin && event.data === 'mint-presentation-resize') {
      window.dispatchEvent(new CustomEvent('agi-frame-resize'));
    }
  });

  showSlide(slideFromLocation(), { skipHash: true, resetScroll: true });
})();
