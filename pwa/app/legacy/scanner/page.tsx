"use client"

import dynamic from "next/dynamic"

const Scanner = dynamic(() => import("./index"), { ssr: false, loading: () => <p>Chargement...</p> })

export default function ScannerPage() {
  return <Scanner />
}
