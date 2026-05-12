"use client";

import { useMemo } from "react";
import { PDFDownloadLink, Document } from "@react-pdf/renderer";
import { Button } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import { BibPage, type BibUser } from "./BibPage";
import { generateBibQr } from "./generateBibQr";

export default function BulkBibDownloadButton({
  users,
  edition,
}: {
  users: BibUser[];
  edition?: number;
}) {
  // Memoise the QR data-URLs so the canvas isn't redrawn on every render.
  const qrByUserId = useMemo(() => {
    const map = new Map<number, string>();
    for (const user of users) map.set(user.id, generateBibQr(user.id));
    return map;
  }, [users]);

  if (users.length === 0) return null;

  const doc = (
    <Document>
      {users.map((user) => (
        <BibPage
          key={user.id}
          user={user}
          qrDataUrl={qrByUserId.get(user.id) ?? ""}
          edition={edition}
        />
      ))}
    </Document>
  );

  return (
    <PDFDownloadLink document={doc} fileName="dossards-bulk.pdf">
      {({ loading }) => (
        <Button
          size="sm"
          variant="outline"
          colorPalette="primary"
          loading={loading}
          loadingText="Génération…"
        >
          <LuDownload /> Dossards ({users.length})
        </Button>
      )}
    </PDFDownloadLink>
  );
}
