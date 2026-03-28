import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to Public Race Status', async ({ page }) => {
    // Navigate to the public status page
    await page.goto('/public-race-status');

    // Expect a title "to contain" a substring
    await expect(page.locator('text=Statut de la Course')).toBeVisible();
    await expect(page.locator('text=UniLaSalle, Beauvais')).toBeVisible();
  });

  test('should navigate to Upload page and show form', async ({ page }) => {
    await page.goto('/upload');

    await expect(page.locator('text=Partagez un moment')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Envoyer la photo' })).toBeVisible();
  });
});
