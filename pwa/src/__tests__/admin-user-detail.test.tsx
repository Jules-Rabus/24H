import { Suspense } from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import UserDetailPage from "../../app/admin/users/[id]/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/users/1",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("@/components/classement/BibDownloadButton", () => ({
  default: () => <button>Mock Dossard</button>,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

async function renderDetail(id: string) {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <UserDetailPage params={Promise.resolve({ id })} />
      </Suspense>,
    );
  });
  return result!;
}

describe("AdminUserDetailPage", () => {
  it("affiche les infos de l'utilisateur", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    });
  });

  it("affiche les stat cards", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getByText("Runs terminés")).toBeInTheDocument();
      expect(screen.getByText("Distance totale")).toBeInTheDocument();
      expect(screen.getByText("Meilleur temps")).toBeInTheDocument();
      expect(screen.getByText("Allure moyenne")).toBeInTheDocument();
    });
  });

  it("affiche les boutons modifier et supprimer", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /modifier/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /supprimer/i }),
      ).toBeInTheDocument();
    });
  });

  it("ouvre le dialog d'édition au clic sur Modifier", async () => {
    const user = userEvent.setup();
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /modifier/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /modifier/i }));

    await waitFor(() => {
      expect(screen.getByText("Modifier l'utilisateur")).toBeInTheDocument();
    });
  });

  it("affiche Utilisateur introuvable pour un id inexistant", async () => {
    await renderDetail("9999");
    await waitFor(() => {
      expect(screen.getByText("Utilisateur introuvable.")).toBeInTheDocument();
    });
  });

  it("affiche la section Photo de profil", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getByText("Photo de profil")).toBeInTheDocument();
    });
  });

  it("affiche le badge Utilisateur pour un non-admin", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getByText("Utilisateur")).toBeInTheDocument();
    });
  });

  it("affiche le badge Admin pour un admin", async () => {
    await renderDetail("2");
    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  it("affiche le bouton retour", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /utilisateurs/i }),
      ).toBeInTheDocument();
    });
  });

  it("affiche le dialog de suppression", async () => {
    const user = userEvent.setup();
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /supprimer/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    await waitFor(() => {
      expect(screen.getByText("Supprimer l'utilisateur")).toBeInTheDocument();
      expect(
        screen.getByText(/cette action est irréversible/i),
      ).toBeInTheDocument();
    });
  });
});
