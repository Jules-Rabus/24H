import {
  EditGuesser,
  InputGuesser,
  ListGuesser,
  FieldGuesser,
  ShowGuesser,
  CreateGuesser,
} from "@api-platform/admin";

import {
  TextField,
  DateField,
  Datagrid,
  ReferenceManyField,
  ReferenceField,
  Pagination,
} from "react-admin";
import React from "react";

const PaginationList = () => (
  <Pagination rowsPerPageOptions={[10, 25, 50, 100, 200]} />
);

export const RunsList = (props: any) => (
  <ListGuesser pagination={<PaginationList />} {...props}>
    <DateField source="startDate" showTime label="Date de début" />
    <DateField source="endDate" showTime label="Date de fin" />
    <FieldGuesser
      source="inProgressParticipantsCount"
      label="Nombre de coureurs en cours"
    />
    <FieldGuesser
      source="finishedParticipantsCount"
      label="Nombre de coureurs arrivés"
    />
  </ListGuesser>
);

export const RunShow = (props: any) => (
  <ShowGuesser {...props}>
    <DateField source="startDate" showTime label="Date de début" />
    <DateField source="endDate" showTime label="Date de fin" />
    <FieldGuesser
      source="inProgressParticipantsCount"
      label="Nombre de coureurs en cours"
    />
    <FieldGuesser
      source="finishedParticipantsCount"
      label="Nombre de coureurs arrivés"
    />
    <ReferenceManyField
      reference="participations"
      target="run"
      label="Participants"
      perPage={50}
    >
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

export const RunCreate = (props: any) => (
  <CreateGuesser {...props}>
    <InputGuesser source="startDate" />
    <InputGuesser source="endDate" />
  </CreateGuesser>
);

export const RunEdit = (props: any) => (
  <EditGuesser {...props}>
    <InputGuesser source="startDate" />
    <InputGuesser source="endDate" />
  </EditGuesser>
);
