import { http, HttpResponse } from "msw";
import {
  buildAdminRun,
  buildAdminUser,
  buildAdminParticipation,
} from "../factories";

const mockAdminRuns = [
  buildAdminRun({
    id: 1,
    startDate: "2026-03-15T08:00:00+00:00",
    endDate: "2026-03-15T08:30:00+00:00",
    participantsCount: 10,
    inProgressParticipantsCount: 3,
    finishedParticipantsCount: 7,
    averageTime: 1620,
    fastestTime: 1320,
  }),
  buildAdminRun({
    id: 2,
    startDate: "2026-03-15T09:00:00+00:00",
    endDate: "2026-03-15T09:30:00+00:00",
    participantsCount: 8,
    inProgressParticipantsCount: 2,
    finishedParticipantsCount: 6,
    averageTime: 1700,
    fastestTime: 1400,
  }),
];

const mockAdminUsers = [
  buildAdminUser({
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@example.com",
    roles: ["ROLE_USER"],
    organization: "ACBB",
    finishedParticipationsCount: 8,
  }),
  buildAdminUser({
    id: 2,
    firstName: "Marie",
    lastName: "Curie",
    email: "marie@example.com",
    roles: ["ROLE_ADMIN"],
    organization: null,
    finishedParticipationsCount: 12,
  }),
  buildAdminUser({
    id: 3,
    firstName: "Pierre",
    lastName: "Martin",
    email: null,
    roles: ["ROLE_USER"],
    surname: "Flash",
    finishedParticipationsCount: 3,
  }),
];

const mockAdminParticipations = [
  buildAdminParticipation({
    id: 1,
    run: {
      id: 1,
      startDate: "2026-03-15T08:00:00+00:00",
      endDate: "2026-03-15T08:30:00+00:00",
    },
    user: {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont",
      surname: null,
      image: null,
    },
    status: "FINISHED",
    totalTime: 1440,
  }),
  buildAdminParticipation({
    id: 2,
    run: {
      id: 1,
      startDate: "2026-03-15T08:00:00+00:00",
      endDate: "2026-03-15T08:30:00+00:00",
    },
    user: {
      id: 2,
      firstName: "Marie",
      lastName: "Curie",
      surname: null,
      image: null,
    },
    status: "IN_PROGRESS",
    arrivalTime: null,
    totalTime: null,
  }),
  buildAdminParticipation({
    id: 3,
    run: {
      id: 2,
      startDate: "2026-03-15T09:00:00+00:00",
      endDate: "2026-03-15T09:30:00+00:00",
    },
    user: {
      id: 3,
      firstName: "Pierre",
      lastName: "Martin",
      surname: "Flash",
      image: null,
    },
    status: "FINISHED",
    totalTime: 1560,
  }),
];

export const adminHandlers = [
  // Runs
  http.get("*/runs", ({ request }) => {
    const url = new URL(request.url);
    // MSW v2's `*` is greedy across path segments — opt out of public routes.
    if (url.pathname.includes("/public/")) return;
    if (!url.searchParams.has("itemsPerPage")) return;
    return HttpResponse.json(mockAdminRuns);
  }),

  http.get("*/runs/:id", ({ params, request }) => {
    const url = new URL(request.url);
    if (url.pathname.includes("/public/")) return;
    const run = mockAdminRuns.find((r) => r.id === Number(params.id));
    if (!run)
      return HttpResponse.json({ detail: "Not found" }, { status: 404 });
    return HttpResponse.json(run);
  }),

  http.post("*/runs", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      buildAdminRun({
        id: 99,
        startDate: body.startDate as string,
        endDate: body.endDate as string,
      }),
      { status: 201 },
    );
  }),

  http.patch("*/runs/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockAdminRuns.find((r) => r.id === Number(params.id));
    return HttpResponse.json({ ...existing, ...body });
  }),

  http.delete("*/runs/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Users
  http.get("*/users", ({ request }) => {
    const url = new URL(request.url);
    // MSW v2's `*` matches multiple path segments, so /public/users would
    // otherwise fall into this admin handler. Bypass when the path is public.
    if (url.pathname.includes("/public/")) return;
    if (!url.searchParams.has("itemsPerPage")) return;
    return HttpResponse.json(mockAdminUsers);
  }),

  http.get("*/users/:id", ({ params, request }) => {
    const url = new URL(request.url);
    if (url.pathname.includes("/public/")) return;
    if (params.id === "public") return;
    const user = mockAdminUsers.find((u) => u.id === Number(params.id));
    if (!user)
      return HttpResponse.json({ detail: "Not found" }, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.post("*/users", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      buildAdminUser({
        id: 99,
        firstName: body.firstName as string,
        lastName: body.lastName as string,
      }),
      { status: 201 },
    );
  }),

  http.patch("*/users/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockAdminUsers.find((u) => u.id === Number(params.id));
    return HttpResponse.json({ ...existing, ...body });
  }),

  http.delete("*/users/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // User image upload
  http.post("*/users/:id/image", () => {
    return HttpResponse.json({ image: "/media/images/uploaded.jpg" });
  }),

  // User image delete
  http.delete("*/users/:id/image", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Participations
  http.get("*/participations", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.includes("/public/")) return;
    if (!url.searchParams.has("itemsPerPage")) return;
    const userId = url.searchParams.get("user.id");
    const runId = url.searchParams.get("run.id");
    let filtered = mockAdminParticipations;
    if (userId)
      filtered = filtered.filter((p) => p.user?.id === Number(userId));
    if (runId) filtered = filtered.filter((p) => p.run?.id === Number(runId));
    return HttpResponse.json(filtered);
  }),

  http.post("*/participations", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      buildAdminParticipation({
        id: 99,
        status: "IN_PROGRESS",
        arrivalTime: null,
        totalTime: null,
      }),
      { status: 201 },
    );
  }),

  http.patch("*/participations/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockAdminParticipations.find(
      (p) => p.id === Number(params.id),
    );
    return HttpResponse.json({ ...existing, ...body });
  }),

  http.delete("*/participations/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
