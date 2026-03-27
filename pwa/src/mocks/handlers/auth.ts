import { http, HttpResponse } from "msw"

export const authHandlers = [
  http.post("*/login", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": "BEARER=fake-jwt-token; HttpOnly; Path=/",
      },
    })
  }),

  http.post("*/logout", () => {
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Set-Cookie": "BEARER=; HttpOnly; Path=/; Max-Age=0",
      },
    })
  }),

  http.get("*/users/me", () => {
    return HttpResponse.json({
      id: 1,
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      roles: ["ROLE_ADMIN"],
    })
  }),

  http.post("*/forgot-password/", () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
