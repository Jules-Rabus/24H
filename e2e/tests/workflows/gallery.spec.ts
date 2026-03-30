import { test, expect } from "@playwright/test";

test.describe("Workflow Galerie Photos", () => {
  test("Affiche la liste des photos", async ({ page }) => {
    // Mock des médias
    await page.route(url => url.pathname === "/race_medias", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 1,
            contentUrl: "/media/1.jpg",
            filePath: "/media/1.jpg",
            comment: "Super course !",
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            contentUrl: "/media/2.jpg",
            filePath: "/media/2.jpg",
            comment: "Allez les bleus",
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // Mock des images S3
    await page.route("**/media/**", async (route) => {
      await route.fulfill({ status: 200, contentType: "image/jpeg", body: Buffer.from("") });
    });

    await page.goto("/gallery");
    await expect(page.getByText("Galerie Photos")).toBeVisible();
    
    // Vérifier la présence des photos (2 dans notre mock)
    await expect(page.getByText("2 photos")).toBeVisible();
    await expect(page.getByText("Super course !")).toBeVisible();
    await expect(page.getByText("Allez les bleus")).toBeVisible();
  });

  test("Affiche un message si la galerie est vide", async ({ page }) => {
    await page.route(url => url.pathname === "/race_medias", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    await page.goto("/gallery");
    await expect(page.getByText("Aucune photo pour le moment")).toBeVisible();
    await expect(page.getByRole("button", { name: "Envoyer une photo" })).toBeVisible();
  });
});
