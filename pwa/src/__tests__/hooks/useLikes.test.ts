import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLikes } from "@/hooks/useLikes";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";

describe("useLikes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hasLiked returns false for unknown id", () => {
    const { result } = renderHook(() => useLikes());
    expect(result.current.hasLiked(99)).toBe(false);
  });

  it("like calls API and stores in localStorage", async () => {
    server.use(
      http.post("*/race_medias/1/like", () => {
        return HttpResponse.json({ id: 1, likesCount: 5 });
      }),
    );

    const { result } = renderHook(() => useLikes());
    await act(() => result.current.like(1));

    expect(result.current.hasLiked(1)).toBe(true);
    expect(JSON.parse(localStorage.getItem("24h_likes")!)).toContain(1);
  });

  it("blocks re-like if already liked", async () => {
    localStorage.setItem("24h_likes", JSON.stringify([1]));
    const handler = vi.fn();
    server.use(
      http.post("*/race_medias/1/like", () => {
        handler();
        return HttpResponse.json({ id: 1, likesCount: 6 });
      }),
    );

    const { result } = renderHook(() => useLikes());
    await act(() => result.current.like(1));

    expect(handler).not.toHaveBeenCalled();
  });

  it("reads liked ids from localStorage on mount", () => {
    localStorage.setItem("24h_likes", JSON.stringify([10, 20]));
    const { result } = renderHook(() => useLikes());
    expect(result.current.hasLiked(10)).toBe(true);
    expect(result.current.hasLiked(20)).toBe(true);
  });
});
