import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/ui/AdminLayout";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s · Administration · Défi des 24h",
  },
  description: "Espace d'administration du Défi des 24h.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
