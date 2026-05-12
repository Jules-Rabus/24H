"use client";

import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

/**
 * Bib (dossard) layout — A5 landscape with:
 * - "Défi des 24h" / "ASPO" stacked in the top-left and top-right corners
 * - centred runner identity: first name / last name on 2 lines + dossard
 *   number + QR code stacked vertically, with surname under the QR
 * - edition year in the bottom-right corner
 */

export interface BibUser {
  id: number;
  firstName: string;
  lastName: string;
  surname?: string | null;
}

const styles = StyleSheet.create({
  page: { padding: 18 },
  bib: {
    width: "100%",
    height: "100%",
    border: "3pt solid black",
    position: "relative",
    padding: 24,
  },
  corner: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "bold",
  },
  cornerTopLeft: { top: 16, left: 18 },
  cornerTopRight: { top: 16, right: 18, textAlign: "right" },
  cornerYear: { fontSize: 14, fontWeight: "bold", marginTop: 2 },

  // Central runner identity block — vertically centred, includes the QR.
  centerBlock: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  firstName: { fontSize: 30, fontWeight: "bold", textAlign: "center" },
  lastName: { fontSize: 30, fontWeight: "bold", textAlign: "center" },
  number: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 1,
  },
  qr: { width: 110, height: 110, marginTop: 14 },
  surname: {
    marginTop: 14,
    fontSize: 22,
    fontStyle: "italic",
    fontWeight: "bold",
    textAlign: "center",
  },

  // Logos in the bottom corners.
  logoBottomLeft: {
    position: "absolute",
    bottom: 18,
    left: 22,
    width: 90,
    height: 90,
  },
  logoBottomRight: {
    position: "absolute",
    bottom: 18,
    right: 22,
    width: 90,
    height: 90,
  },
});

export function BibPage({
  user,
  qrDataUrl,
  edition,
}: {
  user: BibUser;
  qrDataUrl: string;
  edition?: number;
}) {
  return (
    <Page size="A5" orientation="landscape" style={styles.page}>
      <View style={styles.bib}>
        {/* Top-left corner : Défi des 24h + édition */}
        <View style={[styles.corner, styles.cornerTopLeft]}>
          <Text>Défi des 24h</Text>
          {edition != null && <Text style={styles.cornerYear}>{edition}</Text>}
        </View>

        {/* Top-right corner */}
        <Text style={[styles.corner, styles.cornerTopRight]}>ASPO</Text>

        {/* Centre — name, number, QR, surname */}
        <View style={styles.centerBlock}>
          <Text style={styles.firstName}>{user.firstName}</Text>
          <Text style={styles.lastName}>{user.lastName}</Text>
          <Text style={styles.number}>{user.id}</Text>
          {/* react-pdf <Image> does not accept an alt prop — disable the JSX rule */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.qr} src={qrDataUrl} />
          {user.surname && (
            <Text style={styles.surname}>«&nbsp;{user.surname}&nbsp;»</Text>
          )}
        </View>

        {/* Bottom-left : Défi des 24h logo */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logoBottomLeft} src="/logo.png" />

        {/* Bottom-right : ASPO logo */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logoBottomRight} src="/ASPO.jpeg" />
      </View>
    </Page>
  );
}
