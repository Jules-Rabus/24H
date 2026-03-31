import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import AdminPage from "../page";
import * as navigation from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("AdminPage root", () => {
  it("redirects to /admin/runs", () => {
    render(<AdminPage />);
    expect(navigation.redirect).toHaveBeenCalledWith("/admin/runs");
  });
});
