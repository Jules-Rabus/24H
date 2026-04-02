import { test, expect } from "@playwright/test";

// API returns runners already filtered by edition with correct stats
const runners2026 = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    surname: null,
    organization: "ACBB",
    image: null,
    finishedParticipationsCount: 2,
    totalTime: 3240,
    bestTime: 1440,
    averageTime: 1620,
    participations: [],
  },
  {
    id: 2,
    firstName: "Marie",
    lastName: "Curie",
    surname: "Radium",
    organization: null,
    image: null,
    finishedParticipationsCount: 1,
    totalTime: 1320,
    bestTime: 1320,
    averageTime: 1320,
    participations: [],
  },
];

const runners2025 = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    surname: null,
    organization: "ACBB",
    image: null,
    finishedParticipationsCount: 1,
    totalTime: 1560,
    bestTime: 1560,
    averageTime: 1560,
    participations: [],
  },
];

test.describe("Workflow Classement", () => {
  test("Affiche le classement 2026 et navigue vers une fiche coureur", async ({
    page,
  }) => {
    await page.route(
      (url) => url.pathname === "/users/public",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(runners2026),
        });
      },
    );

    await page.goto("/classement?edition=2026");
    await expect(page.getByText("Classement")).toBeVisible();
    await expect(page.getByText("Jean Dupont")).toBeVisible();
    await expect(page.getByText("Marie Curie")).toBeVisible();

    await page.getByText("Marie Curie").click();
    await expect(page).toHaveURL(/\/coureurs\/2/);
  });

  test("Switch édition 2026 → 2025 envoie edition=2025 à l'API et met à jour l'affichage", async ({
    page,
  }) => {
    await page.route(
      (url) => url.pathname === "/users/public",
      async (route, request) => {
        const url = new URL(request.url());
        const edition = url.searchParams.get("edition");
        const body = edition === "2025" ? runners2025 : runners2026;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      },
    );

    await page.goto("/classement?edition=2026");
    await expect(page.getByText("Marie Curie")).toBeVisible();

    // Switch to 2025 — API returns only Jean
    await page.getByRole("button", { name: "2025" }).click();
    await expect(page).toHaveURL(/edition=2025/);
    await expect(page.getByText("Jean Dupont")).toBeVisible();
    await expect(page.locator("text=Marie Curie")).not.toBeAttached();
  });

  test("Affiche Aucun coureur trouvé si l'API retourne une liste vide", async ({
    page,
  }) => {
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
    await expect(page.getByText("Aucun coureur trouvé")).toBeVisible();
  });

  test("Ajoute et retire un favori", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/users/public",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([runners2026[0]]),
        });
      },
    );

    await page.goto("/classement?edition=2026");
    await expect(page.getByText("Jean Dupont")).toBeVisible();

    const starBtn = page.getByRole("button", { name: /favori/i });
    await starBtn.click();

    await page.getByRole("button", { name: /mes favoris/i }).click();
    await expect(page.getByText("Jean Dupont")).toBeVisible();

    await page.getByRole("button", { name: /favori/i }).click();
    await expect(page.getByText("Aucun coureur trouvé")).toBeVisible();
  });
});
