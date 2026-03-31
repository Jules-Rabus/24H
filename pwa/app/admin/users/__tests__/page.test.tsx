import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@/test-utils/render";
import UsersAdminPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/state/admin/users/queries", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useAdminUsersQuery: vi.fn(),
  };
});

import { useAdminUsersQuery } from "@/state/admin/users/queries";

describe("UsersAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header and table correctly", async () => {
    (useAdminUsersQuery as any).mockReturnValue({
      data: {
        member: [
          {
            "@id": "/users/1",
            id: 1,
            email: "admin@test.com",
            firstName: "Admin",
            lastName: "Test",
            role: "ADMIN",
          },
          {
            "@id": "/users/2",
            id: 2,
            email: "runner@test.com",
            firstName: "Runner",
            lastName: "Test",
            role: "RUNNER",
            surname: "42",
          },
        ],
        totalItems: 2,
      },
      isLoading: false,
    });

    render(<UsersAdminPage />);

    expect(screen.getAllByText(/Utilisateurs/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("admin@test.com")).toBeInTheDocument();
      expect(screen.getByText("runner@test.com")).toBeInTheDocument();
    });
  });
});
