import { describe, it, expect } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { render } from "../test-utils/render"
import PublicRaceStatusPage from "../../app/public-race-status/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("PublicRaceStatusPage", () => {
  it("affiche le titre de la page", () => {
    render(<PublicRaceStatusPage />)
    expect(screen.getByText(/statut de la course/i)).toBeInTheDocument()
    expect(screen.getByText(/UniLaSalle, Beauvais/i)).toBeInTheDocument()
  })

  it("affiche la météo après chargement", async () => {
    render(<PublicRaceStatusPage />)

    await waitFor(() => {
      expect(screen.getByText(/14.5°C/i)).toBeInTheDocument()
    })
  })

  it("affiche la section des derniers arrivants", () => {
    render(<PublicRaceStatusPage />)
    expect(screen.getByText(/10 Derniers Arrivants/i)).toBeInTheDocument()
  })
})
