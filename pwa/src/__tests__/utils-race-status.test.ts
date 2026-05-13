/**
 * Unit tests for components/public/race-status/utils.ts
 * Covers getWeatherIcon, fmtPace, initials
 */
import { describe, it, expect } from "vitest";
import {
  getWeatherIcon,
  fmtPace,
  initials,
} from "@/components/public/race-status/utils";
import { LuSun, LuCloud, LuCloudRain, LuCloudLightning } from "react-icons/lu";

describe("getWeatherIcon", () => {
  it("returns LuSun for code 0 (clear sky)", () => {
    expect(getWeatherIcon(0)).toBe(LuSun);
  });

  it("returns LuSun for code 3 (overcast boundary)", () => {
    expect(getWeatherIcon(3)).toBe(LuSun);
  });

  it("returns LuCloud for code 4 (light cloud)", () => {
    expect(getWeatherIcon(4)).toBe(LuCloud);
  });

  it("returns LuCloud for code 48 (depositing rime fog boundary)", () => {
    expect(getWeatherIcon(48)).toBe(LuCloud);
  });

  it("returns LuCloudRain for code 49 (light drizzle)", () => {
    expect(getWeatherIcon(49)).toBe(LuCloudRain);
  });

  it("returns LuCloudRain for code 67 (heavy freezing rain boundary)", () => {
    expect(getWeatherIcon(67)).toBe(LuCloudRain);
  });

  it("returns LuCloudLightning for code 68 (thunderstorm)", () => {
    expect(getWeatherIcon(68)).toBe(LuCloudLightning);
  });

  it("returns LuCloudLightning for code 99 (severe thunderstorm boundary)", () => {
    expect(getWeatherIcon(99)).toBe(LuCloudLightning);
  });

  it("returns LuSun for code > 99 (fallback)", () => {
    expect(getWeatherIcon(100)).toBe(LuSun);
  });
});

describe("fmtPace", () => {
  it("formats 300 seconds/km as 5:00/km", () => {
    expect(fmtPace(300)).toBe("5:00/km");
  });

  it("formats 360 seconds/km as 6:00/km", () => {
    expect(fmtPace(360)).toBe("6:00/km");
  });

  it("formats 375 seconds/km as 6:15/km", () => {
    expect(fmtPace(375)).toBe("6:15/km");
  });

  it("formats 61 seconds/km as 1:01/km (zero-pads seconds)", () => {
    expect(fmtPace(61)).toBe("1:01/km");
  });

  it("formats 0 as 0:00/km", () => {
    expect(fmtPace(0)).toBe("0:00/km");
  });
});

describe("initials", () => {
  it("returns uppercase initials of first and last name", () => {
    expect(initials("Jean", "Dupont")).toBe("JD");
  });

  it("returns empty string for null first and last name", () => {
    expect(initials(null, null)).toBe("");
  });

  it("returns single initial when last name is null", () => {
    expect(initials("Jean", null)).toBe("J");
  });

  it("returns single initial when first name is null", () => {
    expect(initials(null, "Dupont")).toBe("D");
  });

  it("uppercases lowercase names", () => {
    expect(initials("marie", "curie")).toBe("MC");
  });
});
