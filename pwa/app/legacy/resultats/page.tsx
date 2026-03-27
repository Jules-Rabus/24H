"use client";

import dynamic from "next/dynamic";

const Resultats = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => <p>Chargement...</p>,
});

export default function ResultatsPage() {
  return <Resultats />;
}
