import type { Metadata } from "next";
import { GalleryPage } from "./GalleryPage";

// All data loads client-side via TanStack Query — render this shell once
// at build time and serve it from the CDN on every request.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Galerie photos",
  description: "Photos partagées par les participants de la course.",
};

export default function Page() {
  return <GalleryPage />;
}
