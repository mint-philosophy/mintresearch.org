// Only the homepage contact form opts into this handler.
const form = document.querySelector('form[data-mint-contact]');
if (form) {
  const submit = form.querySelector('button[type="submit"]');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.style.cssText = 'margin:12px 0;overflow-wrap:anywhere;color:var(--text-1,inherit);scroll-margin:100px';
  form.querySelector('.ct-body').insertBefore(status, form.querySelector('.ct-submit-row'));
  let sending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending...';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams(new FormData(form)),
        credentials: 'omit',
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        status.textContent = typeof result.message === 'string' ? result.message : 'Your message could not be sent. Please try again later.';
        return;
      }
      form.reset();
      status.textContent = result.message;
    } catch {
      status.textContent = 'We could not confirm submission. Your message is still here; please check your connection before trying again.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      status.scrollIntoView({ block: 'nearest' });
    }
  });
}
