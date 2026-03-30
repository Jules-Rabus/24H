import { test, expect } from "@playwright/test";

test.describe("Workflow Admin - Auth & Navigation", () => {
  test("Redirection vers la connexion si non authentifié", async ({ page }) => {
    // Intercepter l'appel me pour simuler un utilisateur non connecté
    await page.route("**/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "JWT Token not found" })
      });
    });

    await page.goto("/admin/runs");
    
    // Attendre la redirection client
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  });

  test("Connexion réussie avec redirection vers le hub puis accès admin", async ({ page }) => {
    let authenticated = false;

    // Mock Login
    await page.route("**/login", async (route) => {
      if (route.request().method() === "POST") {
        authenticated = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ token: "fake-jwt" })
        });
      } else {
        await route.continue();
      }
    });

    // Mock Me
    await page.route("**/me", async (route) => {
      if (authenticated) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            "id": 1,
            "email": "admin@24h.fr",
            "roles": ["ROLE_ADMIN"],
            "firstName": "Admin",
            "lastName": "Système"
          })
        });
      } else {
        await route.fulfill({ status: 401, body: "{}" });
      }
    });

    await page.route(url => url.pathname === "/runs", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
    
    await page.getByPlaceholder("vous@exemple.fr").fill("admin@24h.fr");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/$/);
    
    // Naviguer vers l'admin
    await page.getByRole("link", { name: "Admin (nouveau)" }).click();
    await expect(page).toHaveURL(/\/admin/);
    
    // Attendre l'hydratation et le chargement du profil
    await page.waitForTimeout(2000);
    await expect(page.getByText("Admin Système", { exact: false })).toBeVisible();
  });
});
