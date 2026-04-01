import { test, expect } from "@playwright/test";

test.describe("Workflow Admin - Médias", () => {
  test.beforeEach(async ({ page }) => {
    // Mock global de l'authentification admin
    await page.route("**/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          "id": 1,
          "firstName": "Admin",
          "lastName": "Système",
          "roles": ["ROLE_ADMIN"]
        })
      });
    });
  });

  test("Liste et suppression de médias", async ({ page }) => {
    const medias = [
      { "id": 1, "filePath": "photo1.jpg", "contentUrl": "/images/photo1.jpg" },
      { "id": 2, "filePath": "photo2.jpg", "contentUrl": "/images/photo2.jpg" }
    ];

    const mediasApiPattern = /\/medias(\?.*)?$/;

    await page.route(mediasApiPattern, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ "member": medias, "totalItems": 2 })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/admin/medias");
    await page.waitForTimeout(1000);
    
    // Vérifier l'affichage des médias
    await expect(page.locator('img[src*="photo1.jpg"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('img[src*="photo2.jpg"]')).toBeVisible();

    // --- TEST SUPPRESSION ---
    await page.locator('button[aria-label="Supprimer"]').first().click();
    await expect(page.getByText("Supprimer le média")).toBeVisible();

    // Mock Delete
    await page.route(/\/medias\/1$/, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 204 });
      }
    });

    // Refresh liste
    await page.route(mediasApiPattern, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ "member": [medias[1]], "totalItems": 1 })
        });
      }
    });

    await page.getByRole("button", { name: "Confirmer" }).click();
    
    await expect(page.locator('img[src*="photo1.jpg"]')).not.toBeVisible();
    await expect(page.locator('img[src*="photo2.jpg"]')).toBeVisible();
  });
});
