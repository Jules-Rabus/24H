import { z } from "zod";
import { raceMediaSchema } from "@/state/media/schemas";

type RaceMedia = z.infer<typeof raceMediaSchema>;

let mediaId = 1;

export function buildRaceMedia(overrides: Partial<RaceMedia> = {}): RaceMedia {
  const id = overrides.id ?? mediaId++;
  return {
    id,
    filePath: `photo${id}.jpg`,
    // Use picsum placeholder so dev:mock has real images to render.
    contentUrl: `https://picsum.photos/seed/race-${id}/600/400`,
    comment: `Photo ${id}`,
    createdAt: "2026-03-15T14:32:00Z",
    likesCount: 0,
    contentType: "image/jpeg",
    ...overrides,
  };
}

export function resetMediaIds(): void {
  mediaId = 1;
}
