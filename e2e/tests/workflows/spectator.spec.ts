import { test, expect } from "@playwright/test";

test.describe("Workflow Spectateur", () => {
  test("Consulte le statut, accède à l'upload et envoie une photo", async ({ page }) => {
    // 1. Consultation du statut public
    // Mock des participations pour avoir des données
    await page.route("**/participations*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          "member": [
            {
              "@id": "/participations/1",
              "user": "/users/1",
              "arrivalTime": new Date().toISOString(),
              "totalTime": 1200,
              "status": "FINISHED"
            }
          ],
          "totalItems": 1
        })
      });
    });

    await page.goto("/public-race-status");
    await expect(page.getByText("Statut de la Course (En Direct)")).toBeVisible();
    // On vérifie que notre arrivant mocké est là (c'est l'IRI qui s'affiche actuellement)
    await expect(page.getByText("/users/1")).toBeVisible();

    // 2. Navigation vers la page d'upload via le Hub
    await page.goto("/");
    await page.getByRole("link", { name: "Partager un moment" }).click();
    await expect(page).toHaveURL(/\/upload/);

    // Mock des requêtes API pour l'upload
    await page.route("**/users/public", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          "member": [
            { "@id": "/users/1", "firstName": "Jean", "lastName": "Dupont" }
          ],
          "totalItems": 1
        })
      });
    });

    await page.route("**/race_media", async (route) => {
      await route.fulfill({ status: 201, body: JSON.stringify({ id: 1 }) });
    });

    // 3. Remplissage du formulaire d'upload
    // Attendre que la liste soit chargée
    const select = page.locator("select");
    await expect(select).toBeVisible();
    await select.selectOption({ label: "Jean Dupont" });

    // Upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator("input[type=file]").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image')
    });

    // 4. Soumission
    const submitBtn = page.getByRole("button", { name: "Envoyer la photo" });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 5. Message de succès
    await expect(page.getByText(/Photo uploadée avec succès/i)).toBeVisible();
  });
});
