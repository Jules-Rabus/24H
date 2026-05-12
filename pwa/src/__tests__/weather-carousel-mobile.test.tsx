import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/render";
import { WeatherCarouselMobile } from "../../components/public/race-status/WeatherCarouselMobile";
import type { WeatherResponse } from "@/state/weather/queries";

vi.mock("embla-carousel-react", () => ({
  default: () => [
    () => null,
    {
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      scrollTo: vi.fn(),
      canScrollPrev: () => true,
      canScrollNext: () => true,
      selectedScrollSnap: () => 0,
      on: vi.fn(),
      off: vi.fn(),
    },
  ],
}));

const fakeWeather: WeatherResponse = {
  current: {
    temperature_2m: 14.5,
    apparent_temperature: 12.8,
    windspeed_10m: 18,
    relative_humidity_2m: 62,
    weather_code: 3,
  },
  hourly: {
    time: ["2026-03-15T09:00:00Z", "2026-03-15T10:00:00Z"],
    temperature_2m: [15, 16],
    weather_code: [3, 1],
    apparent_temperature: [13, 14],
    windspeed_10m: [20, 18],
    relative_humidity_2m: [60, 55],
  },
  daily: {
    time: ["2026-03-15"],
    sunrise: ["2026-03-15T07:12:00Z"],
    sunset: ["2026-03-15T19:42:00Z"],
  },
};

describe("WeatherCarouselMobile", () => {
  it("affiche la météo actuelle dans une grosse card", () => {
    render(
      <WeatherCarouselMobile isLoading={false} weatherData={fakeWeather} />,
    );
    expect(screen.getByText(/Météo actuelle/i)).toBeInTheDocument();
    // 15° apparaît dans la grosse card + dans une des slides horaires — on
    // veut juste vérifier qu'au moins une occurrence est rendue.
    expect(screen.getAllByText(/15°/).length).toBeGreaterThan(0);
  });

  it("affiche les métriques actuelles (Ressenti, Vent, Humidité)", () => {
    render(
      <WeatherCarouselMobile isLoading={false} weatherData={fakeWeather} />,
    );
    // Ces labels apparaissent dans la grosse card actuelle + dans chaque
    // slide horaire — on accepte ≥1 occurrence.
    expect(screen.getAllByText(/Ressenti/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Vent/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Humidité/i).length).toBeGreaterThan(0);
  });

  it("affiche la case Soleil (lever + coucher)", () => {
    render(
      <WeatherCarouselMobile isLoading={false} weatherData={fakeWeather} />,
    );
    expect(screen.getByText(/Soleil/i)).toBeInTheDocument();
  });

  it("affiche la section prévisions horaires avec boutons de navigation", () => {
    render(
      <WeatherCarouselMobile isLoading={false} weatherData={fakeWeather} />,
    );
    expect(screen.getByText(/Prévisions horaires/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heure précédente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heure suivante/i)).toBeInTheDocument();
  });

  it("affiche un skeleton pendant le chargement", () => {
    const { container } = render(
      <WeatherCarouselMobile isLoading={true} weatherData={undefined} />,
    );
    expect(container.querySelector(".chakra-skeleton")).toBeTruthy();
  });
});
