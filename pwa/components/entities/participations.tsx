import React from "react";
import {
  ListGuesser,
  CreateGuesser,
  EditGuesser,
  ShowGuesser,
  FieldGuesser,
} from "@api-platform/admin";
import {
  DateField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextField,
  DateTimeInput,
  TextInput,
  Pagination,
} from "react-admin";

const PaginationList = () => (
  <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
);

export const ParticipationsList = (props: any) => (
  <ListGuesser
    pagination={<PaginationList />}
    filters={[
      <TextInput key="user.firstName" source="user.firstName" label="Prénom" />,
      <TextInput key="user.lastName" source="user.lastName" label="Nom" />,
      <TextInput key="user.surname" source="user.surname" label="Surnom" />,
      <TextInput key="user.id" source="user.id" label="N° dossard" />,
      <DateTimeInput
        key="run.startDate[after]"
        source="run.startDate[after]"
        label="Date de début du run ≥"
      />,
      <DateTimeInput
        key="run.startDate[before]"
        source="run.startDate[before]"
        label="Date de début du run ≤"
      />,
    ]}
    {...props}
  >
    <ReferenceField source="run" reference="runs">
      <DateField
        source="startDate"
        showTime
        label="Date de début"
        options={{
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }}
      />
    </ReferenceField>
    <ReferenceField source="user" reference="users">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="surname" />
    </ReferenceField>
    <DateField
      source="arrivalTime"
      showTime
      label="Date d'arrivée"
      options={{
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }}
    />
    <FieldGuesser source="status" />
  </ListGuesser>
);

export const ParticipationsShow = (props: any) => (
  <ShowGuesser {...props}>
    <ReferenceField source="run" reference="runs">
      <DateField
        source="startDate"
        showTime
        label="Date de début"
        options={{
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }}
      />
    </ReferenceField>
    <ReferenceField source="user" reference="users">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="surname" />
    </ReferenceField>
    <DateField
      source="arrivalTime"
      showTime
      label="Date d'arrivée"
      options={{
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }}
    />
    <TextField source="status" label="Statut" />
  </ShowGuesser>
);

export const ParticipationsCreate = (props: any) => (
  <CreateGuesser {...props}>
    <ReferenceInput source="user" reference="users">
      <SelectInput
        optionText={(choice: any) =>
          choice.surname
            ? `${choice.originId} - ${choice.firstName} ${choice.lastName} - ${choice.surname}`
            : `${choice.originId} - ${choice.firstName} ${choice.lastName}`
        }
      />
    </ReferenceInput>
    <ReferenceInput source="run" reference="runs">
      <SelectInput
        optionText={(choice: any) =>
          new Date(choice.startDate).toLocaleString(undefined, {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        }
      />
    </ReferenceInput>
  </CreateGuesser>
);

export const ParticipationsEdit = (props: any) => (
  <EditGuesser {...props}>
    <ReferenceInput source="user" reference="users">
      <SelectInput
        optionText={(choice: any) =>
          choice.surname
            ? `${choice.originId} - ${choice.firstName} ${choice.lastName} - ${choice.surname}`
            : `${choice.originId} - ${choice.firstName} ${choice.lastName}`
        }
      />
    </ReferenceInput>
    <ReferenceInput source="run" reference="runs">
      <SelectInput
        optionText={(choice: any) =>
          new Date(choice.startDate).toLocaleString(undefined, {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        }
      />
    </ReferenceInput>
    <DateTimeInput source="arrivalTime" label="Date d'arrivée" />
  </EditGuesser>
);
