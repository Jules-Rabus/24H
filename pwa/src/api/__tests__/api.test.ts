import { describe, it, expect } from "vitest";
import { fetchRunners, uploadRaceMedia, fetchWeather } from "../index";

describe("API Functions", () => {
  it("fetchWeather should return mocked data", async () => {
    const data = await fetchWeather(49.43, 2.08);
    expect(data.current.temperature_2m).toBe(14.5);
  });

  it("fetchRunners should return list of runners", async () => {
    const data = await fetchRunners();
    expect(data["hydra:totalItems"]).toBe(2);
    expect(data["hydra:member"][0].firstName).toBe("Jean");
  });

  it("uploadRaceMedia should return success with mocked MSW", async () => {
    const formData = new FormData();
    formData.append("runner", "/users/1");

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    formData.append("file", file);

    const data = await uploadRaceMedia(formData);
    expect(data.id).toBe(1);
    expect(data.filePath).toBe("test.png");
  });
});
