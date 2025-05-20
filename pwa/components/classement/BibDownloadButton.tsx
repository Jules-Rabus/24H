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
import { datamatrix } from "@bwip-js/browser";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  surname?: string | null;
};

const s = StyleSheet.create({
  page: { padding: 24, justifyContent: "center", alignItems: "center" },
  bib: {
    width: "100%",
    height: "100%",
    border: "2pt solid black",
    justifyContent: "space-between",
    alignItems: "center",
  },
  number: { fontSize: 72, fontWeight: "bold" },
  name: { fontSize: 32 },
  qr: { width: 120, height: 120 },
});
const generateQr = (data: any) => {
  const canvas = document.createElement("canvas");
  datamatrix(canvas, {
    bcid: "datamatrix",
    text: JSON.stringify(data),
    scale: 7,
  });
  return canvas.toDataURL("image/png");
};

export default function BibDownloadButton({ user }: { user: User }) {
  const qr = generateQr({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    surname: user.surname,
  });

  const displayName = user.surname || `${user.firstName} ${user.lastName}`;

  const doc = (
    <Document>
      <Page size="A5" orientation="landscape" style={s.page}>
        <View style={s.bib}>
          <Text style={s.number}>{user.id}</Text>
          <Text style={s.name}>{displayName}</Text>
          <Image style={s.qr} src={qr} />
        </View>
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink
      document={doc}
      fileName={`${user.id}-${user.firstName}-${user.lastName}.pdf`}
      className="btn btn-outline btn-sm"
    >
      {({ loading }) => (loading ? "Chargement…" : "Télécharger le dossard")}
    </PDFDownloadLink>
  );
}
