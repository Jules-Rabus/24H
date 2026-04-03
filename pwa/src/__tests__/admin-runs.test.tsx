import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import AdminRunsPage from "../../app/admin/runs/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/runs",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("AdminRunsPage", () => {
  it("affiche le heading Runs", async () => {
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Runs" })).toBeInTheDocument();
    });
  });

  it("affiche les stat cards", async () => {
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getByText("Total runs")).toBeInTheDocument();
      expect(screen.getAllByText("Participants").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText("En cours").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Terminés").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("affiche les boutons d'action", async () => {
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un run/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /générer les runs/i }),
      ).toBeInTheDocument();
    });
  });

  it("ouvre le dialog de création au clic", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un run/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /créer un run/i }));

    await waitFor(() => {
      expect(screen.getByText("Créer un run")).toBeInTheDocument();
      expect(screen.getByText("Date de début")).toBeInTheDocument();
      expect(screen.getByText("Date de fin")).toBeInTheDocument();
    });
  });

  it("ouvre le dialog de batch au clic sur Générer les runs", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /générer les runs/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /générer les runs/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Générer les runs (1 par heure)"),
      ).toBeInTheDocument();
      expect(screen.getByText("Première heure")).toBeInTheDocument();
      expect(screen.getByText("Dernière heure")).toBeInTheDocument();
    });
  });

  it("remplit le formulaire de batch et voit le preview", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /générer les runs/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /générer les runs/i }));

    await waitFor(() => {
      expect(screen.getByText("Première heure")).toBeInTheDocument();
    });

    const firstHourInput = screen.getByLabelText(/première heure/i);
    const lastHourInput = screen.getByLabelText(/dernière heure/i);
    await user.clear(firstHourInput);
    await user.type(firstHourInput, "2026-03-15T08:00");
    await user.clear(lastHourInput);
    await user.type(lastHourInput, "2026-03-15T11:00");

    await waitFor(() => {
      expect(screen.getByText(/Cela créera/)).toBeInTheDocument();
    });
  });

  it("affiche le message vide quand aucun run", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("*/runs", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.has("itemsPerPage")) {
          return HttpResponse.json([]);
        }
      }),
    );

    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getByText("Aucun run trouvé")).toBeInTheDocument();
    });
  });

  it("affiche les données des runs dans la table", async () => {
    render(<AdminRunsPage />);
    await waitFor(() => {
      // Table headers
      expect(screen.getByText("Début")).toBeInTheDocument();
      expect(screen.getByText("Fin")).toBeInTheDocument();
      expect(screen.getByText("Temps moy.")).toBeInTheDocument();
      expect(screen.getAllByText("Plus rapide").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  it("ouvre le dialog d'édition au clic sur Modifier", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Modifier").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Modifier")[0]);

    await waitFor(() => {
      expect(screen.getByText("Modifier le run")).toBeInTheDocument();
    });
  });

  it("affiche les liens de détail dans la table", async () => {
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Voir le détail").length).toBeGreaterThan(
        0,
      );
    });
  });

  it("affiche les stats Temps moyen et Plus rapide", async () => {
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getByText("Temps moyen")).toBeInTheDocument();
      expect(screen.getAllByText("Plus rapide").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  it("soumet le formulaire de création de run", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un run/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /créer un run/i }));

    await waitFor(() => {
      expect(screen.getByText("Créer un run")).toBeInTheDocument();
    });

    const startInput = screen.getByLabelText(/date de début/i);
    const endInput = screen.getByLabelText(/date de fin/i);
    await user.clear(startInput);
    await user.type(startInput, "2026-03-15T08:00");
    await user.clear(endInput);
    await user.type(endInput, "2026-03-15T09:00");

    await user.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => {
      expect(screen.queryByText("Créer un run")).not.toBeInTheDocument();
    });
  });

  it("ouvre la confirmation de suppression", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Supprimer").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Supprimer")[0]);

    await waitFor(() => {
      expect(screen.getByText("Supprimer le run")).toBeInTheDocument();
      expect(
        screen.getByText(/cette action est irréversible/i),
      ).toBeInTheDocument();
    });
  });
});
