import Providers from "./providers"
import React from 'react'

export const metadata = {
  title: 'Race Tracker',
  description: 'Suivi de course en temps réel et back-office',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
