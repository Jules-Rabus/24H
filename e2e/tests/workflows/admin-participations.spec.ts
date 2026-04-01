import { test, expect } from "@playwright/test";

test.describe("Workflow Admin - Participations", () => {
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

  test("Affichage et filtrage des participations", async ({ page }) => {
    const participations = [
      {
        "id": 1,
        "user": { "id": 2, "firstName": "Jean", "lastName": "Runner" },
        "run": { "id": 10, "startDate": "2026-03-27T10:00:00Z" },
        "status": "FINISHED",
        "arrivalTime": "2026-03-27T11:00:00Z"
      },
      {
        "id": 2,
        "user": { "id": 3, "firstName": "Alice", "lastName": "Fast" },
        "run": { "id": 10, "startDate": "2026-03-27T10:00:00Z" },
        "status": "IN_PROGRESS",
        "arrivalTime": null
      }
    ];

    const participationsApiPattern = /\/participations(\?.*)?$/;

    await page.route(participationsApiPattern, async (route) => {
      const url = route.request().url();
      if (url.includes("Alice")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ "member": [participations[1]], "totalItems": 1 }) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ "member": participations, "totalItems": 2 }) });
      }
    });

    await page.goto("/admin/participations");
    await page.waitForTimeout(1000);
    
    // Vérifier l'affichage des lignes
    await expect(page.getByText("Jean Runner")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Alice Fast")).toBeVisible();

    // --- TEST FILTRAGE ---
    await page.getByPlaceholder("Nom du coureur…").fill("Alice");
    await page.getByRole("button", { name: "Rechercher" }).click();
    await expect(page.getByText("Jean Runner")).not.toBeVisible();
    await expect(page.getByText("Alice Fast")).toBeVisible();
  });
});
