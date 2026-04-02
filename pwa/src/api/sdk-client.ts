/**
 * Initialise le client hey-api avec la baseURL et les cookies HttpOnly.
 * Le token JWT est envoyé automatiquement via le cookie BEARER.
 */
import { client } from "./generated/client.gen";
import { make401Interceptor } from "./auth-interceptor";

const baseURL = process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost";

client.setConfig({
  baseURL,
  throwOnError: true,
  withCredentials: true,
});

client.instance.interceptors.response.use(
  undefined,
  make401Interceptor(baseURL),
);

export { client };
