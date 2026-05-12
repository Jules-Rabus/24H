import { http, HttpResponse } from "msw";
import { buildRun } from "../factories";

const mockRuns2026 = [
  buildRun({
    id: 1,
    startDate: "2026-03-15T08:00:00+00:00",
    endDate: "2026-03-15T08:30:00+00:00",
    participantsCount: 30,
  }),
  buildRun({
    id: 2,
    startDate: "2026-03-15T09:00:00+00:00",
    endDate: "2026-03-15T09:30:00+00:00",
    participantsCount: 30,
  }),
  buildRun({
    id: 3,
    startDate: "2026-03-15T10:00:00+00:00",
    endDate: "2026-03-15T10:30:00+00:00",
    participantsCount: 30,
  }),
  buildRun({
    id: 4,
    startDate: "2026-03-15T11:00:00+00:00",
    endDate: "2026-03-15T11:30:00+00:00",
    participantsCount: 30,
  }),
  buildRun({
    id: 5,
    startDate: "2026-03-15T12:00:00+00:00",
    endDate: "2026-03-15T12:30:00+00:00",
    participantsCount: 30,
  }),
];

const mockRuns2025 = [
  buildRun({
    id: 101,
    startDate: "2025-03-15T08:00:00+00:00",
    endDate: "2025-03-15T08:30:00+00:00",
    participantsCount: 24,
  }),
  buildRun({
    id: 102,
    startDate: "2025-03-15T09:00:00+00:00",
    endDate: "2025-03-15T09:30:00+00:00",
    participantsCount: 24,
  }),
  buildRun({
    id: 103,
    startDate: "2025-03-15T10:00:00+00:00",
    endDate: "2025-03-15T10:30:00+00:00",
    participantsCount: 24,
  }),
  buildRun({
    id: 104,
    startDate: "2025-03-15T11:00:00+00:00",
    endDate: "2025-03-15T11:30:00+00:00",
    participantsCount: 24,
  }),
];

function runRef(
  id: number,
  startDate: string,
  endDate: string,
  edition: number,
) {
  return { id, startDate, endDate, edition };
}

const USERS = [
  { id: 1, firstName: "Jean", lastName: "Dupont", surname: "Speedy" },
  { id: 2, firstName: "Marie", lastName: "Curie", surname: "Radium" },
  { id: 3, firstName: "Alex", lastName: "Chen", surname: "Dragon" },
  { id: 4, firstName: "Léa", lastName: "Martin", surname: "Storm" },
  { id: 5, firstName: "Tom", lastName: "Bernard", surname: "Rocket" },
  { id: 6, firstName: "Emma", lastName: "Petit", surname: "Eagle" },
];

function buildArrival(
  id: number,
  runId: number,
  runStart: string,
  runEnd: string,
  edition: number,
  userIdx: number,
  arrivalTime: string,
  totalTime: number,
) {
  const u = USERS[userIdx % USERS.length];
  return {
    "@id": `/participations/${id}`,
    "@type": "Participation",
    id,
    run: runRef(runId, runStart, runEnd, edition),
    user: { ...u, image: null },
    arrivalTime,
    totalTime,
    status: "FINISHED",
  };
}

// 2026 : 4 runs finis (avg pace décroissant : on s'améliore) + run 5 vide.
// avg 2026 par run : R1≈1500 (375s/km), R2≈1440 (360s/km), R3≈1410 (352s/km), R4≈1380 (345s/km).
const mockParticipations = [
  // Run 1
  buildArrival(
    1,
    1,
    "2026-03-15T08:00:00+00:00",
    "2026-03-15T08:30:00+00:00",
    2026,
    0,
    "2026-03-15T08:24:00+00:00",
    1440,
  ),
  buildArrival(
    2,
    1,
    "2026-03-15T08:00:00+00:00",
    "2026-03-15T08:30:00+00:00",
    2026,
    1,
    "2026-03-15T08:25:30+00:00",
    1530,
  ),
  buildArrival(
    3,
    1,
    "2026-03-15T08:00:00+00:00",
    "2026-03-15T08:30:00+00:00",
    2026,
    2,
    "2026-03-15T08:26:00+00:00",
    1560,
  ),
  buildArrival(
    4,
    1,
    "2026-03-15T08:00:00+00:00",
    "2026-03-15T08:30:00+00:00",
    2026,
    3,
    "2026-03-15T08:24:30+00:00",
    1470,
  ),
  // Run 2
  buildArrival(
    5,
    2,
    "2026-03-15T09:00:00+00:00",
    "2026-03-15T09:30:00+00:00",
    2026,
    0,
    "2026-03-15T09:23:00+00:00",
    1380,
  ),
  buildArrival(
    6,
    2,
    "2026-03-15T09:00:00+00:00",
    "2026-03-15T09:30:00+00:00",
    2026,
    1,
    "2026-03-15T09:24:00+00:00",
    1440,
  ),
  buildArrival(
    7,
    2,
    "2026-03-15T09:00:00+00:00",
    "2026-03-15T09:30:00+00:00",
    2026,
    4,
    "2026-03-15T09:25:00+00:00",
    1500,
  ),
  // Run 3
  buildArrival(
    8,
    3,
    "2026-03-15T10:00:00+00:00",
    "2026-03-15T10:30:00+00:00",
    2026,
    0,
    "2026-03-15T10:23:30+00:00",
    1410,
  ),
  buildArrival(
    9,
    3,
    "2026-03-15T10:00:00+00:00",
    "2026-03-15T10:30:00+00:00",
    2026,
    5,
    "2026-03-15T10:24:00+00:00",
    1440,
  ),
  buildArrival(
    10,
    3,
    "2026-03-15T10:00:00+00:00",
    "2026-03-15T10:30:00+00:00",
    2026,
    2,
    "2026-03-15T10:23:00+00:00",
    1380,
  ),
  // Run 4 (le plus récent — premier dans la liste)
  buildArrival(
    11,
    4,
    "2026-03-15T11:00:00+00:00",
    "2026-03-15T11:30:00+00:00",
    2026,
    0,
    "2026-03-15T11:22:30+00:00",
    1350,
  ),
  buildArrival(
    12,
    4,
    "2026-03-15T11:00:00+00:00",
    "2026-03-15T11:30:00+00:00",
    2026,
    3,
    "2026-03-15T11:23:00+00:00",
    1380,
  ),
  buildArrival(
    13,
    4,
    "2026-03-15T11:00:00+00:00",
    "2026-03-15T11:30:00+00:00",
    2026,
    4,
    "2026-03-15T11:24:00+00:00",
    1440,
  ),
];

