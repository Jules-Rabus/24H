import { http, HttpResponse } from "msw";
import { buildRaceMedia } from "../factories";

const defaultMedias = () => [
  buildRaceMedia({
    id: 1,
    filePath: "photo1.jpg",
    contentUrl: "/media/photo1.jpg",
    comment: "Super course !",
    likesCount: 12,
    contentType: "image/jpeg",
  }),
  buildRaceMedia({
    id: 2,
    filePath: "video1.mp4",
    contentUrl: "/media/video1.mp4",
    comment: null,
    likesCount: 4,
    contentType: "video/mp4",
    createdAt: "2026-03-15T15:10:00Z",
  }),
  buildRaceMedia({
    id: 3,
    filePath: "photo2.jpg",
    contentUrl: "/media/photo2.jpg",
    comment: "Allez les bleus",
    likesCount: 0,
    createdAt: "2026-03-15T16:05:00Z",
  }),
];

let mockLikesCount: Record<number, number> = {};

export function resetMediaHandlerState(): void {
  mockLikesCount = {};
}

export const mediaHandlers = [
  http.get("*/race_medias", () => {
    const medias = defaultMedias().map((m) => ({
      ...m,
      likesCount: mockLikesCount[m.id!] ?? m.likesCount,
    }));
    return HttpResponse.json(medias);
  }),

  http.post("*/race_medias/:id/like", ({ params }) => {
    const id = Number(params.id);
    mockLikesCount[id] = (mockLikesCount[id] ?? 0) + 1;
    return HttpResponse.json({ id, likesCount: mockLikesCount[id] });
  }),

  http.post("*/race_medias", () => {
    return HttpResponse.json(
      buildRaceMedia({
        id: 99,
        filePath: "test.png",
        contentUrl: "/media/test.png",
        contentType: "image/png",
      }),
      { status: 201 },
    );
  }),
];
