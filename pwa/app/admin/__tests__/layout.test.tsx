import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils/render";
import AdminLayout from "../layout";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/runs",
}));

// Mock `useMe` to resolve user authentication
vi.mock("@/state/auth/queries", () => ({
  useMe: () => ({
    data: { id: "1", role: "ADMIN" },
    isLoading: false,
    isError: false,
  }),
}));

describe("AdminLayout", () => {
  it("renders children correctly", () => {
    render(
      <AdminLayout>
        <div>Admin Content Area</div>
      </AdminLayout>,
    );
    expect(screen.getByText("Admin Content Area")).toBeInTheDocument();
  });
});
