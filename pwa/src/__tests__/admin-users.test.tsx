import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import AdminUsersPage from "../../app/admin/users/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/users",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

// Dynamic import for BulkBibDownloadButton — mock it
vi.mock("@/components/classement/BulkBibDownloadButton", () => ({
  default: () => <button>Mock BulkDownload</button>,
}));

describe("AdminUsersPage", () => {
  it("affiche le heading Utilisateurs", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Utilisateurs" }),
      ).toBeInTheDocument();
    });
  });

  it("affiche le bouton créer un utilisateur", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un utilisateur/i }),
      ).toBeInTheDocument();
    });
  });

  it("affiche les champs de recherche", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("N°…")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Prénom…")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nom…")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("email@exemple.fr…"),
      ).toBeInTheDocument();
    });
  });

  it("affiche les utilisateurs retournés par l'API", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
      expect(screen.getByText("Marie Curie")).toBeInTheDocument();
      expect(screen.getByText("Pierre Martin")).toBeInTheDocument();
    });
  });

  it("affiche les badges de rôle", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getAllByText("Utilisateur").length).toBeGreaterThanOrEqual(
        2,
      );
    });
  });

  it("ouvre le dialog de création au clic", async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un utilisateur/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /créer un utilisateur/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Créer un utilisateur")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Prénom")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nom")).toBeInTheDocument();
    });
  });

  it("réinitialise les filtres au clic sur le bouton", async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Prénom…")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Prénom…");
    await user.type(input, "test");
    expect(input).toHaveValue("test");

    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));
    expect(input).toHaveValue("");
  });

  it("affiche le message vide quand aucun utilisateur", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("*/users", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.has("itemsPerPage")) {
          return HttpResponse.json([]);
        }
      }),
    );

    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText("Aucun utilisateur trouvé")).toBeInTheDocument();
    });
  });

  it("affiche les colonnes de la table", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getAllByText("Nom").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Surnom").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Email").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Organisation")).toBeInTheDocument();
      expect(screen.getByText("Rôle")).toBeInTheDocument();
    });
  });

  it("ouvre la confirmation de suppression", async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Supprimer").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Supprimer")[0]);

    await waitFor(() => {
      expect(screen.getByText("Supprimer l'utilisateur")).toBeInTheDocument();
      expect(
        screen.getByText(/cette action est irréversible/i),
      ).toBeInTheDocument();
    });
  });

  it("ouvre le dialog d'édition au clic sur Modifier", async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Modifier").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Modifier")[0]);

    await waitFor(() => {
      expect(screen.getByText("Modifier l'utilisateur")).toBeInTheDocument();
    });
  });

  it("soumet le formulaire de création d'utilisateur", async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un utilisateur/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /créer un utilisateur/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Créer un utilisateur")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Prénom"), "Alice");
    await user.type(screen.getByPlaceholderText("Nom"), "Durand");

    await user.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Créer un utilisateur"),
      ).not.toBeInTheDocument();
    });
  });

  it("affiche la colonne Distance", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText("Distance")).toBeInTheDocument();
    });
  });

  it("affiche les emails dans la table", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText("jean@example.com")).toBeInTheDocument();
      expect(screen.getByText("marie@example.com")).toBeInTheDocument();
    });
  });
});
