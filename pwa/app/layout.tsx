import Providers from "./providers";
import React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Défi des 24h — UniLaSalle Beauvais",
    template: "%s · Défi des 24h",
  },
  description: "Défi des 24h à UniLaSalle Beauvais, organisé par l'ASPO.",
  applicationName: "Défi des 24h",
  authors: [{ name: "ASPO — Association Sportive des Policiers de l'Oise" }],
  openGraph: {
    type: "website",
    siteName: "Défi des 24h",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default" as const,
    title: "Défi 24h",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) to be non-zero on iPhone X+ in Safari.
  viewportFit: "cover",
  themeColor: "#0f929a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
