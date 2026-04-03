import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import ParticipationsPage from "../../app/admin/participations/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/participations",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("AdminParticipationsPage", () => {
  it("affiche le heading Participations", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Participations" }),
      ).toBeInTheDocument();
    });
  });

  it("affiche le bouton nouvelle participation", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /nouvelle participation/i }),
      ).toBeInTheDocument();
    });
  });

  it("affiche les champs de filtre", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Prénom du coureur"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nom du coureur")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ex : 42")).toBeInTheDocument();
    });
  });

  it("affiche les participations retournées par l'API", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
      expect(screen.getByText("Marie Curie")).toBeInTheDocument();
      expect(screen.getByText("Pierre Martin")).toBeInTheDocument();
    });
  });

  it("affiche les badges de statut", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getAllByText("Terminé").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("En cours")).toBeInTheDocument();
    });
  });

  it("ouvre le dialog de création au clic", async () => {
    const user = userEvent.setup();
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /nouvelle participation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /nouvelle participation/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Nouvelle participation")).toBeInTheDocument();
      expect(screen.getByText("ID du coureur")).toBeInTheDocument();
      expect(screen.getByText("ID du run")).toBeInTheDocument();
    });
  });

  it("affiche le message vide quand aucune participation", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("*/participations", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.has("itemsPerPage")) {
          return HttpResponse.json([]);
        }
      }),
    );

    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Aucune participation trouvée"),
      ).toBeInTheDocument();
    });
  });

  it("affiche les colonnes de la table", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getAllByText("Run").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Coureur")).toBeInTheDocument();
      expect(screen.getByText("Temps total")).toBeInTheDocument();
      expect(screen.getAllByText("Statut").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("affiche le total de participations", async () => {
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getByText(/3 participations au total/)).toBeInTheDocument();
    });
  });

  it("ouvre la confirmation de suppression", async () => {
    const user = userEvent.setup();
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Supprimer").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Supprimer")[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Supprimer la participation"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/cette action est irréversible/i),
      ).toBeInTheDocument();
    });
  });

  it("soumet le formulaire de création de participation", async () => {
    const user = userEvent.setup();
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /nouvelle participation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /nouvelle participation/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Nouvelle participation")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Ex : 12"), "1");
    await user.type(screen.getByPlaceholderText("Ex : 3"), "1");

    await user.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Nouvelle participation"),
      ).not.toBeInTheDocument();
    });
  });

  it("ouvre le dialog d'édition", async () => {
    const user = userEvent.setup();
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Modifier").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Modifier")[0]);

    await waitFor(() => {
      expect(screen.getByText(/Modifier la participation/)).toBeInTheDocument();
      expect(
        screen.getByText(/Laisser vide pour remettre/),
      ).toBeInTheDocument();
    });
  });

  it("soumet le formulaire d'édition de participation", async () => {
    const user = userEvent.setup();
    render(<ParticipationsPage />);
    await waitFor(() => {
      expect(screen.getAllByLabelText("Modifier").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByLabelText("Modifier")[0]);

    await waitFor(() => {
      expect(screen.getByText(/Modifier la participation/)).toBeInTheDocument();
    });

    const arrivalInput = screen.getByLabelText(/heure d'arrivée/i);
    await user.clear(arrivalInput);
    await user.type(arrivalInput, "2026-03-15T08:25");

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(
        screen.queryByText(/Modifier la participation/),
      ).not.toBeInTheDocument();
    });
  });
});
