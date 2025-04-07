import {
  ListGuesser,
  ShowGuesser,
  EditGuesser,
  InputGuesser,
  FieldGuesser
} from '@api-platform/admin';

import {
  DateField,
  SelectInput,
  TextField,
  ReferenceManyField,
  Datagrid,
  ReferenceField,
  FunctionField,
  EditButton,
  CreateButton,
  DeleteButton,
  ReferenceArrayInput,
  SelectArrayInput
} from 'react-admin';

import { useRecordContext } from 'react-admin';
import { pdf, Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {datamatrix, toCanvas} from "@bwip-js/browser";
import { useEffect, useState } from 'react';

const bibStyles = StyleSheet.create({
  page: { padding: 10, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eeeeee' },
  bib: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', border: '2px solid #000000' },
  number: { fontSize: 100, fontWeight: 'bold' },
  name: { fontSize: 40, marginTop: 10 },
  qr: { width: 150, height: 150, marginTop: 20 },
});

const BibDocument = ({ user }: { user: any }) => {
  const displayName = user.surname || `${user.firstName} ${user.lastName}`;
  return (
    <Document>
      <Page size="A4" style={bibStyles.page}>
        <View style={bibStyles.bib}>
          <Text style={bibStyles.number}>{user.originId}</Text>
          <Text style={bibStyles.name}>{displayName}</Text>
          <Image style={bibStyles.qr} src={user.qrCodeBase64} alt="QR Code" />
        </View>
      </Page>
    </Document>
  );
};

const generateQr = (data: any) => {
  const canvas = document.createElement('canvas');
  datamatrix(canvas, {
      bcid: 'datamatrix',
      text: JSON.stringify(data),
      scale: 7
    });
  return canvas.toDataURL('image/png');
};

const PdfDownloadLinkButtonWrapper = () => {
  const record = useRecordContext();
  if(!record) return null;

  const data = {
    originId: record.originId,
    firstName: record.firstName,
    lastName: record.lastName,
    surname: record.surname
  };
  const qr = generateQr(data);

  return (
    <PDFDownloadLink document={<BibDocument user={{ ...record, qrCodeBase64: qr }} />} fileName={`${record.originId}.pdf`}>
      {({ loading }) => (loading ? 'Chargement...' : 'Télécharger Dossard')}
    </PDFDownloadLink>
  );
};

const exporterBibZip = async (records: any[]) => {
  const zip = new JSZip();
  await Promise.all(records.map(async record => {
    const canvas = document.createElement('canvas');
    await toCanvas(canvas, { bcid: 'qrcode', text: record.originId.toString(), scale: 3 });
    const qr = canvas.toDataURL('image/png');
    const blob = await pdf(<BibDocument user={{ ...record, qrCodeBase64: qr }} />).toBlob();
    zip.file(`${record.originId}.pdf`, blob);
  }));
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'dossards.zip');
};

export const UserEdit = (props: any) => (
  <EditGuesser {...props}>
    <InputGuesser source="firstName" label="Prénom" />
    <InputGuesser source="lastName" label="Nom" />
    <InputGuesser source="surname" label="Surnom" />
    <InputGuesser source="email" label="Email" />
    <InputGuesser source="organization" label="Organisation" />
    <SelectInput source="roles" choices={[
      { id: 'ROLE_USER', name: 'ROLE_USER' },
      { id: 'ROLE_ADMIN', name: 'ROLE_ADMIN' },
    ]} />
    <ReferenceArrayInput source="participations" reference="participations" label="Participations">
      <SelectArrayInput optionText={(choice: any) =>
        choice.arrivalTime
          ? new Date(choice.arrivalTime).toLocaleString(undefined, {
              month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            })
          : `ID ${choice.id}`
      } />
    </ReferenceArrayInput>
  </EditGuesser>
);

export const UsersList = (props: any) => (
  <ListGuesser {...props} exporter={exporterBibZip}>
    <TextField source="originId" label="N° dossard" />
    <FieldGuesser source="firstName" label="Prénom" />
    <FieldGuesser source="lastName" label="Nom" />
    <FieldGuesser source="surname" label="Surnom" />
    <FieldGuesser source="email" label="Email" />
    <FieldGuesser source="organization" label="Organisation" />
    <FunctionField label="Dossard PDF" render={(record: any) => <PdfDownloadCell record={record} />} />
  </ListGuesser>
);

const PdfDownloadCell = ({ record }: { record: any }) => {
  const [qr, setQr] = useState<string>('');
  useEffect(() => {
    const canvas = document.createElement('canvas');
    toCanvas(canvas, { bcid: 'qrcode', text: record.originId.toString(), scale: 3 })
  }, [record]);
  if (!qr) return null;
  return (
    <PDFDownloadLink document={<BibDocument user={{ ...record, qrCodeBase64: qr }} />} fileName={`${record.originId}.pdf`}>
      {({ loading }) => (loading ? '...' : 'PDF')}
    </PDFDownloadLink>
  );
};

export const UserShow = (props: any) => {
  const record = useRecordContext();
  return (
    <ShowGuesser {...props}>
      <TextField source="originId" label="N° dossard" />
      <FieldGuesser source="firstName" label="Prénom" />
      <FieldGuesser source="lastName" label="Nom" />
      <FieldGuesser source="surname" label="Surnom" />
      <FieldGuesser source="email" label="Email" />
      <FieldGuesser source="organization" label="Organisation" />
      <FunctionField label="Nombre de participations" render={record => record.participations?.length || 0} />
      <FunctionField label="Nombre de km" render={record => (record.participations?.length || 0) * 4} />
      <ReferenceManyField reference="participations" target="user" label="Participations">
        <CreateButton resource="participations" label="Ajouter participation" />
        <Datagrid>
          <ReferenceField source="run" reference="runs" label="Run">
            <DateField source="startDate" showTime label="Date début" />
          </ReferenceField>
          <DateField source="arrivalTime" showTime label="Arrivée" />
          <TextField source="status" label="Statut" />
          <EditButton />
          <DeleteButton />
        </Datagrid>
      </ReferenceManyField>
      <DateField showTime source="createdAt" label="Créé le" />
      <DateField showTime source="updatedAt" label="Mis à jour le" />
      <PdfDownloadLinkButtonWrapper />
    </ShowGuesser>
  );
};
