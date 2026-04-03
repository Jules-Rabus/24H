import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import PublicRaceStatusPage from "../../app/public-race-status/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [() => null, { scrollPrev: vi.fn(), scrollNext: vi.fn() }],
}));

describe("PublicRaceStatusPage", () => {
  it("affiche le titre de la page", () => {
    render(<PublicRaceStatusPage />);
    expect(screen.getByText(/UniLaSalle Beauvais/i)).toBeInTheDocument();
  });

  it("affiche la météo après chargement", async () => {
    render(<PublicRaceStatusPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/14\.5°C/i).length).toBeGreaterThan(0);
    });
  });

  it("affiche la section des derniers arrivants", () => {
    render(<PublicRaceStatusPage />);
    expect(screen.getByText(/Derniers Arrivés/i)).toBeInTheDocument();
  });

  it("affiche la section photo wall QR", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Photo Wall/i)).toBeInTheDocument();
    });
  });

  it("affiche les stat cards de course", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Run en cours/i)).toBeInTheDocument();
    });
  });

  it("affiche le compteur de coureurs", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/coureurs/i).length).toBeGreaterThan(0);
    });
  });
});
