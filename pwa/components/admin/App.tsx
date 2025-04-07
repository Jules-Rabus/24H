import Head from "next/head";
import { useState } from "react";
import { Resource} from "react-admin";
import {HydraAdmin, ResourceGuesser} from "@api-platform/admin";

import { dataProvider, authProvider } from "../utils/providers";

import UsersEdit from "../entities/users";

const Admin = () => {
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  return (
    <>
      <Head>
        <title>Course 24H</title>
      </Head>

      <HydraAdmin
        dataProvider={dataProvider(setRedirectToLogin)}
        authProvider={authProvider}
        entrypoint={window.origin}
      >
        <ResourceGuesser name="runs" />
        <ResourceGuesser name="users" edit={UsersEdit} />
      </HydraAdmin>
    </>
  );
};
export default Admin;
