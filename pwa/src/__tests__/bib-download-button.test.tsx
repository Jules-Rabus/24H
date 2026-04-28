import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/render";
import type { ReactNode } from "react";

// Mock @react-pdf/renderer with React-friendly stand-ins so we can assert on
// the rendered text (edition / dossard) without spinning up the real PDF
// pipeline (which requires a worker / canvas).
vi.mock("@react-pdf/renderer", () => {
  const Passthrough = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Document: Passthrough,
    Page: Passthrough,
    View: Passthrough,
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    Image: () => null,
    StyleSheet: { create: <T,>(styles: T) => styles },
    PDFDownloadLink: ({
      children,
      document,
    }: {
      children: (state: { loading: boolean }) => ReactNode;
      document: ReactNode;
    }) => (
      <div>
        <div data-testid="pdf-doc">{document}</div>
        {children({ loading: false })}
      </div>
    ),
  };
});

vi.mock("@bwip-js/browser", () => ({
  qrcode: () => undefined,
}));

import BibDownloadButton from "@/components/classement/BibDownloadButton";
import BulkBibDownloadButton from "@/components/classement/BulkBibDownloadButton";

describe("BibDownloadButton", () => {
  const user = {
    id: 42,
    firstName: "Jean",
    lastName: "Dupont",
    surname: null,
  };

  it("renders the edition above the dossard number when provided", () => {
    render(<BibDownloadButton user={user} edition={2026} />);
    expect(screen.getByText("2026 / 42")).toBeInTheDocument();
  });

  it("does not render edition text when prop is omitted", () => {
    render(<BibDownloadButton user={user} />);
    expect(screen.queryByText(/\/ 42$/)).not.toBeInTheDocument();
  });
});

describe("BulkBibDownloadButton", () => {
  const users = [
    { id: 1, firstName: "Jean", lastName: "Dupont", surname: null },
    { id: 2, firstName: "Marie", lastName: "Curie", surname: null },
  ];

  it("renders the edition for every bib in the bulk PDF", () => {
    render(<BulkBibDownloadButton users={users} edition={2026} />);
    expect(screen.getByText("2026 / 1")).toBeInTheDocument();
    expect(screen.getByText("2026 / 2")).toBeInTheDocument();
  });

  it("returns null when users array is empty", () => {
    const { container } = render(
      <BulkBibDownloadButton users={[]} edition={2026} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
