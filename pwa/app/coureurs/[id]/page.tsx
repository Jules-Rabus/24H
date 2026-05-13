import type { Metadata } from "next";
import { CoureurPage } from "./CoureurPage";

// All data loads client-side via TanStack Query — render this shell once,
// then serve it from the CDN. `dynamicParams` lets new runner ids be
// rendered on demand on the first hit and cached afterwards.
export const dynamic = "force-static";
export const dynamicParams = true;

export const metadata: Metadata = {
  title: "Profil coureur",
  description:
    "Tours effectués, allure moyenne et historique des participations.",
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CoureurPage params={params} />;
}
