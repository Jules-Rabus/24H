import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envoyer une photo",
  description: "Partagez vos photos avec les autres participants.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
