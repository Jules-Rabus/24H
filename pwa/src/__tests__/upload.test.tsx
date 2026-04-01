import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/render";
import UploadPage from "../../app/upload/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

describe("UploadPage", () => {
  it("affiche le titre et le formulaire", () => {
    render(<UploadPage />);
    expect(screen.getByText(/partager un moment/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /partager maintenant/i }),
    ).toBeInTheDocument();
  });

  it("affiche la zone de sélection de fichier", () => {
    render(<UploadPage />);
    expect(screen.getByText(/ajouter une photo ou vidéo/i)).toBeInTheDocument();
  });
});
