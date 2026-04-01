import { test, expect } from "@playwright/test";

test.describe("Workflow Classement", () => {
  test("Affiche le classement, navigue vers une fiche coureur", async ({
    page,
  }) => {
    await page.route(
      (url) => url.pathname === "/users/public",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              firstName: "Jean",
              lastName: "Dupont",
              surname: null,
              organization: "ACBB",
              image: null,
              finishedParticipationsCount: 8,
              totalTime: 14400,
              bestTime: 1440,
              averageTime: 1800,
              participations: [],
            },
            {
              id: 2,
              firstName: "Marie",
              lastName: "Curie",
              surname: "Radium",
              organization: null,
              image: null,
              finishedParticipationsCount: 12,
              totalTime: 20400,
              bestTime: 1320,
              averageTime: 1700,
              participations: [],
            },
          ]),
        });
      },
    );

    await page.goto("/classement?edition=2026");
    await expect(page.getByText("Classement")).toBeVisible();
    await expect(page.getByText("Jean Dupont")).toBeVisible();
    await expect(page.getByText("Marie Curie")).toBeVisible();

    // Click on a runner row
    await page.getByText("Marie Curie").click();
    await expect(page).toHaveURL(/\/coureurs\/2/);
  });

  test("Switch édition via pills", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/users/public",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto("/classement?edition=2026");
    await expect(page.getByText("Classement")).toBeVisible();

    // Click 2025 pill
    await page.getByRole("button", { name: "2025" }).click();
    await expect(page).toHaveURL(/edition=2025/);
  });

  test("Ajoute et retire un favori", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/users/public",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              firstName: "Jean",
              lastName: "Dupont",
              surname: null,
              organization: null,
              image: null,
              finishedParticipationsCount: 5,
              totalTime: 9000,
              bestTime: 1500,
              averageTime: 1800,
              participations: [],
            },
          ]),
        });
      },
    );

    await page.goto("/classement?edition=2026");
    await expect(page.getByText("Jean Dupont")).toBeVisible();

    // Toggle favorite
    const starBtn = page.getByRole("button", { name: /favori/i });
    await starBtn.click();

    // Switch to favorites tab
    await page.getByRole("button", { name: /mes favoris/i }).click();
    await expect(page.getByText("Jean Dupont")).toBeVisible();

    // Toggle off
    await page.getByRole("button", { name: /favori/i }).click();
    await expect(page.getByText("Aucun coureur trouvé")).toBeVisible();
  });
});
