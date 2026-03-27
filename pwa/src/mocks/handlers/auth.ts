import { http, HttpResponse } from "msw"

export const authHandlers = [
  http.post("*/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email === "admin@example.com" && body.password === "password") {
      return HttpResponse.json({ token: "fake-jwt-token" })
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }),

  http.post("*/forgot-password/", () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
