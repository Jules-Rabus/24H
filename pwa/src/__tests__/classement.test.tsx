import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import ClassementPage from "../../app/classement/page";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/classement",
  useSearchParams: () => new URLSearchParams("edition=2026"),
}));

describe("ClassementPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it("affiche le heading Classement", async () => {
    render(<ClassementPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Classement" }),
      ).toBeInTheDocument();
    });
  });

  it("affiche les StatCards", async () => {
    render(<ClassementPage />);
    await waitFor(() => {
      expect(screen.getByText("Coureurs")).toBeInTheDocument();
      expect(screen.getByText("Tours")).toBeInTheDocument();
      expect(screen.getByText("Distance")).toBeInTheDocument();
    });
  });

  it("affiche les coureurs retournés par l'API pour l'édition 2026", async () => {
    render(<ClassementPage />);
    // MSW handler filters by edition — runners with 2026 participations
    await waitFor(() => {
      expect(screen.getByText("Marie Curie")).toBeInTheDocument();
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    });
  });

  it("affiche le nombre de tours depuis finishedParticipationsCount de l'API", async () => {
    render(<ClassementPage />);
    await waitFor(() => {
      // Marie Curie: finishedParticipationsCount=12 → "12 tours"
      expect(screen.getByText(/12 tours/i)).toBeInTheDocument();
      // Jean Dupont: finishedParticipationsCount=8 → "8 tours"
      expect(screen.getByText(/8 tours/i)).toBeInTheDocument();
    });
  });

  it("filtre les coureurs via la recherche", async () => {
    const user = userEvent.setup();
    render(<ClassementPage />);
    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText(
      /nom, prénom, surnom ou n° dossard/i,
    );
    await user.type(search, "Marie");

    await waitFor(() => {
      expect(screen.getByText("Marie Curie")).toBeInTheDocument();
      expect(screen.queryByText("Jean Dupont")).not.toBeInTheDocument();
    });
  });

  it("toggle un favori avec le bouton étoile", async () => {
    render(<ClassementPage />);
    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    });

    const stars = screen.getAllByLabelText(/favori/i);
    expect(stars.length).toBeGreaterThan(0);
    fireEvent.click(stars[0]);

    await waitFor(() => {
      const stored = localStorage.getItem("24h_favorites");
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toHaveLength(1);
    });
  });
});
