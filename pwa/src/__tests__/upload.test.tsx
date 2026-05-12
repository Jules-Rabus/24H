import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import UploadPage from "../../app/upload/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
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

  it("affiche le champ commentaire", () => {
    render(<UploadPage />);
    expect(
      screen.getByPlaceholderText("Décrivez ce moment..."),
    ).toBeInTheDocument();
  });

  it("affiche les formats acceptés", () => {
    render(<UploadPage />);
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Vidéo")).toBeInTheDocument();
    expect(screen.getByText("· max 25 Mo")).toBeInTheDocument();
  });

  it("le bouton partager est désactivé sans fichier", () => {
    render(<UploadPage />);
    expect(
      screen.getByRole("button", { name: /partager maintenant/i }),
    ).toBeDisabled();
  });

  it("affiche l'écran de succès après upload", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    // Simulate file selection
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    // Submit the form
    await user.click(
      screen.getByRole("button", { name: /partager maintenant/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Média partagé !")).toBeInTheDocument();
      expect(
        screen.getByText("Merci pour votre contribution."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /voir la galerie/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /voir le classement/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /partager un autre/i }),
      ).toBeInTheDocument();
    });
  });

  it("navigue vers la galerie depuis l'écran de succès", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(fileInput, file);
    await user.click(
      screen.getByRole("button", { name: /partager maintenant/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /voir la galerie/i }),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /voir la galerie/i }));
    expect(mockPush).toHaveBeenCalledWith("/gallery");
  });

  it("affiche une erreur quand l'upload échoue", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.post("*/race_medias", () => {
        return HttpResponse.json({ error: "fail" }, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    render(<UploadPage />);

    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(fileInput, file);
    // onChange is async (HEIC helper returns a Promise even for JPEGs) —
    // wait until the share button leaves its disabled state before clicking.
    const shareBtn = await screen.findByRole("button", {
      name: /partager maintenant/i,
    });
    await waitFor(() => expect(shareBtn).not.toBeDisabled());
    await user.click(shareBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Erreur lors de l'envoi. Veuillez réessayer."),
      ).toBeInTheDocument();
    });
  });
});
