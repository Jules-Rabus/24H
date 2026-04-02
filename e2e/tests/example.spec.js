// @ts-check
const { test, expect } = require('@playwright/test');

test('public race status page', async ({ page }) => {
  await page.goto('/public-race-status');
  // Wait for the UI to load
  await expect(page.getByText('DÉFI 24H')).toBeVisible();
  // It should show Beauvais location
  await expect(page.getByText('UniLaSalle Beauvais')).toBeVisible();
});

test('swagger API docs', async ({ page }) => {
  await page.goto('/docs');
  // Verify API docs are still available
  await expect(page).toHaveTitle('Course 24H - API Platform');
  // Verify RaceMedia endpoint is present
  await expect(page.locator('text=RaceMedia').first()).toBeVisible();
});

test('login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();

  // Button should be visible
  const btn = page.getByRole('button', { name: 'Se connecter' });
  await expect(btn).toBeVisible();
});

test('upload page shows form', async ({ page }) => {
  await page.goto('/upload');
  await expect(page.getByRole('button', { name: /partager maintenant/i })).toBeVisible();
  // Ensure the photo upload input is there
  await expect(page.locator('input[type="file"]')).toBeVisible();
});

test('homepage shows Participant and Organisateur buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Participant')).toBeVisible();
  await expect(page.getByText('Organisateur')).toBeVisible();
});

test('homepage Participant button navigates to classement', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Participant').click();
  await expect(page).toHaveURL(/\/classement/);
});
