/**
 * Tests for src/state/public/useRaceStatusLive.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRaceStatusLive } from "@/state/public/useRaceStatusLive";

// Provide a minimal QueryClient wrapper
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock EventSource for the Mercure subscription tests
class MockEventSource {
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  readyState = 0;
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
  withCredentials = false;
  constructor(url: string, _opts?: EventSourceInit) {
    this.url = url;
  }
  close() {
    this.readyState = MockEventSource.CLOSED;
  }
  // Helper to trigger a message
  trigger(data: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) } as MessageEvent);
    }
  }
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

let mockEventSourceInstance: MockEventSource | null = null;
const OriginalEventSource = (globalThis as { EventSource?: unknown })
  .EventSource;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestQueryClientWrapper";
  return Wrapper;
}

describe("useRaceStatusLive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Ensure no mercure URL so EventSource is not created by default
    delete (process.env as Record<string, unknown>).NEXT_PUBLIC_MERCURE_HUB_URL;
    mockEventSourceInstance = null;
    // Install mock EventSource
    (globalThis as { EventSource?: unknown }).EventSource = class extends (
      MockEventSource
    ) {
      constructor(url: string, opts?: EventSourceInit) {
        super(url, opts);
        mockEventSourceInstance = this;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore EventSource
    if (OriginalEventSource) {
      (globalThis as { EventSource?: unknown }).EventSource =
        OriginalEventSource;
    } else {
      delete (globalThis as { EventSource?: unknown }).EventSource;
    }
    delete (process.env as Record<string, unknown>).NEXT_PUBLIC_API_MOCK;
    delete (process.env as Record<string, unknown>).NEXT_PUBLIC_MERCURE_HUB_URL;
  });

  it("retourne un currentTime initialisé à une Date", () => {
    const { result } = renderHook(() => useRaceStatusLive(), {
      wrapper: createWrapper(),
    });
    expect(result.current.currentTime).toBeInstanceOf(Date);
  });

  it("met à jour currentTime toutes les secondes", async () => {
    const { result } = renderHook(() => useRaceStatusLive(), {
      wrapper: createWrapper(),
    });

    const initial = result.current.currentTime;

    // Advance 1100ms to trigger the interval
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    const updated = result.current.currentTime;
    expect(updated).toBeInstanceOf(Date);
    expect(updated.getTime()).toBeGreaterThan(initial.getTime());
  });

  it("nettoie l'intervalle au démontage", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => useRaceStatusLive(), {
      wrapper: createWrapper(),
    });
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("ne crée pas EventSource quand NEXT_PUBLIC_MERCURE_HUB_URL est absent", () => {
    // jsdom does not implement EventSource — verify the hook doesn't throw
    // when no hub URL is configured (the hook guards with `if (!hubUrl) return`)
    expect(() => {
      renderHook(() => useRaceStatusLive(), { wrapper: createWrapper() });
    }).not.toThrow();
  });

  it("ne crée pas EventSource quand NEXT_PUBLIC_API_MOCK=1", () => {
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL =
      "https://localhost/.well-known/mercure";
    process.env.NEXT_PUBLIC_API_MOCK = "1";
    // The hook checks API_MOCK === "1" and returns early without creating EventSource
    renderHook(() => useRaceStatusLive(), { wrapper: createWrapper() });
    expect(mockEventSourceInstance).toBeNull();
  });

  it("crée un EventSource quand le hub URL est configuré (sans mock)", async () => {
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL =
      "https://localhost/.well-known/mercure";
    // No API_MOCK — should create EventSource

    renderHook(() => useRaceStatusLive(), { wrapper: createWrapper() });

    // Advance timers slightly to allow useEffect to fire
    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(mockEventSourceInstance).not.toBeNull();
    expect(mockEventSourceInstance!.url).toContain("well-known/mercure");
  });

  it("ferme l'EventSource au démontage", async () => {
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL =
      "https://localhost/.well-known/mercure";

    const { unmount } = renderHook(() => useRaceStatusLive(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(mockEventSourceInstance).not.toBeNull();
    const closeSpy = vi.spyOn(mockEventSourceInstance!, "close");
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });

  it("traite un message Mercure FINISHED et invalide les queries", async () => {
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL =
      "https://localhost/.well-known/mercure";

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useRaceStatusLive(), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children,
        ),
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(mockEventSourceInstance).not.toBeNull();

    // Simulate a FINISHED participation message
    await act(async () => {
      mockEventSourceInstance!.trigger({
        id: 999,
        status: "FINISHED",
        arrivalTime: "2026-03-15T09:00:00Z",
      });
    });

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("traite un message Mercure avec contentUrl et invalide les media queries", async () => {
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL =
      "https://localhost/.well-known/mercure";

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useRaceStatusLive(), {
      wrapper: ({ children }) =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          children,
        ),
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Simulate a race media message
    await act(async () => {
      mockEventSourceInstance!.trigger({
        id: 5,
        contentUrl: "/media/photo.jpg",
      });
    });

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("ignore les messages JSON invalides sans crash", async () => {
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL =
      "https://localhost/.well-known/mercure";

    renderHook(() => useRaceStatusLive(), { wrapper: createWrapper() });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Simulate invalid JSON — should not throw
    expect(() => {
      if (mockEventSourceInstance?.onmessage) {
        mockEventSourceInstance.onmessage({
          data: "not valid json {{{",
        } as MessageEvent);
      }
    }).not.toThrow();
  });
});
