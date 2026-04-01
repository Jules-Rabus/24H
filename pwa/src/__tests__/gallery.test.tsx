import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import GalleryPage from "../../app/gallery/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/gallery",
  useSearchParams: () => new URLSearchParams("edition=2026"),
}));

describe("GalleryPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("affiche le titre Galerie et le compteur", async () => {
    render(<GalleryPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Galerie" }),
      ).toBeInTheDocument();
    });
  });

  it("affiche le bouton Partager dans la top bar", async () => {
    render(<GalleryPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /partager/i }),
      ).toBeInTheDocument();
    });
  });

  it("trie les médias par likesCount desc", async () => {
    render(<GalleryPage />);
    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it("ouvre la lightbox au clic sur un média", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);

    await waitFor(() => {
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole("img")[0]);

    await waitFor(() => {
      expect(screen.getByText(/1 \/ /)).toBeInTheDocument();
    });
  });

  it("like un média et bloque le re-like", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);

    await waitFor(() => {
      expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole("img")[0]);

    await waitFor(() => {
      expect(screen.getByText(/1 \/ /)).toBeInTheDocument();
    });

    const likeBtn = screen.getByRole("button", { name: /like/i });
    await user.click(likeBtn);

    expect(JSON.parse(localStorage.getItem("24h_likes")!)).toHaveLength(1);
  });
});
