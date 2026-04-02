import { test, expect } from "@playwright/test";

test.describe("Hub (/) — page d'accueil", () => {
  test("affiche le hub avec les liens de services", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Available services:")).toBeVisible();
    await expect(page.locator("text=API")).toBeVisible();
    await expect(page.locator("text=Admin")).toBeVisible();
    await expect(page.locator("text=Race Display")).toBeVisible();
    await expect(page.locator("text=Mercure debugger")).toBeVisible();
  });
});

test.describe("Login", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(page.locator("input[type=password]")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /se connecter/i }),
    ).toBeVisible();
  });

  test("affiche une erreur de validation sur email invalide", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("input[type=email]", "pasunemail");
    await page.locator("input[type=password]").click();
    await expect(page.locator("text=Adresse email invalide")).toBeVisible();
  });

  test("lien vers mot de passe oublié fonctionne", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Mot de passe oublié");
    await expect(page).toHaveURL(/forgot-password/);
  });
});

test.describe("Forgot Password", () => {
  test("affiche le formulaire email", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /réinitialiser/i }),
    ).toBeVisible();
  });

  test("lien retour vers login fonctionne", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.click("text=Retour à la connexion");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Public Race Status", () => {
  test("affiche le titre et la localisation", async ({ page }) => {
    await page.goto("/public-race-status");
    await expect(page.locator("text=Statut de la Course")).toBeVisible();
    await expect(page.locator("text=UniLaSalle, Beauvais")).toBeVisible();
  });
});

test.describe("Upload", () => {
  test("affiche le formulaire d'upload", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.locator("text=Partagez un moment")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /envoyer la photo/i }),
    ).toBeVisible();
  });
});

test.describe("Gallery", () => {
  test("affiche le titre Galerie et le bouton Partager", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.getByRole("heading", { name: "Galerie" })).toBeVisible();
    await expect(page.getByRole("button", { name: /partager/i })).toBeVisible();
  });

  test("tap sur un média affiche le bouton Fermer", async ({ page }) => {
    await page.goto("/gallery");
    const firstImg = page.getByRole("img").first();
    await expect(firstImg).toBeVisible({ timeout: 10000 });
    await firstImg.click();
    await expect(page.getByRole("button", { name: /fermer/i })).toBeVisible();
  });

  test("bouton Fermer referme la card agrandie", async ({ page }) => {
    await page.goto("/gallery");
    const firstImg = page.getByRole("img").first();
    await expect(firstImg).toBeVisible({ timeout: 10000 });
    await firstImg.click();
    await expect(page.getByRole("button", { name: /fermer/i })).toBeVisible();
    await page.getByRole("button", { name: /fermer/i }).click();
    await expect(
      page.getByRole("button", { name: /fermer/i }),
    ).not.toBeVisible();
  });
});
