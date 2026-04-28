import { LuSun, LuCloud, LuCloudRain, LuCloudLightning } from "react-icons/lu";

export const TEAL = "#0f929a";

export function getWeatherIcon(code: number) {
  if (code <= 3) return LuSun;
  if (code <= 48) return LuCloud;
  if (code <= 67) return LuCloudRain;
  if (code <= 99) return LuCloudLightning;
  return LuSun;
}

/** Format seconds-per-km as mm:ss/km */
export function fmtPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

export function initials(firstName?: string | null, lastName?: string | null) {
  return `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}`;
}
