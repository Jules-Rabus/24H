import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import GalleryPage from "../../app/gallery/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/gallery",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GalleryPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("affiche le titre Galerie et le bouton Partager", async () => {
    render(<GalleryPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Galerie" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /partager/i }),
      ).toBeInTheDocument();
    });
  });

  it("affiche les commentaires directement dans la grille sans clic", async () => {
    render(<GalleryPage />);
    await waitFor(() => {
      expect(screen.getByText("Super course !")).toBeInTheDocument();
      expect(screen.getByText("Allez les bleus")).toBeInTheDocument();
    });
  });

  it("affiche les likes directement dans la grille sans clic", async () => {
    render(<GalleryPage />);
    await waitFor(() => {
      // mockLikesCount: média 1 = 12 likes, média 2 = 4 likes, média 3 = 0 likes
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  it("tap sur une card affiche le bouton fermer", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);
    await waitFor(() =>
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0),
    );

    await user.click(screen.getAllByRole("img")[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /fermer/i }),
      ).toBeInTheDocument();
    });
  });

  it("bouton fermer referme la card agrandie", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);
    await waitFor(() =>
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0),
    );

    await user.click(screen.getAllByRole("img")[0]);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /fermer/i }),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /fermer/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("like un média en mode agrandi et bloque le re-like", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);
    await waitFor(() =>
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0),
    );

    // Ouvrir la première card
    await user.click(screen.getAllByRole("img")[0]);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /fermer/i }),
      ).toBeInTheDocument(),
    );

    // Liker
    const likeBtn = screen.getByRole("button", { name: /j'aime|liker|like/i });
    await user.click(likeBtn);

    // localStorage mis à jour
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem("24h_likes")!)).toHaveLength(1);
    });

    // Bouton désactivé après like
    expect(likeBtn).toBeDisabled();
  });
});
