import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils/render";
import { HomePage } from "../../app/HomePage";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("HomePage", () => {
  it("affiche le bouton Participant", () => {
    render(<HomePage />);
    expect(screen.getByText("Participant")).toBeInTheDocument();
  });

  it("affiche le bouton Organisateur", () => {
    render(<HomePage />);
    expect(screen.getByText("Organisateur")).toBeInTheDocument();
  });

  it("navigue vers /classement au clic sur Participant", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByText("Participant"));
    expect(mockPush).toHaveBeenCalledWith("/classement");
  });

  it("navigue vers /admin au clic sur Organisateur", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByText("Organisateur"));
    expect(mockPush).toHaveBeenCalledWith("/admin");
  });
});
