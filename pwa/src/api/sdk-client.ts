/**
 * Initialise le client hey-api avec la baseURL et les cookies HttpOnly.
 * Le token JWT est envoyé automatiquement via le cookie BEARER.
 */
import { client } from "./generated/client.gen";
import { make401Interceptor } from "./auth-interceptor";
import { getCsrfToken, clearCsrfToken } from "./csrf";

const baseURL = process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost";

client.setConfig({
  baseURL,
  throwOnError: true,
  withCredentials: true,
});

// Inject CSRF token on /race_medias requests (GET collection + POST)
client.instance.interceptors.request.use(async (config) => {
  if (config.url?.includes("/race_medias") && typeof window !== "undefined") {
    const token = await getCsrfToken();
    config.headers.set("X-XSRF-TOKEN", token);
  }
  return config;
});

// Clear cached CSRF token on 403 so the next request fetches a fresh one
client.instance.interceptors.response.use(undefined, (error: unknown) => {
  const axiosError = error as { response?: { status?: number } };
  if (axiosError?.response?.status === 403) {
    clearCsrfToken();
  }
  return Promise.reject(error);
});

client.instance.interceptors.response.use(
  undefined,
  make401Interceptor(baseURL),
);

export { client };
