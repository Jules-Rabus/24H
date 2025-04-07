import {
  EditGuesser,
  InputGuesser,
  ListGuesser,
  FieldGuesser,
  ShowGuesser,
} from '@api-platform/admin';

import {TextField, DateField, Datagrid, ReferenceManyField, ReferenceField } from 'react-admin';

const RunsList = (props: any) => (
  <ListGuesser {...props}>
    <DateField source="startDate" showTime label="Date de début" />
    <DateField source="endDate" showTime label="Date de fin" />
    <FieldGuesser source="inProgressParticipantsCount" label="Nombre de coureurs en cours" />
    <FieldGuesser source="finishedParticipantsCount" label="Nombre de coureurs arrivés" />
  </ListGuesser>
);

const RunShow = (props: any) => (
  <ShowGuesser {...props}>
    <DateField source="startDate" showTime label="Date de début" />
    <DateField source="endDate" showTime label="Date de fin" />
    <FieldGuesser source="inProgressParticipantsCount" label="Nombre de coureurs en cours" />
    <FieldGuesser source="finishedParticipantsCount" label="Nombre de coureurs arrivés" />
    <ReferenceManyField reference="participations" target="run" label="Participants">
      <Datagrid bulkActionButtons={false}>
        <ReferenceField source="user" reference="users">
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="surname" />
        </ReferenceField>
        <DateField source="arrivalTime" showTime label="Date d'arrivée" />
        <TextField source="status" label="Statut" />
      </Datagrid>
    </ReferenceManyField>
    <DateField showTime source="createdAt" label="Créé le" />
    <DateField showTime source="updatedAt" label="Mis à jour le" />
  </ShowGuesser>
);

const RunEdit = (props: any) => (
  <EditGuesser {...props}>
    <InputGuesser source="startDate" />
    <InputGuesser source="endDate" />
  </EditGuesser>
);

export { RunsList, RunShow, RunEdit };
