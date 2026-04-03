import { http, HttpResponse } from "msw";
import { buildMe } from "../factories";

export const authHandlers = [
  http.post("*/login", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": "BEARER=fake-jwt-token; HttpOnly; Path=/",
      },
    });
  }),

  http.post("*/logout", () => {
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Set-Cookie": "BEARER=; HttpOnly; Path=/; Max-Age=0",
      },
    });
  }),

  http.get("*/me", () => {
    return HttpResponse.json(buildMe());
  }),

  http.post("*/forgot-password/", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
