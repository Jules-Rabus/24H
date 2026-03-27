"use client";

import dynamic from "next/dynamic";

const Admin = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => <p>Chargement...</p>,
});

export default function AdminPage() {
  return <Admin />;
}