// 2025 : 4 runs finis, allures un peu plus lentes que 2026 (référence historique).
const mockParticipations2025 = [
  // Run 1
  buildArrival(
    101,
    101,
    "2025-03-15T08:00:00+00:00",
    "2025-03-15T08:30:00+00:00",
    2025,
    0,
    "2025-03-15T08:26:00+00:00",
    1560,
  ),
  buildArrival(
    102,
    101,
    "2025-03-15T08:00:00+00:00",
    "2025-03-15T08:30:00+00:00",
    2025,
    1,
    "2025-03-15T08:27:00+00:00",
    1620,
  ),
  buildArrival(
    103,
    101,
    "2025-03-15T08:00:00+00:00",
    "2025-03-15T08:30:00+00:00",
    2025,
    2,
    "2025-03-15T08:26:30+00:00",
    1590,
  ),
  // Run 2
  buildArrival(
    104,
    102,
    "2025-03-15T09:00:00+00:00",
    "2025-03-15T09:30:00+00:00",
    2025,
    0,
    "2025-03-15T09:25:00+00:00",
    1500,
  ),
  buildArrival(
    105,
    102,
    "2025-03-15T09:00:00+00:00",
    "2025-03-15T09:30:00+00:00",
    2025,
    3,
    "2025-03-15T09:26:00+00:00",
    1560,
  ),
  // Run 3
  buildArrival(
    106,
    103,
    "2025-03-15T10:00:00+00:00",
    "2025-03-15T10:30:00+00:00",
    2025,
    0,
    "2025-03-15T10:24:00+00:00",
    1440,
  ),
  buildArrival(
    107,
    103,
    "2025-03-15T10:00:00+00:00",
    "2025-03-15T10:30:00+00:00",
    2025,
    1,
    "2025-03-15T10:25:30+00:00",
    1530,
  ),
  // Run 4
  buildArrival(
    108,
    104,
    "2025-03-15T11:00:00+00:00",
    "2025-03-15T11:30:00+00:00",
    2025,
    0,
    "2025-03-15T11:24:30+00:00",
    1470,
  ),
  buildArrival(
    109,
    104,
    "2025-03-15T11:00:00+00:00",
    "2025-03-15T11:30:00+00:00",
    2025,
    2,
    "2025-03-15T11:25:00+00:00",
    1500,
  ),
];

function filterRunsByEdition(edition: string | null) {
  if (!edition) return [...mockRuns2026, ...mockRuns2025];
  if (Number(edition) === 2026) return mockRuns2026;
  if (Number(edition) === 2025) return mockRuns2025;
  return [];
}

function filterParticipationsByEdition(edition: string | null) {
  if (!edition) return [...mockParticipations, ...mockParticipations2025];
  if (Number(edition) === 2026) return mockParticipations;
  if (Number(edition) === 2025) return mockParticipations2025;
  return [];
}

export const raceHandlers = [
  // Public routes first — MSW v2 is path-based but listing them first
  // guarantees they win any potential pattern collision.
  http.get("*/runs/public", ({ request }) => {
    const url = new URL(request.url);
    const edition = url.searchParams.get("edition");
    const runs = filterRunsByEdition(edition).map((r) => {
      // edition derived from startDate year — guard against malformed dates.
      let yr: number | null = null;
      try {
        const y = new Date(String(r.startDate)).getFullYear();
        if (Number.isFinite(y)) yr = y;
      } catch {
        yr = null;
      }
      return { ...r, edition: yr };
    });
    return HttpResponse.json({
      "@context": "/contexts/Run",
      "@id": "/runs/public",
      "@type": "hydra:Collection",
      member: runs,
      "hydra:totalItems": runs.length,
    });
  }),

  http.get("*/participations/public", ({ request }) => {
    const url = new URL(request.url);
    const edition = url.searchParams.get("edition");
    const status = url.searchParams.get("status");
    let list = filterParticipationsByEdition(edition);
    if (status) list = list.filter((p) => p.status === status);
    return HttpResponse.json({
      "@context": "/contexts/Participation",
      "@id": "/participations/public",
      "@type": "hydra:Collection",
      member: list,
      "hydra:totalItems": list.length,
    });
  }),

  http.get("*/runs", ({ request }) => {
    const url = new URL(request.url);
    const edition = url.searchParams.get("edition");
    const runs = filterRunsByEdition(edition);
    return HttpResponse.json({
      "@context": "/contexts/Run",
      "@id": "/runs",
      "@type": "hydra:Collection",
      member: runs,
      "hydra:totalItems": runs.length,
    });
  }),

  http.get("*/participations", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    let list = mockParticipations;
    if (status) list = list.filter((p) => p.status === status);
    return HttpResponse.json({
      "@context": "/contexts/Participation",
      "@id": "/participations",
      "@type": "hydra:Collection",
      member: list,
      "hydra:totalItems": list.length,
    });
  }),
];
