import { test, expect } from '@playwright/test';

test('contact form reports failures, preserves text, and confirms success inline', async ({ page }, testInfo) => {
  let outcome = 'unavailable';
  let attempts = 0;
  await page.route('https://contact.mintresearch.org/contact', async (route) => {
    attempts++;
    const fields = new URLSearchParams(route.request().postData());
    expect(fields.get('email')).toBe('visitor@example.org');
    expect(fields.get('message')).toBe('Browser verification message.');
    await route.fulfill({
      status: outcome === 'unavailable' ? 503 : outcome === 'blocked' ? 422 : 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: outcome === 'sent', message: outcome === 'unavailable' ? 'Please try again later.' : outcome === 'blocked' ? 'Pangram identified AI-generated text. Your message was not delivered.' : 'Thank you. Your message has been submitted to the lab.' }),
    });
  });
  await page.goto('/#contact');
  const form = page.locator('form[data-mint-contact]');
  await expect(form).toHaveAttribute('action', 'https://contact.mintresearch.org/contact');
  await expect(form.locator('#contact-ai-policy')).toContainText('Seth will not see them');
  await expect(form.locator('#contact-ai-policy')).toContainText('Message text is sent to');
  await expect(page.locator('#contact-message')).toHaveAttribute('aria-describedby', 'contact-ai-policy');
  await page.locator('#contact-name').fill('Browser test');
  await page.locator('#contact-email').fill('visitor@example.org');
  await page.locator('#contact-message').fill('Browser verification message.');
  await form.locator('button[type=submit]').click();
  await expect(form.locator('[role=status]')).toHaveText('Please try again later.');
  await expect(page.locator('#contact-message')).toHaveValue('Browser verification message.');
  outcome = 'blocked';
  await form.locator('button[type=submit]').click();
  await expect(form.locator('[role=status]')).toHaveText('Pangram identified AI-generated text. Your message was not delivered.');
  await expect(page.locator('#contact-message')).toHaveValue('Browser verification message.');
  outcome = 'sent';
  await form.locator('button[type=submit]').click();
  await expect(form.locator('[role=status]')).toHaveText('Thank you. Your message has been submitted to the lab.');
  await expect(page.locator('#contact-message')).toHaveValue('');
  expect(attempts).toBe(3);
  expect(new URL(page.url()).pathname).toBe('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const status = await form.locator('[role=status]').boundingBox();
  const bounds = await form.boundingBox();
  await expect(form.locator('[role=status]')).toBeVisible();
  expect(status.x).toBeGreaterThanOrEqual(bounds.x);
  expect(status.x + status.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
  await form.screenshot({ path: testInfo.outputPath('contact.png') });
});
