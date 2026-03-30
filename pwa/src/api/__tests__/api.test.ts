import { describe, it, expect } from "vitest";
import {
  apiUserspublicGetCollection,
  apiRaceMediasPost,
} from "../generated/sdk.gen";

describe("SDK generated client", () => {
  it("fetchRunners retourne une liste de coureurs", async () => {
    const { data } = await apiUserspublicGetCollection();
    const members = (data as any)?.member ?? data;
    expect(members).toHaveLength(2);
    expect(members[0].firstName).toBe("Jean");
  });

  it("uploadRaceMedia retourne le media créé", async () => {
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const { data } = await apiRaceMediasPost({ body: { file } });
    expect((data as any).id).toBe(1);
    expect((data as any).filePath).toBe("test.png");
  });
});
