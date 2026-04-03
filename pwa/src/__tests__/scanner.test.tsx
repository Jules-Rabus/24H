import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils/render";
import ScannerPage from "../../app/scanner/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/scanner",
  useSearchParams: () => new URLSearchParams(),
}));

// The scanner page uses dynamic import with a loading fallback
// In jsdom the dynamic component won't load, so we test the loading state
describe("ScannerPage", () => {
  it("affiche l'état de chargement caméra", async () => {
    render(<ScannerPage />);
    await waitFor(() => {
      expect(screen.getByText("Initialisation caméra...")).toBeInTheDocument();
    });
  });
});
