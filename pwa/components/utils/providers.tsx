import React from "react";
import {
  fetchHydra as baseFetchHydra,
  hydraDataProvider as baseHydraDataProvider,
  HydraHttpClientResponse,
  useIntrospection
} from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { API_AUTH_PATH, ENTRYPOINT } from "../../config/entrypoint";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

// Ajoute le header Authorization avec le token (s'il existe)
export const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found in localStorage");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

// Vérifie la validité du token en le décodant
export const getAccessToken = () => {
  const token = localStorage.getItem("token");
  console.log("Token from localStorage:", token);
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

// Étend la fonction de fetch en y ajoutant nos headers personnalisés
export const fetchHydra = (
  url: string | URL,
  options: any = {}
): Promise<HydraHttpClientResponse> => {
  return baseFetchHydra(new URL(url), {
    ...options,
    headers: {
      ...options.headers,
      ...getHeaders(),
    },
  });
};

// Composant de redirection vers la page /login
export const RedirectToLogin = () => {
  const introspect = useIntrospection();

  // Si un token est présent, on déclenche une introspection et on ne redirige pas
  if (localStorage.getItem("token")) {
    introspect();
    return <></>;
  }
  // Sinon rediriger vers /login
  return <Navigate to="/login" />;
};

// Personnalise le parseur de documentation Hydra pour gérer le code 401 et effacer le token expiré
export const apiDocumentationParser = (setRedirectToLogin: (value: boolean) => void) => async () => {
  try {
    setRedirectToLogin(false);
    return await parseHydraDocumentation(ENTRYPOINT, { headers: getHeaders() });
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

// Initialise le dataProvider Hydra en y intégrant le fetch personnalisé et le parser
export const dataProvider = (setRedirectToLogin: (value: boolean) => void) =>
  baseHydraDataProvider({
    entrypoint: ENTRYPOINT,
    httpClient: fetchHydra,
    apiDocumentationParser: apiDocumentationParser(setRedirectToLogin),
    useEmbedded: false,
  });

// Implémente l’authentification par token pour HydraAdmin
export const authProvider = {
  // Authentification : envoi de l’email (username) et du mot de passe vers l’API d’authentification
  login: async ({ username, password }: { username: string; password: string }) => {
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
    console.log("Token saved in localStorage:", auth.token);
    return Promise.resolve();
  },

  // Déconnexion : suppression du token
  logout: () => {

    localStorage.removeItem("token");
    return Promise.resolve();
  },

  // Vérifie que le token est encore disponible et valide
  checkAuth: () =>
    getAccessToken() ? Promise.resolve() : Promise.reject(),

  // Gestion des erreurs : en cas de 401 ou 403, supprime le token et rejette la promesse
  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");

      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Ici, on peut renvoyer des permissions spécifiques (vide pour cet exemple)
  getPermissions: () => Promise.resolve(""),
};
