import { test, expect } from "@playwright/test";

test.describe("Workflow Admin - CRUD", () => {
  test.beforeEach(async ({ page }) => {
    // Mock global de l'authentification
    await page.route("**/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          "@id": "/users/1",
          "firstName": "Admin",
          "lastName": "Système",
          "roles": ["ROLE_ADMIN"]
        })
      });
    });
  });

  test("Gestion des Runs (Création et Liste)", async ({ page }) => {
    // 1. Mock de la liste initiale (vide)
    await page.route("**/runs*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/ld+json",
          body: JSON.stringify({ "member": [], "totalItems": 0 })
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/ld+json",
          body: JSON.stringify({ id: 1, startDate: "2026-03-27T10:00", endDate: "2026-03-28T10:00" })
        });
      }
    });

    await page.goto("/admin/runs");
    await expect(page.getByText("Aucun run trouvé")).toBeVisible();

    // 2. Création d'un run
    await page.getByRole("button", { name: "+ Créer un run" }).click();
    await page.locator("input[type=datetime-local]").first().fill("2026-03-27T10:00");
    await page.locator("input[type=datetime-local]").last().fill("2026-03-28T10:00");
    
    // Mocker la liste mise à jour après création
    await page.route("**/runs*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/ld+json",
          body: JSON.stringify({
            "member": [
              { "@id": "/runs/1", "id": 1, "startDate": "2026-03-27T10:00:00Z", "endDate": "2026-03-28T10:00:00Z" }
            ],
            "totalItems": 1
          })
        });
      }
    });

    await page.getByRole("button", { name: "Créer" }).click();
    
    // Vérification dans le tableau
    await expect(page.getByRole("cell", { name: "27/03/2026" }).first()).toBeVisible();
  });

  test("Gestion des Utilisateurs (Recherche et Edition)", async ({ page }) => {
    // Mock liste utilisateurs
    await page.route("**/users*", async (route) => {
      if (route.request().url().includes("/me")) return route.continue();
      
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          "member": [
            { "@id": "/users/2", "id": 2, "firstName": "Jean", "lastName": "Dupont", "email": "jean@test.fr", "roles": ["ROLE_USER"] }
          ],
          "totalItems": 1
        })
      });
    });

    await page.goto("/admin/users");
    await expect(page.getByText("Jean Dupont")).toBeVisible();

    // Ouverture édition
    await page.getByRole("button", { name: "Modifier" }).click();
    await expect(page.getByRole("heading", { name: "Modifier l'utilisateur" })).toBeVisible();
    await page.getByPlaceholder("Prénom").fill("Jeanne");

    // Mock Update
    await page.route("**/users/2", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({ status: 200, body: JSON.stringify({ id: 2, firstName: "Jeanne" }) });
      }
    });

    // Mock liste mise à jour
    await page.route("**/users*", async (route) => {
      if (route.request().url().includes("/me")) return route.continue();
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          "member": [
            { "@id": "/users/2", "id": 2, "firstName": "Jeanne", "lastName": "Dupont", "email": "jean@test.fr", "roles": ["ROLE_USER"] }
          ],
          "totalItems": 1
        })
      });
    });

    await page.getByRole("button", { name: "Modifier" }).click();
    await expect(page.getByText("Jeanne Dupont")).toBeVisible();
  });
});
