import type { Metadata } from "next";
import { ClassementPage } from "./ClassementPage";

// All data loads client-side via TanStack Query — render this shell once
// at build time and serve it from the CDN on every request.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Classement",
  description:
    "Classement des coureurs : tours, allure, kilomètres et favoris.",
};

export default function Page() {
  return <ClassementPage />;
}
