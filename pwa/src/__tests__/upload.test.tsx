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
    expect(screen.getByText(/partagez l.action/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /envoyer la photo/i }),
    ).toBeInTheDocument();
  });

  it("affiche le champ de fichier", () => {
    render(<UploadPage />);
    expect(screen.getByLabelText(/votre photo/i)).toBeInTheDocument();
  });
});
