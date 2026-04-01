import { test, expect } from "@playwright/test";

test.describe("Workflow Admin - CRUD Complet", () => {
  test.beforeEach(async ({ page }) => {
    // Log console et erreurs réseau
    page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
    page.on('requestfailed', request => console.log(`NETWORK ERROR: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`));

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

  test.describe("Gestion des Runs", () => {
    test("Création et Suppression d'un Run", async ({ page }) => {
      // Mock Liste Initiale (vide)
      await page.route("**/runs**", async (route) => {
        const method = route.request().method();
        if (method === "GET") {
          console.log("Mocking GET /runs (empty)");
          await route.fulfill({ 
            status: 200, 
            contentType: "application/json", 
            body: JSON.stringify([]) 
          });
        } else if (method === "POST") {
          console.log("Mocking POST /runs");
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({ id: 10, startDate: "2026-03-27T10:00:00+00:00", endDate: "2026-03-28T10:00:00+00:00" })
          });
        } else if (method === "DELETE") {
          console.log("Mocking DELETE /runs/10");
          await route.fulfill({ status: 204 });
        }
      });

      await page.goto("/admin/runs");
      await page.waitForTimeout(3000); // Plus de temps pour l'hydratation
      
      // On vérifie d'abord que la page est chargée (le titre par exemple)
      await expect(page.getByRole("heading", { name: "Runs" })).toBeVisible();
      
      // Puis on vérifie le message vide
      await expect(page.getByText("Aucun run trouvé")).toBeVisible({ timeout: 15000 });

      // Remplir le formulaire
      await page.getByRole("button", { name: "+ Créer un run" }).click();
      await page.locator("input[type=datetime-local]").first().fill("2026-03-27T10:00");
      await page.locator("input[type=datetime-local]").last().fill("2026-03-28T10:00");

      // Mocker la liste après création
      await page.route("**/runs**", async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([{ "id": 10, "startDate": "2026-03-27T10:00:00+00:00", "endDate": "2026-03-28T10:00:00+00:00", "participantsCount": 0 }])
          });
        }
      });

      await page.getByRole("button", { name: "Créer" }).click();
      await expect(page.locator("table")).toContainText("27/03/2026");

      // --- TEST SUPPRESSION ---
      await page.locator('button[aria-label="Supprimer"]').click();
      await page.getByRole("button", { name: "Confirmer" }).click();
      
      // Re-mocker vide
      await page.route("**/runs**", async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({ status: 200, body: JSON.stringify([]) });
        }
      });
      
      await expect(page.getByText("Aucun run trouvé")).toBeVisible();
    });
  });
});
