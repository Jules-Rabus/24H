import { Suspense } from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import { render } from "../test-utils/render";
import RunDetailPage from "../../app/admin/runs/[id]/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/runs/1",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

async function renderDetail(id: string) {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <RunDetailPage params={Promise.resolve({ id })} />
      </Suspense>,
    );
  });
  return result!;
}

describe("AdminRunDetailPage", () => {
  it("affiche le détail du run", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Run #1/ }),
      ).toBeInTheDocument();
    });
  });

  it("affiche les stat cards du run", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getAllByText("Participants").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText("En cours").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Terminés").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Plus rapide")).toBeInTheDocument();
    });
  });

  it("affiche le heading Participations", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Participations" }),
      ).toBeInTheDocument();
    });
  });

  it("affiche Run introuvable pour un id inexistant", async () => {
    await renderDetail("9999");
    await waitFor(() => {
      expect(screen.getByText("Run introuvable.")).toBeInTheDocument();
    });
  });

  it("affiche le bouton retour à la liste", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Runs" })).toBeInTheDocument();
    });
  });

  it("affiche les dates du run", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(screen.getByText(/Debut/)).toBeInTheDocument();
      expect(screen.getByText(/Fin/)).toBeInTheDocument();
    });
  });

  it("affiche les actions modifier/supprimer sur les participations", async () => {
    await renderDetail("1");
    await waitFor(() => {
      expect(
        screen.getAllByLabelText(/Modifier l'heure/).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByLabelText(/Supprimer la participation/).length,
      ).toBeGreaterThan(0);
    });
  });
});
