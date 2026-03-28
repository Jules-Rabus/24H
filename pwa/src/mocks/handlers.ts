import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.open-meteo.com/v1/forecast", () => {
    return HttpResponse.json({
      current: {
        temperature_2m: 14.5,
        weather_code: 3,
      },
      hourly: {
        temperature_2m: [14.0, 14.5, 15.0],
        weather_code: [1, 2, 3],
      },
    });
  }),

  http.get("http://localhost/users/public", () => {
    return HttpResponse.json({
      "hydra:member": [
        { id: 1, firstName: "Jean", lastName: "Dupont" },
        { id: 2, firstName: "Marie", lastName: "Curie" },
      ],
      "hydra:totalItems": 2,
    });
  }),

  http.post("http://localhost/race_medias", () => {
    return HttpResponse.json(
      {
        "@id": "/race_medias/1",
        id: 1,
        filePath: "test.png",
        runner: "/users/1",
      },
      { status: 201 },
    );
  }),

  http.post("http://localhost/auth", async ({ request }) => {
    const { email, password } = (await request.json()) as any;
    if (email === "admin@example.com" && password === "password") {
      return HttpResponse.json({ token: "fake-jwt-token" });
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),
];
