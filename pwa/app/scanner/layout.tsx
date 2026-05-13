import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner",
  description: "Scanner de QR-code pour enregistrer une arrivée.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
