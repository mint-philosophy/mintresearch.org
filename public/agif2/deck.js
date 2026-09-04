(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const navDots = document.getElementById('navDots');
  const counter = document.getElementById('slideCounter');
  const sectionName = document.getElementById('sectionName');
  const progress = document.getElementById('progressFill');
  const previous = document.getElementById('previousSlide');
  const next = document.getElementById('nextSlide');
  const edgePrevious = document.getElementById('edgePrevious');
  const edgeNext = document.getElementById('edgeNext');
  const fullscreen = document.getElementById('fullscreenToggle');
  let current = 0;
  let touchStart = null;

  window.__agif2 = {
    status: 'initialising',
    slideCount: slides.length,
    currentSlide: 1,
    sourceSha256: 'e1422c6fbc018bf72e18fe959303066fe177e976b1439dba3f1916b1e6d3b624',
  };

  function slideFromLocation() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) return 0;
    return Math.max(0, Math.min(slides.length - 1, Number(match[1]) - 1));
  }

  function updateLocation(index) {
    const hash = `#slide-${index + 1}`;
    if (window.location.hash !== hash) history.replaceState(null, '', hash);
  }

  function loadSlide(index) {
    const slide = slides[index];
    const image = slide?.querySelector('img[data-src]');
    if (!image) return;
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
  }

  function loadNeighbourhood(index) {
    for (let offset = -2; offset <= 2; offset += 1) loadSlide(index + offset);
  }

  function showSlide(index, options = {}) {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
    const oldSlide = slides[current];
    const newSlide = slides[nextIndex];

    oldSlide?.classList.remove('active');
    oldSlide?.setAttribute('aria-hidden', 'true');
    newSlide.classList.add('active');
    newSlide.removeAttribute('aria-hidden');
    current = nextIndex;
    loadNeighbourhood(current);

    const section = newSlide.dataset.section || '';
    const name = newSlide.dataset.name || `Slide ${current + 1}`;
    counter.textContent = `${current + 1} / ${slides.length}`;
    sectionName.textContent = section;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    edgePrevious.disabled = current === 0;
    edgeNext.disabled = current === slides.length - 1;

    navDots.querySelectorAll('.nav-dot').forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'step' : 'false');
      dot.tabIndex = active ? 0 : -1;
      if (active) dot.scrollIntoView({ block: 'nearest', inline: 'center' });
    });

    document.title = `${name} — AGI Institutions`;
    window.__agif2.currentSlide = current + 1;
    window.__agif2.status = 'ready';
    if (!options.skipHash) updateLocation(current);
  }

  slides.forEach((slide, index) => {
    if (index !== 0) slide.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'nav-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.dataset.name || ''}`);
    dot.addEventListener('click', () => showSlide(index));
    navDots.appendChild(dot);
  });

  previous.addEventListener('click', () => showSlide(current - 1));
  next.addEventListener('click', () => showSlide(current + 1));
  edgePrevious.addEventListener('click', () => showSlide(current - 1));
  edgeNext.addEventListener('click', () => showSlide(current + 1));

  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLButtonElement && event.key === ' ') return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      showSlide(current + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      showSlide(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  document.addEventListener('touchstart', (event) => {
    touchStart = null;
    if (event.touches.length !== 1) return;
    if (event.target instanceof Element && event.target.closest('.deck-controls')) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  document.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    showSlide(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  if (!document.documentElement.requestFullscreen) {
    fullscreen.hidden = true;
  } else {
    fullscreen.addEventListener('click', async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const active = Boolean(document.fullscreenElement);
      fullscreen.textContent = active ? '⊡' : '⛶';
      fullscreen.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
    });
  }

  window.addEventListener('hashchange', () => showSlide(slideFromLocation(), { skipHash: true }));
  showSlide(slideFromLocation(), { skipHash: true });
})();
