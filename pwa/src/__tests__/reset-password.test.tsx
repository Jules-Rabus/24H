import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "../test-utils/render";
import ResetPasswordPage from "../../app/forgot-password/[token]/page";
import { server } from "../mocks/server";

const toasterCreate = vi.fn();
vi.mock("@/components/ui/toaster", () => ({
  toaster: { create: (...args: unknown[]) => toasterCreate(...args) },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/forgot-password/abc123",
  useSearchParams: () => new URLSearchParams(),
}));

const params = Promise.resolve({ token: "abc123" });

async function renderPage() {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<ResetPasswordPage params={params} />);
    await params;
  });
  return result!;
}

describe("ResetPasswordPage", () => {
  it("affiche le formulaire de réinitialisation", async () => {
    await renderPage();
    expect(screen.getAllByPlaceholderText("••••••••")[0]).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /définir le nouveau mot de passe/i }),
    ).toBeInTheDocument();
  });

  it("affiche le succès après soumission valide", async () => {
    server.use(
      http.post("*/forgot-password/*", () => {
        return new HttpResponse(null, { status: 200 });
      }),
    );
    const user = userEvent.setup();
    await renderPage();

    const inputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(inputs[0], "MonMotDePasse1!");
    await user.type(inputs[1], "MonMotDePasse1!");
    await user.click(
      screen.getByRole("button", { name: /définir le nouveau mot de passe/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/mot de passe mis à jour/i)).toBeInTheDocument();
    });
  });

  it("affiche le message violation plainPassword sur 422", async () => {
    server.use(
      http.post("*/forgot-password/*", () => {
        return HttpResponse.json(
          {
            violations: [
              {
                propertyPath: "plainPassword",
                message: "The password strength is too low.",
              },
            ],
          },
          { status: 422 },
        );
      }),
    );
    const user = userEvent.setup();
    await renderPage();

    const inputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(inputs[0], "12345678");
    await user.type(inputs[1], "12345678");
    await user.click(
      screen.getByRole("button", { name: /définir le nouveau mot de passe/i }),
    );

    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "The password strength is too low.",
          type: "error",
        }),
      );
    });
  });

  it("affiche le message detail si token invalide", async () => {
    server.use(
      http.post("*/forgot-password/*", () => {
        return HttpResponse.json(
          { detail: "Token invalide ou expiré." },
          { status: 404 },
        );
      }),
    );
    const user = userEvent.setup();
    await renderPage();

    const inputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(inputs[0], "MonMotDePasse1!");
    await user.type(inputs[1], "MonMotDePasse1!");
    await user.click(
      screen.getByRole("button", { name: /définir le nouveau mot de passe/i }),
    );

    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Token invalide ou expiré.",
          type: "error",
        }),
      );
    });
  });
});
