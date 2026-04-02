// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Reset Password', () => {
  test('affiche le formulaire de réinitialisation', async ({ page }) => {
    await page.goto('/forgot-password/abc123');
    await expect(
      page.getByRole('button', { name: /définir le nouveau mot de passe/i }),
    ).toBeVisible();
    const inputs = page.getByPlaceholder('••••••••');
    await expect(inputs.first()).toBeVisible();
  });

  test("affiche le succès après soumission valide", async ({ page }) => {
    await page.goto('/forgot-password/abc123');
    await page.route('**/forgot-password/**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, body: '' });
      } else {
        route.continue();
      }
    });
    const inputs = page.getByPlaceholder('••••••••');
    await inputs.first().fill('MonMotDePasse1!');
    await inputs.nth(1).fill('MonMotDePasse1!');
    await page
      .getByRole('button', { name: /définir le nouveau mot de passe/i })
      .click();
    await expect(page.getByText(/mot de passe mis à jour/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("affiche l'erreur 422 de robustesse du mot de passe", async ({ page }) => {
    await page.goto('/forgot-password/abc123');
    await page.route('**/forgot-password/**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            violations: [
              {
                propertyPath: 'plainPassword',
                message: 'The password strength is too low.',
              },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });
    const inputs = page.getByPlaceholder('••••••••');
    await inputs.first().fill('12345678');
    await inputs.nth(1).fill('12345678');
    await page
      .getByRole('button', { name: /définir le nouveau mot de passe/i })
      .click();
    await expect(
      page.getByText('The password strength is too low.'),
    ).toBeVisible({ timeout: 10000 });
  });

  test("affiche l'erreur detail si token invalide (404)", async ({ page }) => {
    await page.goto('/forgot-password/abc123');
    await page.route('**/forgot-password/**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Token invalide ou expiré.' }),
        });
      } else {
        route.continue();
      }
    });
    const inputs = page.getByPlaceholder('••••••••');
    await inputs.first().fill('MonMotDePasse1!');
    await inputs.nth(1).fill('MonMotDePasse1!');
    await page
      .getByRole('button', { name: /définir le nouveau mot de passe/i })
      .click();
    await expect(page.getByText('Token invalide ou expiré.')).toBeVisible({
      timeout: 5000,
    });
  });
});
