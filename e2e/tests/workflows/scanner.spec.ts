import { test, expect } from "@playwright/test";

test.describe("Workflow Scanner Arrivées", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => console.log("PWA Console:", msg.text()));
    page.on("request", (req) => console.log("Request:", req.method(), req.url()));
  });

  test("Affiche l'état initial vide et permet la saisie manuelle", async ({ page }) => {
    // Mock de l'API d'enregistrement d'arrivée
    await page.route("**/participations/finished", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 123,
            arrivalTime: new Date().toISOString(),
            totalTime: 3600,
            user: { firstName: "Jean", lastName: "Runner" },
            run: "/runs/1",
            status: "FINISHED"
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/scanner");
    
    // Attendre l'initialisation (dynamic import + hydration)
    await expect(page.getByText("Scanner Arrivées")).toBeVisible();
    
    console.log("Wait for Aucun run...");
    await expect(page.getByText("Aucune arrivée enregistrée")).toBeVisible();

    // Saisie manuelle du dossard
    console.log("Fill dossard...");
    const input = page.getByPlaceholder("N° dossard");
    await input.fill("42");
    await page.getByRole("button", { name: "Valider" }).click();

    // Vérifier le toast de succès
    await expect(page.getByText(/Arrivée de Jean Runner à/)).toBeVisible();

    // Vérifier l'apparition dans la liste des dernières arrivées
    await expect(page.getByText("Jean Runner")).toBeVisible();
    await expect(page.getByText("60m00s")).toBeVisible(); // 3600s = 60m
  });

  test("Gère les erreurs de l'API lors de la saisie manuelle", async ({ page }) => {
    await page.route("**/participations/finished", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ description: "Dossard déjà scanné ou invalide" })
      });
    });

    await page.goto("/scanner");
    await page.waitForTimeout(2000); // Hydratation

    await page.getByPlaceholder("N° dossard").fill("99");
    await page.getByRole("button", { name: "Valider" }).click();

    // Vérifier le toast d'erreur
    await expect(page.getByText("Dossard déjà scanné ou invalide")).toBeVisible();
  });
});
