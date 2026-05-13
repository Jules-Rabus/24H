import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { weatherResponseSchema, type WeatherResponse } from "./schemas";

export type { WeatherResponse };

export const weatherKeys = {
  all: ["weather"] as const,
  forecast: (lat: number, lon: number) =>
    [...weatherKeys.all, lat, lon] as const,
};

async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherResponse> {
  const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: lat,
      longitude: lon,
      current:
        "temperature_2m,weather_code,apparent_temperature,windspeed_10m,relative_humidity_2m,rain,uv_index",
      hourly:
        "temperature_2m,weather_code,apparent_temperature,windspeed_10m,relative_humidity_2m,rain,uv_index",
      // 15-min granularity for the "rain in the next hour" mini-chart.
      // AROME (forced via meteofrance_seamless) is the only model exposing
      // this for France.
      minutely_15: "rain",
      daily: "sunrise,sunset,uv_index_max",
      timezone: "Europe/Paris",
      // Rolling 24 h window for hourly data — `forecast_days: 1` would clip
      // to local midnight, so an evening visit would only get a few hours.
      forecast_hours: 24,
      // Force the Météo France AROME/ARPEGE seamless mix.
      models: "meteofrance_seamless",
    },
  });
  return weatherResponseSchema.parse(data);
}

export function useWeatherQuery(lat: number, lon: number) {
  return useQuery({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchWeather(lat, lon),
    staleTime: 5 * 60 * 1000,
  });
}
