"use client";

import React from "react";
import {
  fetchHydra as baseFetchHydra,
  hydraDataProvider as baseHydraDataProvider,
  HydraHttpClientResponse,
  useIntrospection,
} from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { API_AUTH_PATH, ENTRYPOINT } from "../../config/entrypoint";
import { Navigate } from "react-router-dom";

// Cookie BEARER is sent automatically by the browser — no Authorization header needed
export const getHeaders = (): Record<string, string> => ({});

export const fetchHydra = (
  url: string | URL,
  options: any = {},
): Promise<HydraHttpClientResponse> => {
  return baseFetchHydra(new URL(url), {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  });
};

export const RedirectToLogin = () => {
  const introspect = useIntrospection();
  const [isAuth, setIsAuth] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    fetch(`${ENTRYPOINT}/me`, { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          setIsAuth(true);
          introspect();
        } else {
          setIsAuth(false);
        }
      })
      .catch(() => setIsAuth(false));
  }, [introspect]);

  if (isAuth === null) return <></>;
  if (isAuth) return <></>;
  return <Navigate to="/login" />;
};

export const apiDocumentationParser =
  (setRedirectToLogin: (value: boolean) => void) => async () => {
    try {
      setRedirectToLogin(false);
      return await parseHydraDocumentation(ENTRYPOINT, {
        headers: getHeaders(),
        credentials: "include",
      });
    } catch (result: any) {
      const { api, response, status } = result;
      if (status !== 401 || !response) {
        console.error("Error fetching API documentation", result);
        throw result;
      }
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
    const response = await fetch(API_AUTH_PATH, {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "include",
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return Promise.resolve();
  },

  logout: async () => {
    await fetch(`${ENTRYPOINT}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    return Promise.resolve();
  },

  checkAuth: async () => {
    const response = await fetch(`${ENTRYPOINT}/me`, {
      credentials: "include",
    });
    if (!response.ok) return Promise.reject();
    return Promise.resolve();
  },

  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(""),
};
