import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import PublicRaceStatusPage from "../page";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
import { mockRaceStatusData, mockParticipationsData, mockRunsData, mockMediasData } from "@/state/race/__tests__/data";
import { mockWeatherData } from "@/state/weather/__tests__/data";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("PublicRaceStatusPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default MSW handlers
    server.use(
      http.get("http://localhost/api/public/race-status", () => {
        return HttpResponse.json(mockRaceStatusData);
      }),
      http.get("http://localhost/participations", () => {
        return HttpResponse.json(mockParticipationsData);
      }),
      http.get("http://localhost/runs", () => {
        return HttpResponse.json(mockRunsData);
      }),
      http.get("http://localhost/race_medias", () => {
        return HttpResponse.json(mockMediasData);
      }),
      http.get("https://api.open-meteo.com/v1/forecast", () => {
        return HttpResponse.json(mockWeatherData);
      })
    );
  });

  it("affiche le titre de la page", async () => {
    render(<PublicRaceStatusPage />);
    expect(await screen.findByText(/UniLaSalle Beauvais/i)).toBeInTheDocument();
  });

  it("affiche la météo après chargement", async () => {
    render(<PublicRaceStatusPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/14\.5/i).length).toBeGreaterThan(0);
    });
  });

  it("affiche la section des derniers arrivants", async () => {
    render(<PublicRaceStatusPage />);
    expect(await screen.findByText(/Derniers Arrivés/i)).toBeInTheDocument();
  });

  it("affiche l'état de chargement", async () => {
    render(<PublicRaceStatusPage />);
    expect(document.querySelector(".chakra-skeleton")).toBeInTheDocument();
  });

  it("gère l'absence de données de participations et courses", async () => {
    server.use(
      http.get("http://localhost/participations", () => HttpResponse.json({ "hydra:member": [] })),
      http.get("http://localhost/runs", () => HttpResponse.json({ "hydra:member": [] }))
    );

    render(<PublicRaceStatusPage />);

    expect(await screen.findByText(/En attente des arrivées/i)).toBeInTheDocument();
  });

  it("gère l'absence de météo", async () => {
    server.use(
      http.get("https://api.open-meteo.com/v1/forecast", () => new HttpResponse(null, { status: 500 }))
    );

    render(<PublicRaceStatusPage />);

    await waitFor(() => {
      expect(screen.queryAllByText(/--/i).length).toBeGreaterThan(0);
    });
  });
});
