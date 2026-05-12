"use client";

import { useMemo } from "react";
import { PDFDownloadLink, Document } from "@react-pdf/renderer";
import { Button } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import { BibPage, type BibUser } from "./BibPage";
import { generateBibQr } from "./generateBibQr";

export default function BibDownloadButton({
  user,
  edition,
}: {
  user: BibUser;
  edition?: number;
}) {
  // QR data-URL : memoised so we don't redraw the canvas on every render.
  const qr = useMemo(() => generateBibQr(user.id), [user.id]);

  const doc = (
    <Document>
      <BibPage user={user} qrDataUrl={qr} edition={edition} />
    </Document>
  );

  return (
    <PDFDownloadLink
      document={doc}
      fileName={`dossard-${user.id}-${user.firstName}-${user.lastName}.pdf`}
    >
      {({ loading }) => (
        <Button
          size="sm"
          variant="outline"
          colorPalette="primary"
          loading={loading}
          loadingText="Chargement…"
        >
          <LuDownload /> Dossard PDF
        </Button>
      )}
    </PDFDownloadLink>
  );
}
