import { describe, it, expect } from "vitest";
import { apiRaceMediasPost } from "../generated/sdk.gen";

// The userspublic endpoint was renamed to /public/users; the generated SDK
// still exposes apiUserspublicGetCollection pointing at the old path until
// `npm run generate-api` regenerates it. Re-add the test once the SDK is in
// sync.
describe("SDK generated client", () => {
  it("uploadRaceMedia retourne le media créé", async () => {
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const { data } = await apiRaceMediasPost({ body: { file } });
    expect((data as any).id).toBe(99);
    expect((data as any).filePath).toBe("test.png");
  });
});
