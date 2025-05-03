import Head from "next/head";
import React, { useState } from "react";
import { HydraAdmin, ResourceGuesser } from "@api-platform/admin";
import {
  dataProvider,
  authProvider,
  RedirectToLogin,
} from "../utils/providers";
import i18nProvider from "../utils/i18nProvider";
import { UserEdit, UsersList, UserShow } from "../entities/users";
import { RunsList, RunEdit, RunShow, RunCreate } from "../entities/runs";
import {
  ParticipationsList,
  ParticipationsShow,
  ParticipationsCreate,
  ParticipationsEdit,
} from "../entities/participations";
import { ENTRYPOINT } from "../../config/entrypoint";

const Admin = () => {
  const [redirectToLogin, setRedirectToLogin] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>Course 24H</title>
      </Head>

      <HydraAdmin
        dataProvider={dataProvider(setRedirectToLogin)}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        entrypoint={ENTRYPOINT}
      >
        {redirectToLogin ? (
          <RedirectToLogin />
        ) : (
          <>
            <ResourceGuesser
              name="runs"
              list={RunsList}
              show={RunShow}
              edit={RunEdit}
              create={RunCreate}
            />
            <ResourceGuesser
              name="participations"
              list={ParticipationsList}
              show={ParticipationsShow}
              create={ParticipationsCreate}
              edit={ParticipationsEdit}
            />
            <ResourceGuesser
              name="users"
              list={UsersList}
              show={UserShow}
              edit={UserEdit}
            />
          </>
        )}
      </HydraAdmin>
    </>
  );
};

export default Admin;
