import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import ParticipationsAdminPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/state/admin/participations/queries", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useAdminParticipationsQuery: vi.fn(),
  };
});

import { useAdminParticipationsQuery } from "@/state/admin/participations/queries";

vi.mock("@/state/admin/participations/mutations", () => ({
  useDeleteParticipationMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("ParticipationsAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header and table", async () => {
    (useAdminParticipationsQuery as any).mockReturnValue({
      data: {
        member: [
          {
            "@id": "/participations/1",
            id: 1,
            run: "/runs/1",
            user: "/users/1",
            status: "FINISHED",
          },
        ],
        totalItems: 1,
      },
      isLoading: false,
    });

    render(<ParticipationsAdminPage />);

    expect(screen.getAllByText(/Participations/i)[0]).toBeInTheDocument();

    await waitFor(() => {
      // It should display 'Run #1' if it formatted the IRI.
      expect(screen.getByText(/Run #1/i)).toBeInTheDocument();
    });
  });

  it("allows searching", async () => {
    const mockQuery = vi.fn().mockReturnValue({
      data: { member: [], totalItems: 0 },
      isLoading: false,
    });
    (useAdminParticipationsQuery as any).mockImplementation(mockQuery);

    const user = userEvent.setup();
    render(<ParticipationsAdminPage />);

    const searchInput = screen.getByPlaceholderText("Prénom du coureur");
    await user.type(searchInput, "Jean");
    await user.click(screen.getByRole("button", { name: "Rechercher" }));

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ "user.firstName": "Jean" }),
      );
    });
  });
});
