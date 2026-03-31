import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@/test-utils/render";
import RunsAdminPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Provide partial mocks for all queries used in the page
vi.mock("@/state/admin/runs/queries", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useAdminRunsQuery: vi.fn(),
  };
});

import { useAdminRunsQuery } from "@/state/admin/runs/queries";

vi.mock("@/state/admin/runs/mutations", () => ({
  useCreateRunMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateRunMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteRunMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("RunsAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header and table correctly", async () => {
    (useAdminRunsQuery as any).mockReturnValue({
      data: [
        { "@id": "/runs/1", id: 1, name: "Run 1", startDate: "2023-01-01T10:00:00Z" },
        { "@id": "/runs/2", id: 2, name: "Run 2", startDate: "2023-01-02T10:00:00Z", endDate: "2023-01-02T12:00:00Z" }
      ],
      isLoading: false,
    });

    render(<RunsAdminPage />);

    expect(screen.getAllByText(/Runs/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      // Look for the total items "2" (since there are two runs)
      // "2" should appear in "Total runs" stats
      expect(screen.getAllByText("2")[0]).toBeInTheDocument();
    });
  });
});
