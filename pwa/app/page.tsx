import type { Metadata } from "next";
import { HomePage } from "./HomePage";

// All data loads client-side via TanStack Query — render this shell once
// at build time and serve it from the CDN on every request.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Accédez au classement, à la course en direct et soutenez l'ASPO.",
};

export default function Page() {
  return <HomePage />;
}
