import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import AdminMediasPage from "../../app/admin/medias/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/medias",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("AdminMediasPage", () => {
  it("affiche le heading Medias de course", async () => {
    render(<AdminMediasPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Medias de course" }),
      ).toBeInTheDocument();
    });
  });

  it("affiche le bouton Ajouter une photo", async () => {
    render(<AdminMediasPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /ajouter une photo/i }),
      ).toBeInTheDocument();
    });
  });

  it("affiche les medias avec leurs commentaires", async () => {
    render(<AdminMediasPage />);
    await waitFor(() => {
      expect(screen.getByText("Super course !")).toBeInTheDocument();
      expect(screen.getByText("Allez les bleus")).toBeInTheDocument();
    });
  });

  it("affiche Sans commentaire pour les medias sans commentaire", async () => {
    render(<AdminMediasPage />);
    await waitFor(() => {
      expect(screen.getByText("Sans commentaire")).toBeInTheDocument();
    });
  });

  it("affiche le champ de recherche par commentaire", async () => {
    render(<AdminMediasPage />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Filtrer par commentaire..."),
      ).toBeInTheDocument();
    });
  });

  it("affiche l'état vide quand aucun media", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("*/race_medias", () => {
        return HttpResponse.json([]);
      }),
    );

    render(<AdminMediasPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Aucune photo pour le moment"),
      ).toBeInTheDocument();
    });
  });

  it("affiche l'état pas de résultat quand le filtre ne matche rien", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    const { buildRaceMedia } = await import("../mocks/factories");
    server.use(
      http.get("*/race_medias", () => {
        return HttpResponse.json([buildRaceMedia({ comment: "test photo" })]);
      }),
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<AdminMediasPage />);

    await waitFor(() => {
      expect(screen.getByText("test photo")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Filtrer par commentaire..."),
      "zzzzz",
    );

    await waitFor(() => {
      expect(
        screen.getByText("Aucun media ne correspond au filtre"),
      ).toBeInTheDocument();
    });
  });

  it("affiche les dates des medias", async () => {
    render(<AdminMediasPage />);
    await waitFor(() => {
      // createdAt is "2026-03-15T14:32:00Z"
      expect(screen.getAllByText(/mars/i).length).toBeGreaterThan(0);
    });
  });

  it("filtre les medias par commentaire", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<AdminMediasPage />);

    await waitFor(() => {
      expect(screen.getByText("Super course !")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Filtrer par commentaire..."),
      "Super",
    );

    await waitFor(() => {
      expect(screen.getByText("Super course !")).toBeInTheDocument();
      expect(screen.queryByText("Allez les bleus")).not.toBeInTheDocument();
    });
  });

  it("affiche le compteur de résultats quand un filtre est actif", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<AdminMediasPage />);

    await waitFor(() => {
      expect(screen.getByText("Super course !")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Filtrer par commentaire..."),
      "Super",
    );

    await waitFor(() => {
      expect(screen.getByText(/1 resultat sur 3/)).toBeInTheDocument();
    });
  });
});
