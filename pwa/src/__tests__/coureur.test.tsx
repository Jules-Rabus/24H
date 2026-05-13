import { Suspense } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { render } from "../test-utils/render";
import { server } from "../mocks/server";
import { CoureurPage } from "../../app/coureurs/[id]/CoureurPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/coureurs/1",
  useSearchParams: () => new URLSearchParams("edition=2026"),
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => () => null,
}));

const mockRunner = {
  "@id": "/users/1",
  "@type": "User",
  id: 1,
  firstName: "Jean",
  lastName: "Dupont",
  surname: null,
  email: null,
  organization: "ACBB",
  image: null,
  finishedParticipationsCount: 8,
  totalTime: 14400,
  bestTime: 1440,
  averageTime: 1800,
  participations: [
    {
      id: 1,
      runId: 1,
      runStartDate: "2026-03-15T08:00:00Z",
      runEndDate: "2026-03-15T08:30:00Z",
      runEdition: 2026,
      arrivalTime: "2026-03-15T08:24:00Z",
      totalTime: 1440,
      status: "FINISHED",
    },
    {
      id: 2,
      runId: 2,
      runStartDate: "2026-03-15T09:00:00Z",
      runEndDate: "2026-03-15T09:30:00Z",
      runEdition: 2026,
      arrivalTime: "2026-03-15T09:30:00Z",
      totalTime: 1800,
      status: "FINISHED",
    },
    {
      id: 101,
      runId: 101,
      runStartDate: "2025-03-15T08:00:00Z",
      runEndDate: "2025-03-15T08:30:00Z",
      runEdition: 2025,
      arrivalTime: "2025-03-15T08:26:00Z",
      totalTime: 1560,
      status: "FINISHED",
    },
  ],
};

async function renderPage() {
  const paramsPromise = Promise.resolve({ id: "1" });
  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <CoureurPage params={paramsPromise} />
      </Suspense>,
    );
  });
}

describe("CoureurPage", () => {
  beforeEach(() => {
    server.use(
      http.get("http://localhost/public/users/:id", () => {
        return HttpResponse.json(mockRunner);
      }),
    );
  });

  it("affiche le nom du coureur", async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    });
  });

  it("affiche les StatCards tours et distance", async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("Tours terminés").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Distance").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Meilleur temps").length).toBeGreaterThan(0);
    });
  });

  it("affiche les onglets edition", async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("2026").length).toBeGreaterThan(0);
      expect(screen.getAllByText("2025").length).toBeGreaterThan(0);
    });
  });

  it("affiche allure et distance dans le detail des tours", async () => {
    await renderPage();
    await waitFor(() => {
      // "Allure moy." appears in StatCards (both editions)
      expect(screen.getAllByText(/Allure moy\./).length).toBeGreaterThan(0);
    });
    // StatCards include "Allure moy." and "Distance" for both editions
    expect(screen.getAllByText(/Allure moy\./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Distance/).length).toBeGreaterThan(0);
    // Detail table has "4 km" distance column (mobile cards visible in JSDOM)
    expect(screen.getAllByText("4 km").length).toBeGreaterThan(0);
  });
});
