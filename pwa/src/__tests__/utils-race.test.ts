import { describe, it, expect } from "vitest";
import {
  formatTime,
  formatTimeMinutes,
  formatTimeVerbose,
  formatTimeShort,
  formatPace,
} from "@/utils/race";

describe("formatTime", () => {
  it("retourne '-' pour null/undefined/0", () => {
    expect(formatTime(null)).toBe("-");
    expect(formatTime(undefined)).toBe("-");
    expect(formatTime(0)).toBe("-");
  });

  it("formate les secondes en h:mm ou m:ss", () => {
    expect(formatTime(3661)).toBe("1h01");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(60)).toBe("1:00");
  });
});

describe("formatTimeMinutes", () => {
  it("est un alias de formatTime", () => {
    expect(formatTimeMinutes(3661)).toBe(formatTime(3661));
    expect(formatTimeMinutes(null)).toBe("-");
  });
});

describe("formatTimeVerbose", () => {
  it("retourne '-' pour null/undefined/0", () => {
    expect(formatTimeVerbose(null)).toBe("-");
    expect(formatTimeVerbose(undefined)).toBe("-");
    expect(formatTimeVerbose(0)).toBe("-");
  });

  it("formate avec heures en Xh YYm", () => {
    expect(formatTimeVerbose(3661)).toBe("1h 01m");
    expect(formatTimeVerbose(7200)).toBe("2h 00m");
  });

  it("formate sans heures en Xm YYs", () => {
    expect(formatTimeVerbose(125)).toBe("2m 05s");
    expect(formatTimeVerbose(60)).toBe("1m 00s");
  });
});

describe("formatTimeShort", () => {
  it("retourne '-' pour null/undefined/0", () => {
    expect(formatTimeShort(null)).toBe("-");
    expect(formatTimeShort(undefined)).toBe("-");
    expect(formatTimeShort(0)).toBe("-");
  });

  it("formate en Xm YYs", () => {
    expect(formatTimeShort(125)).toBe("2m 05s");
    expect(formatTimeShort(3661)).toBe("61m 01s");
  });
});

describe("formatPace", () => {
  it("retourne '-' pour null/undefined/0", () => {
    expect(formatPace(null)).toBe("-");
    expect(formatPace(undefined)).toBe("-");
    expect(formatPace(0)).toBe("-");
  });

  it("formate en min/km (4km par tour)", () => {
    expect(formatPace(1200)).toBe("5:00/km");
    expect(formatPace(960)).toBe("4:00/km");
  });
});
