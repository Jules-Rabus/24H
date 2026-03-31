import { describe, it, expect, vi } from "vitest";
import AdminPage from "../page";
import * as navigation from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("AdminPage root", () => {
  it("redirects to /admin/runs", () => {
    // AdminPage just calls `redirect` directly, no need to render it as JSX since it returns `never` or `void`.
    AdminPage();
    expect(navigation.redirect).toHaveBeenCalledWith("/admin/runs");
  });
});
