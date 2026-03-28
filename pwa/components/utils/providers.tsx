import React from "react";
import {
  fetchHydra as baseFetchHydra,
  hydraDataProvider as baseHydraDataProvider,
  HydraHttpClientResponse,
  useIntrospection,
} from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { API_AUTH_PATH, ENTRYPOINT } from "../../config/entrypoint";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

export const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found in localStorage");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

export const getAccessToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("token");
      return null;
    }
    return token;
  } catch (err) {
    localStorage.removeItem("token");
    return null;
  }
};

export const fetchHydra = (
  url: string | URL,
  options: any = {},
): Promise<HydraHttpClientResponse> => {
  return baseFetchHydra(new URL(url), {
    ...options,
    headers: {
      ...options.headers,
      ...getHeaders(),
    },
  });
};

export const RedirectToLogin = () => {
  const introspect = useIntrospection();

  if (localStorage.getItem("token")) {
    introspect();
    return <></>;
  }
  return <Navigate to="/login" />;
};

export const apiDocumentationParser =
  (setRedirectToLogin: (value: boolean) => void) => async () => {
    try {
      setRedirectToLogin(false);
      return await parseHydraDocumentation(ENTRYPOINT, {
        headers: getHeaders(),
      });
    } catch (result: any) {
      const { api, response, status } = result;
      if (status !== 401 || !response) {
        console.error("Error fetching API documentation", result);
        throw result;
      }

      localStorage.removeItem("token");
      setRedirectToLogin(true);
      return { api, response, status };
    }
  };

export const dataProvider = (setRedirectToLogin: (value: boolean) => void) =>
  baseHydraDataProvider({
    entrypoint: ENTRYPOINT,
    httpClient: fetchHydra,
    apiDocumentationParser: apiDocumentationParser(setRedirectToLogin),
    useEmbedded: false,
  });

export const authProvider = {
  login: async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
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
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },

  checkAuth: () => (getAccessToken() ? Promise.resolve() : Promise.reject()),

  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");

      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(""),
};
