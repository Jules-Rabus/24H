import {
  fetchHydra as baseFetchHydra,
  hydraDataProvider as baseHydraDataProvider,
  useIntrospection
} from "@api-platform/admin";
import {parseHydraDocumentation} from "@api-platform/api-doc-parser";
import {API_AUTH_PATH, ENTRYPOINT} from "../../config/entrypoint";
import { jwtDecode } from "jwt-decode";

const getHeaders = () =>
  localStorage.getItem("token")
    ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
    : {};

const getAccessToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = jwtDecode(token);
  const now = Math.floor(Date.now() / 1000);

  if (decoded.exp && decoded.exp < now) {
    localStorage.removeItem("token");
    return null;
  }

  return token;
}

const fetchHydra = (url, options = {}) =>
  console.log(options, ...options);
  baseFetchHydra(url, {
    ...options,
    headers: getHeaders,
  });

const RedirectToLogin = () => {
  const introspect = useIntrospection();

  if (localStorage.getItem("token")) {
    introspect();
    return <></>;
  }
  return <Navigate to="/login" />;
};

const apiDocumentationParser = (setRedirectToLogin) => async () => {
  try {
    setRedirectToLogin(false);
    return await parseHydraDocumentation(ENTRYPOINT, { headers: getHeaders });
  } catch (result) {
    const { api, response, status } = result;
    if (status !== 401 || !response) {
      throw result;
    }

    localStorage.removeItem("token");
    setRedirectToLogin(true);

    return { api, response, status };
  }
};

const dataProvider = (setRedirectToLogin) =>
  baseHydraDataProvider({
    entrypoint: ENTRYPOINT,
    httpClient: fetchHydra,
    apiDocumentationParser: apiDocumentationParser(setRedirectToLogin),
  });

const authProvider = {
  login: async ({username, password}: { username: string; password: string }) => {
    const request = new Request(API_AUTH_PATH, {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    const response = await fetch(request);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }

    const auth = await response.json();
    localStorage.setItem("token", auth.token);
  },
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },
  checkAuth: () => getAccessToken() ? Promise.resolve() : Promise.reject(),
  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401) {
      localStorage.removeItem("token");
      return Promise.reject();
    }
    else if (status === 403) {
      return Promise.reject();
    }

    return Promise.resolve();
  },
  getPermissions: () => Promise.resolve(""),
};

export { dataProvider, RedirectToLogin, authProvider };
