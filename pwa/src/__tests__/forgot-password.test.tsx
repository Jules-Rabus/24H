import { describe, it, expect } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "../test-utils/render"
import ForgotPasswordPage from "../../app/forgot-password/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("ForgotPasswordPage", () => {
  it("affiche le formulaire email", () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByPlaceholderText("vous@exemple.fr")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /réinitialiser/i })).toBeInTheDocument()
  })

  it("affiche un message de succès après soumission", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByPlaceholderText("vous@exemple.fr"), "user@example.com")
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }))

    await waitFor(() => {
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument()
    })
  })

  it("affiche le succès même si l'email n'existe pas (sécurité)", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByPlaceholderText("vous@exemple.fr"), "inconnu@example.com")
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }))

    await waitFor(() => {
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument()
    })
  })
})
