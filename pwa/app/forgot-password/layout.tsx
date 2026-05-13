import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre compte.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
