import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/render";
import UploadPage from "../../app/upload/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/upload",
  useSearchParams: () => new URLSearchParams(),
}));

describe("UploadPage", () => {
  it("affiche le formulaire d'upload", () => {
    render(<UploadPage />);
    expect(
      screen.getByRole("button", { name: /partager maintenant/i }),
    ).toBeInTheDocument();
  });

  it("affiche la zone de sélection de fichier", () => {
    render(<UploadPage />);
    expect(screen.getByText(/ajouter une photo ou vidéo/i)).toBeInTheDocument();
  });
});
