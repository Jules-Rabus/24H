import type { Metadata } from "next";
import { PublicRaceStatusPage } from "./PublicRaceStatusPage";

// All data loads client-side via TanStack Query — render this shell once
// at build time and serve it from the CDN on every request.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tableau d'affichage",
  description: "Tableau d'affichage public du Défi des 24h.",
};

export default function Page() {
  return <PublicRaceStatusPage />;
}
