import { http, HttpResponse } from "msw";
import { buildRunner, buildParticipation } from "../factories";

const mockParticipations = [
  buildParticipation({
    id: 1,
    runId: 1,
    runEdition: 2026,
    totalTime: 1440,
    arrivalTime: "2026-03-15T08:24:00Z",
  }),
  buildParticipation({
    id: 2,
    runId: 2,
    runEdition: 2026,
    runStartDate: "2026-03-15T09:00:00Z",
    runEndDate: "2026-03-15T09:30:00Z",
    arrivalTime: "2026-03-15T09:30:00Z",
    totalTime: 1800,
  }),
  buildParticipation({
    id: 101,
    runId: 101,
    runEdition: 2025,
    runStartDate: "2025-03-15T08:00:00Z",
    runEndDate: "2025-03-15T08:30:00Z",
    arrivalTime: "2025-03-15T08:26:00Z",
    totalTime: 1560,
  }),
  buildParticipation({
    id: 3,
    runId: 1,
    runEdition: 2026,
    arrivalTime: "2026-03-15T08:22:00Z",
    totalTime: 1320,
  }),
];

const mockRunners = [
  buildRunner({
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    organization: "ACBB",
    finishedParticipationsCount: 8,
    totalTime: 14400,
    bestTime: 1440,
    averageTime: 1800,
    participations: mockParticipations.filter((p) => p.id !== 3),
  }),
  buildRunner({
    id: 2,
    firstName: "Marie",
    lastName: "Curie",
    surname: "Radium",
    organization: null,
    finishedParticipationsCount: 12,
    totalTime: 20400,
    bestTime: 1320,
    averageTime: 1700,
    participations: mockParticipations.filter((p) => p.id === 3),
  }),
];

export const runnersHandlers = [
  http.get("*/users/public", ({ request }) => {
    const url = new URL(request.url);
    const edition = url.searchParams.get("edition");
    if (!edition) {
      return HttpResponse.json(mockRunners);
    }
    const editionNum = Number(edition);
    // Mimic the API: only return runners with at least one participation in
    // the requested edition. finishedParticipationsCount is left untouched —
    // in prod the backend already scopes it per edition.
    const runners = mockRunners
      .map((r) => ({
        ...r,
        participations: (r.participations ?? []).filter(
          (p) => p.runEdition === editionNum,
        ),
      }))
      .filter((r) => (r.participations?.length ?? 0) > 0);
    return HttpResponse.json(runners);
  }),

  http.get("*/users/public/:id", ({ params }) => {
    const runner = mockRunners.find((r) => r.id === Number(params.id));
    if (!runner) return HttpResponse.json({}, { status: 404 });
    return HttpResponse.json(runner);
  }),
];
