import {
  FileField,
  FileInput,
  ImageField,
  Pagination,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextField,
  TextInput,
} from "react-admin";
import { CreateGuesser, ListGuesser, ShowGuesser } from "@api-platform/admin";
import React from "react";

const PaginationList = () => (
  <Pagination rowsPerPageOptions={[25, 50, 100, 200]} />
);

export const MediasCreate = () => (
  <CreateGuesser>
    <FileInput source="file">
      <FileField source="src" title="title" />
    </FileInput>
    <ReferenceInput source="runner" reference="users">
      <SelectInput
        optionText={(choice: any) =>
          choice.surname
            ? `${choice.originId} - ${choice.firstName} ${choice.lastName} - ${choice.surname}`
            : `${choice.originId} - ${choice.firstName} ${choice.lastName}`
        }
      />
    </ReferenceInput>
  </CreateGuesser>
);

export const MediasList = (props: any) => (
  <ListGuesser
    pagination={<PaginationList />}
    filters={[
      <TextInput key="user.firstName" source="user.firstName" label="Prénom" />,
      <TextInput key="user.lastName" source="user.lastName" label="Nom" />,
      <TextInput key="user.surname" source="user.surname" label="Surnom" />,
      <TextInput key="user.id" source="user.id" label="N° dossard" />,
    ]}
    {...props}
  >
    <ImageField source="filePath" label="Image" />
    <ReferenceField source="runner" reference="users">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="surname" />
    </ReferenceField>
  </ListGuesser>
);

export const MediasShow = (props: any) => (
  <ShowGuesser {...props}>
    <ImageField source="filePath" label="Image" />
    <ReferenceField source="runner" reference="users">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="surname" />
    </ReferenceField>
  </ShowGuesser>
);
