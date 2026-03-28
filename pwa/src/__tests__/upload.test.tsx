import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import UploadPage from "../../app/upload/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("UploadPage", () => {
  it("affiche le titre et le formulaire", () => {
    render(<UploadPage />);
    expect(screen.getByText(/partagez un moment/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /envoyer la photo/i }),
    ).toBeInTheDocument();
  });

  it("affiche les coureurs dans le select après chargement", async () => {
    render(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
      expect(screen.getByText("Marie Curie")).toBeInTheDocument();
    });
  });
});
