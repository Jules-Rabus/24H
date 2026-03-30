import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import UploadPage from "../page";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
import { mockRaceMediaResponse } from "@/state/media/__tests__/data";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

describe("UploadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("affiche une erreur si la validation côté client échoue", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    // Just click to submit without choosing a file to trigger "Photo requise"
    await user.click(screen.getByRole("button", { name: /envoyer la photo/i }));

    await waitFor(() => {
      expect(screen.getByText(/Photo requise/i)).toBeInTheDocument();
    });
  });

  it("affiche un succès après l'envoi d'une photo valide", async () => {
    server.use(
      http.post("http://localhost/race_medias", () => {
        return HttpResponse.json(mockRaceMediaResponse);
      }),
    );

    const user = userEvent.setup();
    render(<UploadPage />);

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/votre photo/i);

    await user.upload(fileInput, file);

    const commentInput = screen.getByPlaceholderText(/Décrivez ce moment/i);
    await user.type(commentInput, "Super course !");

    const submitBtn = screen.getByRole("button", { name: /envoyer la photo/i });
    expect(submitBtn).not.toBeDisabled();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Photo envoyée !/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Voir la galerie/i }));
    expect(mockPush).toHaveBeenCalledWith("/gallery");

    await user.click(screen.getByRole("button", { name: /Tableau de bord/i }));
    expect(mockPush).toHaveBeenCalledWith("/public-race-status");

    await user.click(
      screen.getByRole("button", { name: /Envoyer une autre photo/i }),
    );
    expect(
      screen.getByRole("button", { name: /envoyer la photo/i }),
    ).toBeInTheDocument();
  });

  it("affiche une erreur si la mutation échoue", async () => {
    server.use(
      http.post("http://localhost/race_medias", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    render(<UploadPage />);

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/votre photo/i);

    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /envoyer la photo/i }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors de l'envoi/i)).toBeInTheDocument();
    });
  });

  it("permet de retourner en arrière", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    await user.click(screen.getByRole("button", { name: /Retour/i }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
