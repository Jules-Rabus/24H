import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import AdminRunsPage from "../../app/admin/runs/page";
import AdminUsersPage from "../../app/admin/users/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/runs",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("@/components/classement/BulkBibDownloadButton", () => ({
  default: () => <button>Mock BulkDownload</button>,
}));

describe("RunForm Zod validation", () => {
  it("affiche les erreurs quand un champ requis est vidé", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un run/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /créer un run/i }));
    await waitFor(() => {
      expect(screen.getByText("Créer un run")).toBeInTheDocument();
    });

    // Touch the startDate field then clear it to trigger onChange validation
    const startInput = screen.getByLabelText(/date de début/i);
    await user.type(startInput, "2026-01-01T10:00");
    await user.clear(startInput);

    await waitFor(() => {
      expect(screen.getByText("Date de début requise")).toBeInTheDocument();
    });
  });

  it("affiche une erreur quand fin avant début (refine)", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un run/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /créer un run/i }));
    await waitFor(() => {
      expect(screen.getByText("Créer un run")).toBeInTheDocument();
    });

    const startInput = screen.getByLabelText(/date de début/i);
    const endInput = screen.getByLabelText(/date de fin/i);
    await user.clear(startInput);
    await user.type(startInput, "2026-03-15T10:00");
    await user.clear(endInput);
    await user.type(endInput, "2026-03-15T08:00");

    await waitFor(() => {
      expect(
        screen.getByText("La fin doit être après le début"),
      ).toBeInTheDocument();
    });
  });

  it("désactive le bouton submit quand le formulaire est invalide", async () => {
    const user = userEvent.setup();
    render(<AdminRunsPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un run/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /créer un run/i }));
    await waitFor(() => {
      expect(screen.getByText("Créer un run")).toBeInTheDocument();
    });

    // Touch a field to mark form as touched, then clear to make invalid
    const startInput = screen.getByLabelText(/date de début/i);
    await user.type(startInput, "2026-01-01T10:00");
    await user.clear(startInput);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Créer" })).toBeDisabled();
    });
  });
});

describe("UserForm Zod validation", () => {
  it("affiche les erreurs quand les champs requis sont vidés", async () => {
    const user = userEvent.setup();
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /créer un utilisateur/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /créer un utilisateur/i }),
    );
    await waitFor(() => {
      expect(screen.getByText("Créer un utilisateur")).toBeInTheDocument();
    });

    // Touch the firstName field then clear it
    const firstNameInput = screen.getByPlaceholderText("Prénom");
    await user.type(firstNameInput, "a");
    await user.clear(firstNameInput);

    // Touch the lastName field then clear it
    const lastNameInput = screen.getByPlaceholderText("Nom");
    await user.type(lastNameInput, "a");
    await user.clear(lastNameInput);

    await waitFor(() => {
      expect(screen.getByText("Prénom requis")).toBeInTheDocument();
      expect(screen.getByText("Nom requis")).toBeInTheDocument();
    });
  });
});
