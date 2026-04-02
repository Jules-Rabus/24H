import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLikes } from "@/hooks/useLikes";

// Ensure apiClient is NOT imported/called
vi.mock("@/api/client", () => ({
  apiClient: {
    post: vi.fn(() => {
      throw new Error("apiClient must not be called from useLikes");
    }),
  },
}));

describe("useLikes", () => {
  beforeEach(() => localStorage.clear());

  it("hasLiked returns false initially", () => {
    const { result } = renderHook(() => useLikes());
    expect(result.current.hasLiked(1)).toBe(false);
  });

  it("hydrates liked ids from localStorage on mount", () => {
    localStorage.setItem("24h_likes", JSON.stringify([10, 20]));
    const { result } = renderHook(() => useLikes());
    expect(result.current.hasLiked(10)).toBe(true);
    expect(result.current.hasLiked(20)).toBe(true);
    expect(result.current.hasLiked(99)).toBe(false);
  });

  it("like(id) saves id to localStorage without calling apiClient", async () => {
    const { result } = renderHook(() => useLikes());
    await act(async () => {
      result.current.like(1);
    });
    expect(result.current.hasLiked(1)).toBe(true);
    expect(JSON.parse(localStorage.getItem("24h_likes")!)).toContain(1);
  });

  it("like(id) is a no-op if already liked", async () => {
    const { result } = renderHook(() => useLikes());
    await act(async () => {
      result.current.like(1);
    });
    await act(async () => {
      result.current.like(1);
    });
    expect(JSON.parse(localStorage.getItem("24h_likes")!)).toHaveLength(1);
  });
});
