import type { Metadata } from "next";
import { CoursePage } from "./CoursePage";

// All data loads client-side via TanStack Query — render this shell once
// at build time and serve it from the CDN on every request.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Course en direct",
  description:
    "Suivez la course en direct : run en cours, statistiques, météo et derniers arrivés.",
};

export default function Page() {
  return <CoursePage />;
}
