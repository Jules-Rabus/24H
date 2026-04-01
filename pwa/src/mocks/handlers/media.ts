import { http, HttpResponse } from "msw";

let mockLikesCount: Record<number, number> = { 1: 12, 2: 4, 3: 0 };

export const mediaHandlers = [
  http.get("*/race_medias", () => {
    return HttpResponse.json([
      {
        id: 1,
        filePath: "photo1.jpg",
        contentUrl: "/media/photo1.jpg",
        comment: "Super course !",
        createdAt: "2026-03-15T14:32:00Z",
        likesCount: mockLikesCount[1] ?? 12,
        contentType: "image/jpeg",
      },
      {
        id: 2,
        filePath: "video1.mp4",
        contentUrl: "/media/video1.mp4",
        comment: null,
        createdAt: "2026-03-15T15:10:00Z",
        likesCount: mockLikesCount[2] ?? 4,
        contentType: "video/mp4",
      },
      {
        id: 3,
        filePath: "photo2.jpg",
        contentUrl: "/media/photo2.jpg",
        comment: "Allez les bleus",
        createdAt: "2026-03-15T16:05:00Z",
        likesCount: mockLikesCount[3] ?? 0,
        contentType: "image/jpeg",
      },
    ]);
  }),

  http.post("*/race_medias/:id/like", ({ params }) => {
    const id = Number(params.id);
    mockLikesCount[id] = (mockLikesCount[id] ?? 0) + 1;
    return HttpResponse.json({ id, likesCount: mockLikesCount[id] });
  }),

  http.post("*/race_medias", () => {
    return HttpResponse.json(
      {
        "@id": "/race_medias/99",
        "@type": "RaceMedia",
        id: 99,
        filePath: "test.png",
        contentUrl: "/media/test.png",
        likesCount: 0,
        contentType: "image/png",
      },
      { status: 201 },
    );
  }),
];
