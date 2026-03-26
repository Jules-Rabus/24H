// @ts-check
const { test, expect } = require('@playwright/test');

test('public race status page', async ({ page }) => {
  await page.goto('https://localhost/public-race-status');
  // Wait for the UI to load
  await expect(page.getByText('Statut de la Course')).toBeVisible();
  // It should show Beauvais location
  await expect(page.getByText('UniLaSalle, Beauvais')).toBeVisible();
});

test('swagger API docs', async ({ page }) => {
  await page.goto('https://localhost/docs');
  // Verify API docs are still available
  await expect(page).toHaveTitle('Hello API Platform - API Platform');
  // Verify RaceMedia endpoint is present
  await expect(page.locator('text=RaceMedia').first()).toBeVisible();
});

test('login page', async ({ page }) => {
  await page.goto('https://localhost/login');
  await expect(page.getByText('Log in to your account')).toBeVisible();

  // Try to submit the form without data to check validation
  const btn = page.getByRole('button', { name: 'Sign in' });
  await expect(btn).toBeDisabled();
});

test('upload page shows form', async ({ page }) => {
  await page.goto('https://localhost/upload');
  await expect(page.getByText('Partagez un moment')).toBeVisible();
  // Ensure the photo upload input is there
  await expect(page.locator('input[type="file"]')).toBeVisible();
});
