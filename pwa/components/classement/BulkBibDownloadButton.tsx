"use client";

import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { qrcode } from "@bwip-js/browser";
import { Button } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";

interface BibUser {
  id: number;
  firstName: string;
  lastName: string;
  surname?: string | null;
}

const s = StyleSheet.create({
  page: { padding: 24, justifyContent: "center", alignItems: "center" },
  bib: {
    width: "100%",
    height: "100%",
    border: "3pt solid black",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  edition: { fontSize: 32, fontWeight: "bold" },
  number: { fontSize: 100, fontWeight: "bold" },
  name: { fontSize: 40 },
  qr: { width: 160, height: 160 },
});

const generateQr = (userId: number) => {
  const canvas = document.createElement("canvas");
  qrcode(canvas, {
    bcid: "qrcode",
    text: JSON.stringify({ originId: userId }),
    scale: 8,
  });
  return canvas.toDataURL("image/png");
};

export default function BulkBibDownloadButton({
  users,
  edition,
}: {
  users: BibUser[];
  edition?: number;
}) {
  if (users.length === 0) return null;

  const doc = (
    <Document>
      {users.map((user) => {
        const qr = generateQr(user.id);
        const displayName =
          user.surname || `${user.firstName} ${user.lastName}`;
        return (
          <Page key={user.id} size="A5" orientation="landscape" style={s.page}>
            <View style={s.bib}>
              {edition != null && (
                <Text style={s.edition}>
                  {edition} / {user.id}
                </Text>
              )}
              <Text style={s.number}>{user.id}</Text>
              <Text style={s.name}>{displayName}</Text>
              <Image style={s.qr} src={qr} />
            </View>
          </Page>
        );
      })}
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
