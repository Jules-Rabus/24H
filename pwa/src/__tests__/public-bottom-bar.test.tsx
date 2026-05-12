import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/render";
import { PublicBottomBar } from "../../components/public/PublicBottomBar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/classement",
  useSearchParams: () => new URLSearchParams("edition=2026"),
}));

describe("PublicBottomBar", () => {
  it("affiche les 5 onglets publics", () => {
    render(<PublicBottomBar />);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Classement")).toBeInTheDocument();
    expect(screen.getByText("Course")).toBeInTheDocument();
    expect(screen.getByText("Galerie")).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("préserve la query string sur les liens", () => {
    render(<PublicBottomBar />);
    const link = screen
      .getAllByRole("link")
      .find((a) => a.getAttribute("href")?.startsWith("/course"));
    expect(link?.getAttribute("href")).toContain("edition=2026");
  });
});
