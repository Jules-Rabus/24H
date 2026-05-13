import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import { PublicRaceStatusPage } from "../../app/public-race-status/PublicRaceStatusPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/public-race-status",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [
    () => null,
    {
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      scrollTo: vi.fn(),
      canScrollPrev: () => true,
      canScrollNext: () => true,
      selectedScrollSnap: () => 0,
      on: vi.fn(),
      off: vi.fn(),
    },
  ],
}));

describe("PublicRaceStatusPage (display grand écran)", () => {
  it("affiche l'en-tête DÉFI 24H — UniLaSalle Beauvais", () => {
    render(<PublicRaceStatusPage />);
    expect(
      screen.getByText(/DÉFI 24H — UniLaSalle Beauvais/i),
    ).toBeInTheDocument();
  });

  it("affiche la température actuelle dans la TopBar", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      // TopBar uses `${currentTemp}°C` and WeatherPanel uses rounded `${temp}°`
      expect(screen.getAllByText(/14\.5°C|15°/i).length).toBeGreaterThan(0);
    });
  });

  it("affiche la section Météo actuelle", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Météo actuelle/i)).toBeInTheDocument();
    });
  });

  it("affiche les métriques météo (Ressenti, Vent, Humidité)", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/Ressenti/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Vent/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Humidité/i).length).toBeGreaterThan(0);
    });
  });

  it("affiche la section des Derniers Arrivés", () => {
    render(<PublicRaceStatusPage />);
    expect(screen.getByText(/Derniers Arrivés/i)).toBeInTheDocument();
  });

  it("affiche le QrPanel PARTAGEZ VOTRE MOMENT", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Photo Wall/i)).toBeInTheDocument();
      expect(screen.getByText(/PARTAGEZ/i)).toBeInTheDocument();
    });
  });

  it("affiche le stat KM Totaux", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/KM Totaux/i)).toBeInTheDocument();
    });
  });

  it("affiche le chart d'allure moyenne par run", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Allure moy\./i)).toBeInTheDocument();
    });
  });

  it("affiche le compteur de coureurs", async () => {
    render(<PublicRaceStatusPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/coureurs/i).length).toBeGreaterThan(0);
    });
  });
});
