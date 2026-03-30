import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "../test-utils/render";
import { server } from "../mocks/server";
import LoginPage from "../../app/login/page";

// next/navigation mock
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("LoginPage", () => {
  it("affiche le formulaire de connexion", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("vous@exemple.fr")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /se connecter/i }),
    ).toBeInTheDocument();
  });

  it("affiche les erreurs de validation inline", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("vous@exemple.fr");
    await user.type(emailInput, "pas-un-email");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/adresse email invalide/i)).toBeInTheDocument();
    });
  });

  it("affiche une erreur si les credentials sont invalides", async () => {
    server.use(
      http.post("*/login", () => new HttpResponse(null, { status: 401 })),
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("vous@exemple.fr"),
      "wrong@example.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
    });
  });

  it("lien vers forgot-password visible", () => {
    render(<LoginPage />);
    expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
  });
});
