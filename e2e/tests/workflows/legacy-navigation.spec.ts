import { test, expect } from "@playwright/test";

test.describe("Workflow Legacy - Navigation", () => {
  test("Accès aux pages legacy via le Hub", async ({ page }) => {
    await page.goto("/");

    // 1. Admin Legacy
    await page.getByRole("link", { name: "Admin (legacy)" }).click();
    await expect(page).toHaveURL(/\/legacy\/admin/);
    // On vérifie juste que le wrapper charge (Chargement... ou titre spécifique)
    // React Admin met du temps à charger, on vérifie la présence du texte de chargement
    await expect(page.getByText(/chargement/i)).toBeVisible();

    // 2. Display Legacy
    await page.goto("/");
    await page.getByRole("link", { name: "Race Display" }).click();
    await expect(page).toHaveURL(/\/legacy\/display/);
    // Le composant Display affiche "Chargement..." initialement
    await expect(page.getByText(/chargement/i)).toBeVisible();

    // 3. Résultats (via URL directe car pas de lien évident sur le hub actuel)
    await page.goto("/legacy/resultats");
    await expect(page.getByText(/chargement/i)).toBeVisible();
  });
});
