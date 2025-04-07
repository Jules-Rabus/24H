import {
  EditGuesser,
  InputGuesser,
} from '@api-platform/admin';

import { EmailField } from 'react-admin';

const UsersEdit = (props) => (
  <EditGuesser {...props}>
    <InputGuesser source="firstName" />
    <InputGuesser source="lastName" />
    <InputGuesser source="email" />
    <InputGuesser source="organization" />

    <InputGuesser source="roles" />
  </EditGuesser>
)

export default UsersEdit;
