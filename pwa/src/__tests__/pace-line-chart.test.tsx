/**
 * Tests for components/public/race-status/PaceLineChart.tsx
 */
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/render";
import { PaceLineChart } from "@/components/public/race-status/PaceLineChart";
import type { PaceChartPoint } from "@/components/public/race-status/PaceLineChart";

// recharts uses ResizeObserver and SVG rendering which aren't available in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const emptyData: PaceChartPoint[] = [
  { name: "R1", secPerKm2026: null, secPerKm2025: null, isCurrent: false },
  { name: "R2", secPerKm2026: null, secPerKm2025: null, isCurrent: false },
];

const dataWith2026: PaceChartPoint[] = [
  { name: "R1", secPerKm2026: 375, secPerKm2025: null, isCurrent: false },
  { name: "R2", secPerKm2026: 360, secPerKm2025: null, isCurrent: true },
];

const dataWithBoth: PaceChartPoint[] = [
  { name: "R1", secPerKm2026: 375, secPerKm2025: 400, isCurrent: false },
  { name: "R2", secPerKm2026: 360, secPerKm2025: 385, isCurrent: true },
];

describe("PaceLineChart", () => {
  it("affiche 'Données insuffisantes' quand aucune donnée", () => {
    render(<PaceLineChart data={emptyData} />);
    expect(screen.getByText("Données insuffisantes")).toBeInTheDocument();
  });

  it("affiche 'Données insuffisantes' quand data est vide", () => {
    render(<PaceLineChart data={[]} />);
    expect(screen.getByText("Données insuffisantes")).toBeInTheDocument();
  });

  it("affiche le titre 'Allure moy. / Run'", () => {
    render(<PaceLineChart data={dataWith2026} />);
    expect(screen.getByText(/Allure moy\. \/ Run/i)).toBeInTheDocument();
  });

  it("affiche la légende '2026' quand des données 2026 existent", () => {
    render(<PaceLineChart data={dataWith2026} />);
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("n'affiche pas la légende '2025' si aucune donnée 2025", () => {
    render(<PaceLineChart data={dataWith2026} />);
    expect(screen.queryByText("2025")).not.toBeInTheDocument();
  });

  it("affiche les deux légendes quand 2026 et 2025 ont des données", () => {
    render(<PaceLineChart data={dataWithBoth} />);
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("affiche le graphe quand il y a des données", () => {
    render(<PaceLineChart data={dataWith2026} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("accepte la prop fluid sans erreur", () => {
    render(<PaceLineChart data={dataWith2026} fluid />);
    expect(screen.getByText(/Allure moy\. \/ Run/i)).toBeInTheDocument();
  });
});
