import { http, HttpResponse } from "msw";

const mockRunners = [
  {
    "@id": "/users/1",
    "@type": "User",
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    surname: null,
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
  },
  {
    "@id": "/users/2",
    "@type": "User",
    id: 2,
    firstName: "Marie",
    lastName: "Curie",
    surname: "Radium",
    organization: null,
    image: null,
    finishedParticipationsCount: 12,
    totalTime: 20400,
    bestTime: 1320,
    averageTime: 1700,
    participations: [
      {
        id: 3,
        runId: 1,
        runStartDate: "2026-03-15T08:00:00Z",
        runEndDate: "2026-03-15T08:30:00Z",
        runEdition: 2026,
        arrivalTime: "2026-03-15T08:22:00Z",
        totalTime: 1320,
        status: "FINISHED",
      },
    ],
  },
];

export const runnersHandlers = [
  http.get("*/users/public", ({ request }) => {
    const url = new URL(request.url);
    const edition = url.searchParams.get("edition");
    const runners = edition
      ? mockRunners.map((r) => ({
          ...r,
          participations: r.participations.filter(
            (p) => p.runEdition === Number(edition),
          ),
        }))
      : mockRunners;
    return HttpResponse.json(runners);
  }),

  http.get("*/users/public/:id", ({ params }) => {
    const runner = mockRunners.find((r) => r.id === Number(params.id));
    if (!runner) return HttpResponse.json({}, { status: 404 });
    return HttpResponse.json(runner);
  }),
];
