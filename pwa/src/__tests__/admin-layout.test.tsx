import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import { AdminLayout } from "../../components/admin/ui/AdminLayout";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/runs",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("AdminLayout", () => {
  it("affiche la sidebar avec les liens de navigation", async () => {
    render(
      <AdminLayout>
        <div>Page contenu</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText("Runs")).toBeInTheDocument();
      expect(screen.getByText("Participations")).toBeInTheDocument();
      expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
      expect(screen.getByText("Médias")).toBeInTheDocument();
    });
  });

  it("affiche les outils terrain", async () => {
    render(
      <AdminLayout>
        <div>Contenu</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText("Scanner arrivées")).toBeInTheDocument();
      expect(screen.getByText("Statut course")).toBeInTheDocument();
    });
  });

  it("affiche le titre Défi des 24h Administration", async () => {
    render(
      <AdminLayout>
        <div>Contenu</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText("Défi des 24h")).toBeInTheDocument();
      expect(screen.getByText("Administration")).toBeInTheDocument();
    });
  });

  it("affiche le nom de l'utilisateur connecté", async () => {
    render(
      <AdminLayout>
        <div>Contenu</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });
  });

  it("affiche le bouton de déconnexion", async () => {
    render(
      <AdminLayout>
        <div>Contenu</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText("Déconnexion")).toBeInTheDocument();
    });
  });

  it("affiche le lien retour à l'accueil", async () => {
    render(
      <AdminLayout>
        <div>Contenu</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Retour à l'accueil/)).toBeInTheDocument();
    });
  });

  it("affiche le contenu enfant", async () => {
    render(
      <AdminLayout>
        <div>Mon contenu de page</div>
      </AdminLayout>,
    );
    await waitFor(() => {
      expect(screen.getByText("Mon contenu de page")).toBeInTheDocument();
    });
  });

  it("n'affiche pas le contenu si non authentifié", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");

    server.use(
      http.get("*/me", () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    render(
      <AdminLayout>
        <div>Contenu protégé</div>
      </AdminLayout>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
    });
  });
});
