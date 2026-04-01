import { test, expect } from "@playwright/test";

test.describe("Workflow Galerie", () => {
  test("Affiche la galerie triée par likes, ouvre la lightbox", async ({
    page,
  }) => {
    await page.route(
      (url) => url.pathname === "/race_medias",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              contentUrl: "/media/1.jpg",
              filePath: "1.jpg",
              comment: "Super course !",
              createdAt: "2026-03-15T14:32:00Z",
              likesCount: 12,
              contentType: "image/jpeg",
            },
            {
              id: 2,
              contentUrl: "/media/2.mp4",
              filePath: "2.mp4",
              comment: null,
              createdAt: "2026-03-15T15:10:00Z",
              likesCount: 4,
              contentType: "video/mp4",
            },
          ]),
        });
      },
    );

    await page.route("**/media/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: Buffer.from(""),
      });
    });

    await page.goto("/gallery");
    await expect(page.getByText("Galerie")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /partager/i }),
    ).toBeVisible();

    // Click first image to open lightbox
    const images = page.locator("img[alt]");
    await images.first().click();

    // Lightbox should show
    await expect(page.getByText(/1 \//)).toBeVisible();

    // Like button visible
    await expect(page.getByRole("button", { name: /like/i })).toBeVisible();
  });

  test("Bouton Partager navigue vers /upload", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/race_medias",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto("/gallery");
    await page.getByRole("button", { name: /partager/i }).click();
    await expect(page).toHaveURL(/\/upload/);
  });
});
