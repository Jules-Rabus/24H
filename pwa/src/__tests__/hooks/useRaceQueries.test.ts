/**
 * Tests for src/state/race/queries.ts
 * Tests the admin race query hooks via renderHook + MSW
 */
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useRunsQuery,
  useParticipationsQuery,
  raceKeys,
} from "@/state/race/queries";
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

describe("raceKeys", () => {
  it("génère la clé all", () => {
    expect(raceKeys.all).toEqual(["race"]);
  });

  it("génère la clé runs", () => {
    expect(raceKeys.runs()).toEqual(["race", "runs"]);
  });

  it("génère la clé participations", () => {
    expect(raceKeys.participations()).toEqual(["race", "participations"]);
  });
});

describe("useRunsQuery", () => {
  it("retourne un état initial de chargement", () => {
    const { result } = renderHook(() => useRunsQuery(), {
      wrapper: createWrapper(),
    });
    // Initially pending — data is undefined
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it("accepte le hook sans erreur au montage", () => {
    expect(() => {
      renderHook(() => useRunsQuery(), { wrapper: createWrapper() });
    }).not.toThrow();
  });
});

describe("useParticipationsQuery", () => {
  it("retourne un état initial de chargement", () => {
    const { result } = renderHook(() => useParticipationsQuery(), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it("accepte le hook sans erreur au montage", () => {
    expect(() => {
      renderHook(() => useParticipationsQuery(), { wrapper: createWrapper() });
    }).not.toThrow();
  });
});
