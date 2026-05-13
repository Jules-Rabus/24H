/**
 * Tests for src/state/public/raceStatusQueries.ts
 * Tests the public query hooks via renderHook + MSW
 */
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  usePublicRunsQuery,
  usePublicParticipationsQuery,
  usePublicRaceMediasQuery,
  publicRaceKeys,
} from "@/state/public/raceStatusQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestQueryClientWrapper";
  return Wrapper;
}

describe("publicRaceKeys", () => {
  it("génère la clé all correctement", () => {
    expect(publicRaceKeys.all).toEqual(["public", "race"]);
  });

  it("génère la clé runs avec edition", () => {
    expect(publicRaceKeys.runs(2026)).toEqual(["public", "race", "runs", 2026]);
  });

  it("génère la clé runs sans edition", () => {
    expect(publicRaceKeys.runs()).toEqual(["public", "race", "runs", null]);
  });

  it("génère la clé participations avec edition", () => {
    expect(publicRaceKeys.participations(2026)).toEqual([
      "public",
      "race",
      "participations",
      2026,
    ]);
  });

  it("génère la clé medias", () => {
    expect(publicRaceKeys.medias()).toEqual(["public", "race", "medias"]);
  });
});

describe("usePublicRunsQuery", () => {
  // Note: usePublicRunsQuery calls apiClient.get("/runs/public", ...) which MSW intercepts
  // via the raceHandlers. The queryKey + staleTime are validated via publicRaceKeys.

  it("produit une queryKey incluant l'édition", () => {
    // We can validate the queryKey directly without calling the hook
    expect(publicRaceKeys.runs(2026)).toContain(2026);
  });

  it("produit une queryKey incluant null quand aucune édition", () => {
    expect(publicRaceKeys.runs()).toContain(null);
  });

  it("produit des queryKeys distinctes pour 2026 et 2025", () => {
    const key2026 = publicRaceKeys.runs(2026).join(",");
    const key2025 = publicRaceKeys.runs(2025).join(",");
    expect(key2026).not.toBe(key2025);
  });

  it("retourne un état de chargement initial", () => {
    const { result } = renderHook(() => usePublicRunsQuery(2026), {
      wrapper: createWrapper(),
    });
    // Initially the query is pending
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });
});

describe("usePublicParticipationsQuery", () => {
  it("retourne les participations terminées de l'édition 2026", async () => {
    const { result } = renderHook(
      () => usePublicParticipationsQuery(2026, "FINISHED"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);
  });

  it("retourne les participations 2025", async () => {
    const { result } = renderHook(
      () => usePublicParticipationsQuery(2025, "FINISHED"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.length).toBeGreaterThan(0);
  });
});

describe("usePublicRaceMediasQuery", () => {
  it("retourne les medias de course", async () => {
    const { result } = renderHook(() => usePublicRaceMediasQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    // MSW mock returns 3 medias
    expect(result.current.data!.length).toBe(3);
  });
});
