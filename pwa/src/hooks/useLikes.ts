"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/api/client";

const STORAGE_KEY = "24h_likes";

function readLikes(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLikes(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useLikes() {
  const [liked, setLiked] = useState<number[]>(readLikes);

  const hasLiked = useCallback((id: number) => liked.includes(id), [liked]);

  const like = useCallback(
    async (id: number) => {
      if (liked.includes(id)) return;
      await apiClient.post(`/race_medias/${id}/like`);
      setLiked((prev) => {
        const next = [...prev, id];
        writeLikes(next);
        return next;
      });
    },
    [liked],
  );

  return { hasLiked, like };
}
