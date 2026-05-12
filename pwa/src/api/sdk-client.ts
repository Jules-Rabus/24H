/**
 * Initialise le client hey-api avec la baseURL et les cookies HttpOnly.
 * Le token JWT est envoyé automatiquement via le cookie BEARER.
 */
import { client } from "./generated/client.gen";
import { make401Interceptor } from "./auth-interceptor";
import { getCsrfToken, clearCsrfToken } from "./csrf";

// In mock mode use same-origin so the MSW service worker (registered on the
// Next dev origin) can intercept every API call.
const isMock = process.env.NEXT_PUBLIC_API_MOCK === "1";
const baseURL = isMock
  ? ""
  : (process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost");

client.setConfig({
  baseURL,
  throwOnError: true,
  withCredentials: !isMock,
});

// Inject CSRF token on /race_medias mutations (POST/PATCH/DELETE).
// GET requests are public and don't need CSRF — including them would force the
// /accueil mobile page (anonymous, no /csrf-token endpoint mock) to fetch a
// token it can't get.
client.instance.interceptors.request.use(async (config) => {
  const method = (config.method ?? "get").toLowerCase();
  const isMutation =
    method === "post" || method === "patch" || method === "delete";
  if (
    isMutation &&
    config.url?.includes("/race_medias") &&
    typeof window !== "undefined"
  ) {
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
