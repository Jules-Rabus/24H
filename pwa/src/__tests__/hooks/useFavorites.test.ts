import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/useFavorites";

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty favorites", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("toggles a favorite on", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle(42));
    expect(result.current.isFavorite(42)).toBe(true);
    expect(result.current.favorites).toEqual([42]);
  });

  it("toggles a favorite off", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle(42));
    act(() => result.current.toggle(42));
    expect(result.current.isFavorite(42)).toBe(false);
    expect(result.current.favorites).toEqual([]);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle(1));
    act(() => result.current.toggle(2));
    expect(JSON.parse(localStorage.getItem("24h_favorites")!)).toEqual([1, 2]);
  });

  it("reads from localStorage on mount", () => {
    localStorage.setItem("24h_favorites", JSON.stringify([10, 20]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([10, 20]);
    expect(result.current.isFavorite(10)).toBe(true);
  });
});
