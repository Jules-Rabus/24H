import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import CoursePage from "../../app/course/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/course",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [
    () => null,
    {
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      scrollTo: vi.fn(),
      canScrollPrev: () => true,
      canScrollNext: () => true,
      selectedScrollSnap: () => 0,
      on: vi.fn(),
      off: vi.fn(),
    },
  ],
}));

describe("CoursePage (public mobile race status)", () => {
  it("affiche le titre de la page Course", async () => {
    render(<CoursePage />);
    // "Course" appears in both the heading and the bottom nav — getAllByText is safe
    const matches = await screen.findAllByText(/^Course$/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("affiche la section derniers arrivés", async () => {
    render(<CoursePage />);
    expect(await screen.findByText(/Derniers Arrivés/i)).toBeInTheDocument();
  });

  it("affiche le chart d'allure moyenne / run", async () => {
    render(<CoursePage />);
    expect(await screen.findByText(/Allure moy\./i)).toBeInTheDocument();
  });

  it("affiche le stat KM Totaux", async () => {
    render(<CoursePage />);
    await waitFor(() => {
      expect(screen.getByText(/KM Totaux/i)).toBeInTheDocument();
    });
  });

  it("affiche l'édition courante dans le sous-titre", async () => {
    render(<CoursePage />);
    await waitFor(() => {
      expect(screen.getByText(/Édition 2026/i)).toBeInTheDocument();
    });
  });
});
