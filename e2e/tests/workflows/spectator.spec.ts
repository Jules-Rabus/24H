import { test, expect } from "@playwright/test";

test.describe("Workflow Spectateur", () => {
  test("Consulte le statut, accède à l'upload et envoie une photo", async ({ page }) => {
    // 1. Consultation du statut public
    await page.route(url => url.pathname === "/participations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
            {
              "id": 1,
              "@id": "/participations/1",
              "user": {
                "id": 1,
                "@id": "/users/1",
                "firstName": "Jean",
                "lastName": "Dupont"
              },
              "arrivalTime": new Date().toISOString(),
              "totalTime": 1200,
              "status": "FINISHED"
            }
        ])
      });
    });

    await page.route(url => url.pathname === "/runs", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
        });
    });

    await page.route("**/s3/runner-images/**", async (route) => {
        await route.fulfill({ status: 200, contentType: "image/jpeg", body: Buffer.from("") });
    });

    await page.goto("/public-race-status");
    await expect(page.getByText("DÉFI 24H")).toBeVisible();
    await expect(page.getByText("Jean Dupont")).toBeVisible();

    // 2. Navigation vers la page d'upload via le Hub
    await page.goto("/");
    await page.getByRole("link", { name: "Upload photo" }).click();
    await expect(page).toHaveURL(/\/upload/);

    // Mock des requêtes API pour l'upload
    await page.route("**/race_medias", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: 1, contentUrl: "/test.jpg" })
        });
      } else {
        await route.continue();
      }
    });

    // 3. Remplissage du formulaire d'upload
    await expect(page.getByText("Partagez l'Action")).toBeVisible();
    await page.waitForTimeout(2000); // Wait for hydration

    // Upload using setInputFiles on the input
    const fileInput = page.locator("input[type=file]");
    await fileInput.setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });

    // 4. Soumission
    const submitBtn = page.getByRole("button", { name: "Envoyer la photo" });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 5. Message de succès
    await expect(page.getByText("Photo envoyée !"), { timeout: 15000 }).toBeVisible();
  });
});
