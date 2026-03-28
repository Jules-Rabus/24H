import { apiClient } from "./client";

export const fetchWeather = async (lat: number, lon: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&timezone=Europe%2FParis`,
  );
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
};

export const fetchRaceStatus = async () => {
  // Mocked for now, waiting for actual backend data source
  return {
    lastArrivals: [
      { id: 1, name: "Jean Dupont", time: "01:23:45", distance: 4 },
      { id: 2, name: "Marie Curie", time: "01:25:10", distance: 4 },
      { id: 3, name: "Albert Einstein", time: "01:26:05", distance: 4 },
    ],
    averageTimes: [
      { hour: "01:00", avg: 22 },
      { hour: "02:00", avg: 23 },
      { hour: "03:00", avg: 24 },
      { hour: "04:00", avg: 25 },
      { hour: "05:00", avg: 27 },
      { hour: "06:00", avg: 26 },
    ],
  };
};

export const fetchRunners = async () => {
  const res = await fetch("http://localhost/users/public");
  if (!res.ok) throw new Error("Runners fetch failed");
  return res.json();
};

export const uploadRaceMedia = async (data: FormData) => {
  const res = await fetch("http://localhost/race_medias", {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
};

export const login = async (credentials: any) => {
  const { data } = await apiClient.post("/auth", credentials);
  return data;
};

export const resetPassword = async (payload: { email: string }) => {
  const { data } = await apiClient.post("/forgot-password", payload);
  return data;
};
